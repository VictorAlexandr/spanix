/**
 * As execuções do job `nightly-scan` — fonte única da página.
 *
 * O fio condutor: a landing inteira mostra as MESMAS execuções. O código da
 * seção 02 as nomeia (`run=`), a saída do terminal é o bloco que a última
 * imprime, e o painel da seção 03 desenha qualquer uma delas. Números em três
 * arquivos divergem na primeira edição — já tinham divergido antes. Moram aqui.
 */

/* ── o nome do job ─────────────────────────────────────────────────────────
   Um lugar só, usado em quatro pontos da página. `watch(stream, run=...)`
   recebe um rótulo porque é ele que torna esta rodada comparável com ela mesma
   na semana que vem — sem nome não existe deriva pra medir, e a deriva é o
   argumento do produto. `nightly-scan` diz as duas coisas: recorre toda noite
   (por isso há histórico) e é uma varredura (por isso há WebFetch demais). */
export const RUN_NOME = "nightly-scan";

/* ── quem manda em cada cor ────────────────────────────────────────────────
   Um matiz por trabalho, e nenhum trabalho com dois matizes.

     carmim    CALOR e desperdício — o caminho quente, a deriva subindo.
               Passou por mint (errado: verde diz "tudo certo" e estava
               marcando o problema), depois por laranja, e chegou no carmim
               que já existia no tema como `--color-crim`.
     rosa      REDE e ferramenta — I/O, o agente alcançando o mundo fora dele.
     mint      (no CSS) a marca e o DINHEIRO. Todo valor em dólar, e nada além.
     violeta   (no painel) agente, e atmosfera no resto da página.

   A ferramenta não pode ser azul, e isso é geometria de matiz, não gosto:
   TODO azul testado reprovou contra o violeta do agente — 11,5 · 14,3 · 15,0
   em visão normal, contra o piso de 15. São vizinhos na roda, e as duas
   categorias mais frequentes da linha do tempo seriam as mais parecidas.

   Verde também não: qualquer lima ou ácido cai contra o mint (13,6 e 13,7).
   Aqui vale um aviso pra quem mexer nisto depois — o validador compara, por
   padrão, só os pares VIZINHOS na ordem da lista. O ácido da faixa corrida
   parecia aprovado porque nunca ficava ao lado do mint; com `--pairs all` ele
   reprova. Sempre rodar com todos os pares.

   Sobrou o rosa: ΔE 25,3 contra o violeta e 27+ contra o mint, a maior folga
   em visão normal de todas as candidatas. Sob daltonismo ele fica em 8,1 —
   no piso, e legal só porque a distinção NÃO depende da cor: cada barra tem
   o avatar de seta e o selo escrito `tool` ao lado. */
export const QUENTE = "#FF2D55";
export const REDE = QUENTE;

/* ── um span da linha do tempo ─────────────────────────────────────────────
   AGENTE ou FERRAMENTA. Agente é quem DECIDE: tem contexto próprio, gasta
   turns, pode gerar outros. Ferramenta é o que ele chama. Confundir os dois
   era o defeito que a pergunta do cliente expôs, e a distinção agora vive em
   três canais — cor da barra, selo escrito e texto do inspetor. */
export type Tipo = "agent" | "tool";

export type Span = {
  nome: string;
  tipo: Tipo;
  /** segundo em que começa */
  ini: number;
  /** duração em segundos */
  dur: number;
  /** profundidade na árvore, para o recuo do rótulo */
  nivel: number;
  custo: number;
  /** o que o span é, na leitura de baixo */
  nota: string;
  /** parte do laço que consumiu a execução */
  quente?: boolean;
};

/* ── o construtor de execuções ─────────────────────────────────────────────
   Cada execução tem a MESMA forma e muda numa coisa só: quantas voltas o laço
   deu. E é essa única variável que carrega o argumento do produto — o laço não
   apareceu pronto, ele CRESCEU. A #478 repete o `WebFetch` uma vez; a #480,
   duas; a #482, três.

   Clicando de baixo pra cima na lateral, dá pra ver a mesma tarefa ganhando
   uma volta a mais e a conta subindo junto. A deriva deixa de ser um número
   num cartão e vira algo que a pessoa descobre com a própria mão.

   Durações saem da estrutura, não de chute linha a linha. Custos são escalados
   em bloco pra fechar exatamente no total de cada execução — a mesma série que
   a sparkline e o histórico usam, então nada pode divergir. */
const PASSO_LACO = 4.8;
const FETCH_DUR = 4.6;

function montar(repeticoes: number, custoAlvo: number): { dur: number; spans: Span[] } {
  const pIni = 3.3;
  const pDur = repeticoes * PASSO_LACO + 0.4;
  const vIni = pIni + pDur + 0.2;
  const vDur = 4.3;
  const dur = Math.round((vIni + vDur) * 10) / 10;
  const laco = repeticoes > 1;

  const cru: Span[] = [
    { nome: "main", tipo: "agent", ini: 0, dur, nivel: 0, custo: 0.087, nota: "the agent you wrapped" },
    { nome: "Read", tipo: "tool", ini: 0.4, dur: 0.6, nivel: 1, custo: 0.012, nota: "read a local file" },
    { nome: "WebFetch", tipo: "tool", ini: 1.2, dur: 1.2, nivel: 1, custo: 0.022, nota: "first fetch" },
    { nome: "WebFetch", tipo: "tool", ini: 2.5, dur: 0.6, nivel: 1, custo: 0.019, nota: "cached, fast" },
    {
      nome: "research",
      tipo: "agent",
      ini: pIni,
      dur: pDur,
      nivel: 1,
      custo: 0.143,
      nota: "subagent · its own context, its own bill",
      quente: laco,
    },
  ];

  for (let i = 0; i < repeticoes; i++) {
    cru.push({
      nome: "WebFetch",
      tipo: "tool",
      ini: pIni + 0.3 + i * PASSO_LACO,
      dur: FETCH_DUR,
      nivel: 2,
      custo: 0.0893,
      nota: laco ? `same url · attempt ${i + 1} of ${repeticoes}` : "one fetch, no retry",
      quente: laco,
    });
  }

  cru.push(
    { nome: "Read", tipo: "tool", ini: pIni + pDur - 0.5, dur: 0.4, nivel: 2, custo: 0.009, nota: "read a local file" },
    {
      nome: "verify",
      tipo: "agent",
      ini: vIni,
      dur: vDur,
      nivel: 1,
      custo: 0.09,
      nota: "subagent · its own context, its own bill",
    },
    { nome: "Read", tipo: "tool", ini: vIni + 0.3, dur: 0.5, nivel: 2, custo: 0.006, nota: "read a local file" },
  );

  /* O `main` acumula tudo que roda dentro dele; depois o bloco inteiro é
     escalado pra fechar no total real da execução. */
  const filhos = cru.slice(1).reduce((a, s) => a + s.custo, 0);
  cru[0].custo += filhos;
  const escala = custoAlvo / cru[0].custo;

  return { dur, spans: cru.map((s) => ({ ...s, custo: s.custo * escala })) };
}

/* ── o histórico ───────────────────────────────────────────────────────────
   Sete execuções, da mais antiga para a atual. Custo, turns e voltas do laço
   andam juntos por índice: a tarefa não mudou, o caminho até ela é que ficou
   mais longo. */
export const HISTORICO = [0.21, 0.22, 0.26, 0.33, 0.44, 0.53, 0.65];
export const TURNS = [4, 4, 5, 6, 8, 9, 11];
const LACO = [1, 1, 1, 2, 2, 2, 3];
const ID_ATUAL = 482;

export const EXECUCOES = HISTORICO.map((custo, i) => {
  const { dur, spans } = montar(LACO[i], custo);
  return {
    id: ID_ATUAL - (HISTORICO.length - 1 - i),
    custo,
    turns: TURNS[i],
    repeticoes: LACO[i],
    duracao: dur,
    mensagens: Math.round(TURNS[i] * 4.27),
    tokens: Math.round((custo / 0.65) * 142318),
    spans,
  };
}).reverse();

export type Execucao = (typeof EXECUCOES)[number];

/** A execução aberta por padrão — a mais recente. */
export const ATUAL = EXECUCOES[0];

/** Totais no formato exato que o `Run.summary()` imprime. */
export const RESUMO = {
  id: ATUAL.id,
  quando: "today 03:12",
  duracao: `${ATUAL.duracao.toFixed(1)}s`,
  turns: ATUAL.turns,
  mensagens: ATUAL.mensagens,
  custoFmt: `$${ATUAL.custo.toFixed(4)}`,
  tokensFmt: ATUAL.tokens.toLocaleString("en-US"),
};

/** Marcas do eixo, de 5 em 5 segundos, até onde a execução vai. */
export function eixoDe(dur: number): number[] {
  return Array.from({ length: Math.floor(dur / 5) + 1 }, (_, i) => i * 5);
}

/** Custo por agente numa execução — para o cartão do rodapé. */
export function custoPorAgente(e: Execucao) {
  const ag = e.spans.filter((s) => s.tipo === "agent" && s.nivel > 0);
  const resto = e.custo - ag.reduce((a, s) => a + s.custo, 0);
  return [
    ...ag.map((s) => ({ nome: s.nome, v: s.custo, quente: s.quente })),
    { nome: "main", v: resto, quente: false },
  ].sort((a, b) => b.v - a.v);
}

/** Chamadas por ferramenta numa execução — para o cartão do rodapé. */
export function chamadasPorTool(e: Execucao) {
  const conta = new Map<string, number>();
  for (const s of e.spans) if (s.tipo === "tool") conta.set(s.nome, (conta.get(s.nome) ?? 0) + 1);
  /* O `Task` não é um span: é o ato de gerar cada subagente, então a contagem
     vem do número de agentes filhos. */
  conta.set("Task", e.spans.filter((s) => s.tipo === "agent" && s.nivel > 0).length);
  return [...conta.entries()]
    .map(([nome, v]) => ({ nome, v, quente: nome === "WebFetch" && e.repeticoes > 1 }))
    .sort((a, b) => b.v - a.v);
}

/* ── tokens: UM matiz em três degraus ──────────────────────────────────────
   Este gráfico passou por três paletas categóricas e todas caíram. Roxo com
   indigo: ΔE 14,7, abaixo do piso. Carmim com rosa: 12,2 — dois vermelhos
   vizinhos numa barra de 6px viram um só. Cinza com ciano: 3,2 sob protanopia,
   praticamente idênticos.

   O problema não era a escolha dos matizes; era a PREMISSA. `in`, `cache` e
   `out` não são três assuntos concorrentes — são três pedaços de uma coisa só,
   e a barra empilhada já diz isso pela geometria. Gastar três matizes ali
   competia com as cores que carregam significado na mesma tela (agente,
   ferramenta, laço, dinheiro) e ainda esbarrava no piso de separação.

   Um hue em três degraus resolve os dois: lê como "tudo isto é token" e não
   rouba nenhuma cor do vocabulário. Todos passam de 3:1 contra a superfície
   (10,8 · 6,3 · 3,8), e cada segmento vai direto-rotulado. */
export function tokensDe(e: Execucao) {
  return [
    /* Três degraus de VIOLETA, sem deriva pro azul. O `#5560D8` de antes
       puxava pra azul-marinho — cor que não existe na paleta e que aparecia
       tanto no painel quanto no filme. Agora os três degraus mantêm o mesmo
       matiz e mudam só luminância, que é o que "um dado em três partes"
       precisa dizer. */
    { nome: "in", v: Math.round(e.tokens * 0.8305), cor: "#CBBCFF" },
    { nome: "cache", v: Math.round(e.tokens * 0.1209), cor: "#9A7DFF" },
    { nome: "out", v: Math.round(e.tokens * 0.0486), cor: "#6E4FE8" },
  ];
}

"use client";

import { useEffect, useRef, useState } from "react";
import { ATUAL, HISTORICO, QUENTE, REDE, RESUMO, RUN_NOME, TURNS, tokensDe } from "./run-nightly";

/* ── quem manda em cada cor ────────────────────────────────────────────────
   Um matiz por TRABALHO, e nenhum trabalho com dois matizes. Antes o mint
   fazia tudo — marca, dinheiro, vazamento, rede — e por isso a página inteira
   parecia pintada com uma tinta só. Agora:

     mint      a marca e o DINHEIRO. Todo valor em dólar, e nada além disso.
     laranja   CALOR e desperdício: o caminho quente, a deriva subindo.
     azul      REDE. Convenção de qualquer monitor de tráfego.
     violeta   agente (na seção 03) e atmosfera.

   O ganho não é variedade por variedade: cada cor virou uma pergunta
   respondida antes de ler o rótulo. */
const DINHEIRO = "var(--color-viol)";
import { useTxt } from "./i18n";
import Reveal from "./reveal";

/**
 * Seção 02 · a biblioteca.
 *
 * DE QUATRO PALCOS PARA UM. A versão anterior empilhava quatro retângulos
 * grandes, cada um com sua janela e sua legenda: a seção passava de duas telas
 * de altura, e o leitor via quatro vezes a mesma composição. Agora é uma tela
 * só, dividida — texto à esquerda, um visual à direita — e os quatro assuntos
 * se revezam no mesmo lugar.
 *
 * O que a divisão resolve, além do tamanho: os quatro visuais passam a ocupar
 * EXATAMENTE o mesmo retângulo, então não existe mais desalinhamento possível.
 * E o olho para de refazer o mesmo percurso quatro vezes — ele fixa num ponto
 * e o conteúdo é que muda.
 *
 * O CARROSSEL ANDA SOZINHO, 4,4s por item, com um trilho de progresso ao lado
 * do item ativo. O trilho não é enfeite: sem ele, conteúdo que troca sozinho
 * lê como falha de interface. Com ele, é um relógio visível — a pessoa sabe
 * que dá pra esperar, e sabe que dá pra clicar. Passar o mouse pausa (ninguém
 * deve perder a leitura no meio), o clique escolhe, e `prefers-reduced-motion`
 * desliga a troca automática e deixa só o clique.
 *
 * A contagem só começa quando a seção entra na tela. Rodar em página não vista
 * gastaria os quatro slides antes de alguém chegar aqui.
 */

/* ── tema do editor ────────────────────────────────────────────────────────
   Um terminal monocromático na cor da marca ficava repetitivo, e pior: era
   FALSO. Nenhum editor do mundo pinta código de uma cor só — o realce existe
   justamente porque classes de token diferentes precisam se separar à
   primeira olhada. Aqui cada matiz é uma classe, do jeito que um tema de
   verdade faz:

     kw     rosa      palavra-chave da linguagem
     mod    roxo      nome de módulo
     fn     azul      chamada de função
     param  laranja   nome de parâmetro
     str    âmbar     literal de string
     spx    MINT      os símbolos do spanix — e só eles

   O mint continua reservado ao spanix por um motivo que sobrevive ao resto
   ficar colorido: no meio de um arquivo cheio de cor, a cor da MARCA é a
   única que aparece exatamente três vezes. Isso é o argumento do cartão dito
   em cor — essa é a superfície inteira da intervenção. */
/* O âmbar saiu e entrou CARMIM (`--color-crim`, que já existia no tema). Mas
   trocar só a string não bastava: carmim contra o rosa das palavras-chave dá
   ΔE 12,2 em visão normal, abaixo do piso de 15 — dois vermelhos adjacentes
   num bloco de código viram borrão. Então o rosa saiu e o tema inteiro foi
   redistribuído pra manter cada classe separável:

     kw     roxo      palavra-chave
     mod    azul      nome de módulo
     fn     ciano     chamada de função
     param  laranja   nome de parâmetro
     str    CARMIM    literal de string
     spx    mint      os símbolos do spanix — e só eles */
const SIN = {
  kw: "#C099FF",
  mod: "#D5D5DD",
  fn: "#7AA2F7",
  param: "#FF9E64",
  str: "#FF2D55",
  /* mint aqui é a MARCA dentro do seu arquivo, não o caminho quente — por
     isso deixou de sair de QUENTE e passou a apontar pro token direto. */
  spx: DINHEIRO,
  num: DINHEIRO,
  id: "#D5D5DD",
  dim: "#6E6A80",
} as const;

const PASSO_MS = 4400;

type Tok = { t: string; c?: string; b?: boolean };

/* ── UMA LINHA DE SPANIX, E SÓ ────────────────────────────────────────────
   O bloco terminava com `print(last_run().summary())` e importava `last_run`
   junto. Duas linhas de spanix num card intitulado "seu agente, com UMA linha
   em volta" — o próprio card se desmentia.

   O print existia porque na 0.0.2 não há CLI: sem ele o código é mudo. Mas o
   desenho da 0.1 (§5.2 do KNOWLEDGE.md) não passa por print nenhum: você
   envolve o stream, roda o agente, e digita `spanix` quando quiser. O card ao
   lado já leva o selo `0.1` e é ele que data a promessa.

   Quem instalar hoje e quiser a saída na hora acha `last_run()` no README e na
   seção `the api`, que existem exatamente pra isso. */
const CODIGO_TOKS: Tok[] = [
  { t: "from ", c: SIN.kw },
  { t: "claude_agent_sdk ", c: SIN.mod },
  { t: "import ", c: SIN.kw },
  { t: "query\n", c: SIN.fn },
  { t: "from ", c: SIN.kw },
  { t: "spanix ", c: SIN.mod },
  { t: "import ", c: SIN.kw },
  { t: "watch", c: SIN.spx, b: true },
  { t: "\n\nstream = " },
  { t: "query", c: SIN.fn },
  { t: "(", c: SIN.dim },
  { t: "prompt", c: SIN.param },
  { t: "=p, " },
  { t: "options", c: SIN.param },
  { t: "=opts" },
  { t: ")", c: SIN.dim },
  { t: "\n\n" },
  { t: "async for ", c: SIN.kw },
  { t: "msg " },
  { t: "in ", c: SIN.kw },
  { t: "watch", c: SIN.spx, b: true },
  { t: "(", c: SIN.dim },
  { t: "stream, " },
  { t: "run", c: SIN.param },
  { t: "=" },
  { t: `"${RUN_NOME}"`, c: SIN.str },
  { t: "):", c: SIN.dim },
  { t: "\n    " },
  { t: "handle", c: SIN.fn },
  { t: "(msg)" },
];

const CODIGO = CODIGO_TOKS.map((t) => t.t).join("");

/* ── a saída, escrita por gente ────────────────────────────────────────────
   A versão anterior era `chave   valor` em quatro linhas — o formato de
   despejo que toda biblioteca cospe por preguiça. Ele é legível e é frio: não
   há uma decisão de linguagem em lugar nenhum, e o leitor sente isso mesmo
   sem saber nomear.

   A troca é pequena e muda tudo: cada rótulo virou um VERBO, e os verbos
   completam a frase que o cabeçalho começou.

       cost you    $0.6500
       took        11 turns, 47 messages
       spent       142,318 tokens
       called      Read ×3 · Task ×2 · WebFetch ×5

   Lê-se "custou pra você $0.6500, levou 11 turnos, gastou 142 mil tokens,
   chamou Read três vezes". Continua alinhado em colunas, continua monoespaçado,
   continua terminal — só que agora alguém escreveu.

   E entraram duas linhas que nenhum despejo tem: um ACHADO (a ferramenta que
   se repetiu) e um CONVITE (o comando que abre o painel). Saída de ferramenta
   boa não termina em número, termina no próximo passo.

   ⚠ Isto é o formato que a página mostra. Para o `Run.summary()` de
   `_run.py` imprimir exatamente isto, ele precisa da mesma mudança — hoje
   ele ainda usa `chave   valor`. */
const TOK_SAIDA = tokensDe(ATUAL);
const N = (v: number) => v.toLocaleString("en-US");

/* ── ISTO É O COMANDO ÚNICO `spanix` (0.1) ────────────────────────────────
   A versão anterior deste bloco tinha dois problemas somados.

   O PRIMEIRO era invenção: rótulos que o programa não imprime (`cost you`,
   `took`, `spent`, `called`) e duas linhas de ficção pura. Corrigido: o miolo
   agora é `Run.summary()` de `_run.py`, letra por letra — mesma ordem, mesmos
   rótulos, mesmo alinhamento, mesma quebra `(in · out · cache)`.

   O SEGUNDO era conceitual, e foi o dono do projeto que apontou: a página
   mostrava a saída do terminal na seção 02 e o painel na seção 03 sem nunca
   dizer como se vai de uma pra outra. Ficava a pergunta "é terminal OU é
   localhost?".

   A resposta é os DOIS, e em ordem, através de um comando só. O terminal
   responde "tem algo aqui?" em dois segundos; o link responde "o que
   exatamente?". Por isso a última linha é a URL — e a seção logo abaixo é
   literalmente a tela que aquele link abriu.

   SELO DE VERSÃO obrigatório: o comando não existe na 0.0.2. `KNOWLEDGE.md`
   §7.2 — "todo trecho exibido no site é colável e produz aquela saída; o que
   ainda não existe leva selo de versão". */
const SAIDA_LINHAS: Tok[][] = [
  [{ t: "$ ", c: SIN.dim }, { t: "spanix", c: SIN.spx, b: true }],
  [],
  [
    { t: "spanix", c: SIN.spx, b: true },
    { t: " · 5 runs · last: " },
    { t: RUN_NOME },
    { t: `  ${RESUMO.duracao}`, c: SIN.dim },
  ],
  [{ t: "  cost      ", c: SIN.dim }, { t: RESUMO.custoFmt, c: SIN.num, b: true }],
  [
    { t: "  tokens    ", c: SIN.dim },
    { t: N(ATUAL.tokens), c: SIN.fn },
    {
      t: ` (in ${N(TOK_SAIDA[0].v)} · out ${N(TOK_SAIDA[2].v)} · cache ${N(TOK_SAIDA[1].v)})`,
      c: SIN.dim,
    },
  ],
  [{ t: "  turns     ", c: SIN.dim }, { t: String(RESUMO.turns) }],
  [{ t: "  tools     ", c: SIN.dim }, { t: "Read ×3, Task ×2, WebFetch ×5", c: SIN.mod }],
  [],
  /* A leitura que só o histórico dá — e é ela que o painel abre. Carmim, o
     mesmo do laço na seção 03: quando a mesma coisa é apontada em duas telas,
     tem que ter a mesma cor nas duas. */
  [
    { t: "  ↑ 24% vs last week", c: SIN.str },
    { t: "   ·   ", c: SIN.dim },
    { t: "WebFetch ×5, 3 same arg", c: SIN.str },
  ],
  [],
  /* A COSTURA COM A SEÇÃO 03. O link é a última coisa impressa porque é o
     próximo movimento, e a janela logo abaixo é o que ele abre. */
  [{ t: "→ ", c: SIN.dim }, { t: "http://localhost:7788", c: SIN.spx }],
];
/* ── ferramentas ─────────────────────────────────────────────────────────── */

function usarNaTela<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setVisivel(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          setVisivel(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, visivel] as const;
}

function reduzido() {
  return (
    typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Conta de 0 a `total` em passos de `ms`, uma vez só.
 *
 * rAF em vez de setInterval: o relógio vem do próprio quadro, então a contagem
 * não acumula atraso quando a aba engasga nem dispara em rajada quando ela
 * volta do segundo plano.
 */
/* ── DIGITA UMA VEZ, E FICA ────────────────────────────────────────────────
   O `key={ITENS[ativo].id}` no carrossel faz o React DESMONTAR e remontar o
   visual a cada troca. Com o estado morando dentro do componente, o
   `useState(0)` zerava e a animação recomeçava — e como o carrossel dá a volta
   a cada 17,6s, o bloco de código voltava a ser redigitado pra sempre.

   O efeito colateral era grave e demorou pra ser visto porque não aparece em
   HTML estático: durante os 2,18s de digitação o Python na tela está
   SINTATICAMENTE INVÁLIDO. Em `n=110` a linha é exatamente

       async for

   e em `n=126`

       async for msg in watch(st

   ou seja, 12,4% do tempo a landing page de um profiler exibia código quebrado,
   e na PRIMEIRA vista ela sempre começa quebrada. Dois revisores relataram o
   corte em pontos diferentes justamente porque cada um olhou num quadro
   diferente da animação. Eu declarei a página limpa três vezes inspecionando
   apenas o gabarito invisível, que é texto plano e nunca esteve cortado.

   A correção guarda o "já digitei" FORA do componente, num registro de módulo:
   ele sobrevive à remontagem, então a primeira revelação anima e toda volta do
   carrossel já mostra o bloco inteiro. Não é cache de performance — é garantia
   de que código exibido está sempre válido depois do primeiro passe. */
const JA_DIGITOU = new Set<string>();

function usarContagem(total: number, ativo: boolean, ms: number, id?: string) {
  /* Se este bloco já foi digitado nesta sessão, entra pronto. */
  const pronto = id !== undefined && JA_DIGITOU.has(id);
  const [n, setN] = useState(pronto ? total : 0);

  useEffect(() => {
    if (!ativo) return;
    if (pronto || reduzido()) {
      setN(total);
      return;
    }
    let raf = 0;
    let inicio: number | undefined;
    const passo = (t: number) => {
      inicio ??= t;
      const k = Math.floor((t - inicio) / ms);
      setN(Math.min(k, total));
      if (k < total) raf = requestAnimationFrame(passo);
      else if (id !== undefined) JA_DIGITOU.add(id);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [ativo, total, ms, pronto, id]);

  return n;
}

/** Fatia a lista de tokens no n-ésimo caractere, preservando as cores. */
function fatiar(toks: Tok[], n: number) {
  let resta = n;
  const saida: React.ReactNode[] = [];
  for (let i = 0; i < toks.length && resta > 0; i++) {
    const tk = toks[i];
    const pedaco = tk.t.slice(0, resta);
    resta -= pedaco.length;
    saida.push(
      <span
        key={i}
        className={tk.b ? "font-medium" : undefined}
        style={tk.c ? { color: tk.c } : undefined}
      >
        {pedaco}
      </span>,
    );
  }
  return saida;
}

function Cursor() {
  return (
    <span
      aria-hidden="true"
      className="cursor-bloco ml-[1px] inline-block h-[11px] w-[6.5px] translate-y-[1px]"
      style={{ background: SIN.id }}
    />
  );
}

/* ── a janela ────────────────────────────────────────────────────────────── */
function Janela({
  titulo,
  acao,
  children,
}: {
  titulo: string;
  acao?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[11px] border border-white/10 bg-[#0A0910] shadow-[0_2px_10px_rgba(0,0,0,.5),0_40px_80px_-30px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2.5 border-b border-white/8 bg-white/[.03] px-3.5 py-2">
        <span aria-hidden="true" className="flex shrink-0 gap-[5px]">
          <i className="block size-[7.5px] rounded-full bg-white/20" />
          <i className="block size-[7.5px] rounded-full bg-white/20" />
          <i className="block size-[7.5px] rounded-full bg-white/20" />
        </span>
        <span className="ml-1 truncate font-jet text-[10px] text-ink-3">{titulo}</span>
        {acao && <span className="ml-auto shrink-0">{acao}</span>}
      </div>
      {children}
    </div>
  );
}

function Copiar({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      return;
    }
    setCopiado(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? "Code copied" : "Copy the example"}
      className="rounded-md px-2 py-[2px] font-jet text-[10px] text-ink-3 transition-colors hover:bg-white/8 hover:text-ink"
      style={copiado ? { color: SIN.str } : undefined}
    >
      {copiado ? "copied" : "copy"}
    </button>
  );
}

/* ── os quatro visuais ───────────────────────────────────────────────────── */

/** Digitado caractere a caractere: quem escreve código é uma pessoa. */
function VisualCodigo() {
  const n = usarContagem(CODIGO.length, true, 13, "codigo");
  const pronto = n >= CODIGO.length;

  return (
    <Janela titulo="research_agent.py" acao={<Copiar texto={CODIGO} />}>
      {/* ── O GABARITO TEM QUE TER O MESMO CORPO DO TEXTO ────────────────
          Esta `<pre>` é invisível e existe só pra reservar a caixa; a versão
          digitada vai por cima em `absolute inset-0`. Se os dois corpos
          divergem, o visível não cabe no que foi reservado — e com
          `overflow-x-auto` no pai, o fim da linha mais longa é CORTADO.

          Foi o que aconteceu: uma edição minha pra encolher o terminal de
          SAÍDA acertou este bloco por engano e deixou o gabarito em 12,5px
          contra 13px do texto. A linha mais longa do arquivo é

              async for msg in watch(stream, run="nightly-scan"):

          então o que desapareceu foram exatamente as aspas, o parêntese e os
          dois pontos — a página de um profiler exibindo Python com erro de
          sintaxe. Os dois corpos ficam travados em 13px. */}
      <div className="relative overflow-x-auto px-5 py-4">
        <pre className="invisible font-jet text-[13px] leading-[1.92]" aria-hidden="true">
          {CODIGO}
        </pre>
        <pre
          className="absolute inset-0 px-5 py-4 font-jet text-[13px] leading-[1.92]"
          style={{ color: SIN.id }}
        >
          <code>
            {fatiar(CODIGO_TOKS, n)}
            {!pronto && <Cursor />}
          </code>
        </pre>
      </div>
    </Janela>
  );
}

/** Impresso linha a linha: quem escreve ali é um programa. */
function VisualSaida() {
  const n = usarContagem(SAIDA_LINHAS.length, true, 200, "saida");
  const pronto = n >= SAIDA_LINHAS.length;

  return (
    /* SELO `0.1` na moldura, cumprindo a regra do §7.2 do KNOWLEDGE.md: o que
       ainda não existe tem que dizer que ainda não existe. Vai no ULTRAVIOLETA
       e não no âmbar que o documento pedia — âmbar era da paleta antiga, e
       hoje "o que vem" é violeta em toda a página (a coluna `v0.1.0 · next` da
       seção `the road` usa exatamente isto). */
    <Janela
      titulo="zsh · ~/research"
      acao={
        <span className="rounded-full border border-[rgba(var(--viol-rgb),.5)] bg-[rgba(var(--viol-rgb),.2)] px-[9px] py-[2px] font-mono text-[9px] font-medium tracking-[.14em] text-ink uppercase">
          0.1
        </span>
      }
    >
      {/* 12,5px nos DOIS, e não 13: a linha `tokens ... (in · out · cache)`
          tem 58 caracteres e a 13px passava dos 486px da janela, forçando
          rolagem horizontal numa vitrine. Corpo menor é o preço de mostrar a
          saída real em vez de uma resumida — e gabarito e texto mudam JUNTOS,
          senão o fim da linha é cortado. */}
      <div className="relative overflow-x-auto px-5 py-4">
        <pre className="invisible font-jet text-[12.5px] leading-[1.92]" aria-hidden="true">
          {SAIDA_LINHAS.map((l) => l.map((t) => t.t).join("")).join("\n")}
          {"\n$"}
        </pre>
        <pre
          className="absolute inset-0 px-5 py-4 font-jet text-[12.5px] leading-[1.92]"
          style={{ color: SIN.id }}
        >
          <code>
            {SAIDA_LINHAS.slice(0, n).map((linha, i) => (
              <span key={i}>
                {linha.map((tk, j) => (
                  <span
                    key={j}
                    className={tk.b ? "font-medium" : undefined}
                    style={tk.c ? { color: tk.c } : undefined}
                  >
                    {tk.t}
                  </span>
                ))}
                {"\n"}
              </span>
            ))}
            {pronto && <span style={{ color: SIN.dim }}>$ </span>}
            <Cursor />
          </code>
        </pre>
      </div>
    </Janela>
  );
}

const ARQUIVOS: [string, string][] = [
  ["runs.db", "2.1 MB"],
  ["config.toml", "412 B"],
];

/**
 * Local first.
 *
 * A versão anterior era UMA linha flutuando num painel de 300px, e a
 * desproporção era o próprio conteúdo: "existe um arquivo no seu disco" não
 * sustenta uma tela. O que sustenta é mostrar as DUAS metades da promessa —
 * o que fica gravado, e o que sai pela rede.
 *
 * O gráfico da rede é uma linha reta no zero, e ela é o argumento inteiro em
 * forma de desenho. Um gráfico deliberadamente chato é a prova mais forte que
 * esta seção pode dar: não há pico porque não há requisição.
 */
function VisualDisco() {
  return (
    <Janela titulo="~/.spanix">
      <div className="px-4 py-3.5">
        {ARQUIVOS.map(([nome, tam], i) => (
          <div
            key={nome}
            className={`flex items-baseline gap-3 py-[7px] ${i ? "border-t border-white/6" : ""}`}
          >
            <span className="truncate font-jet text-[12px] text-ink">{nome}</span>
            <span className="ml-auto shrink-0 font-jet text-[11px] text-ink-3 tabular-nums">
              {tam}
            </span>
          </div>
        ))}

        <div className="mt-3 border-t border-white/8 pt-3">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[9px] tracking-[.2em] uppercase text-ink-3">
              outbound
            </span>
            <span className="font-jet text-[10.5px] text-ink-3 tabular-nums">since install</span>
          </div>

          {/* AZUL, e não mint: este gráfico é de REDE, e azul é a convenção de
              tráfego em qualquer monitor. Com mint ele lia como "aprovado",
              que é interpretação — a linha reta no zero já diz o que precisa
              ser dito, sem a cor opinar. */}
          <div className="relative mt-2.5 h-[34px]">
            <svg
              viewBox="0 0 200 34"
              preserveAspectRatio="none"
              className="h-full w-full"
              role="img"
              aria-label="Outbound network traffic since install: a flat line at zero"
            >
              <line
                x1="0"
                x2="200"
                y1="33"
                y2="33"
                stroke="rgba(255,255,255,.1)"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                x2="200"
                y1="30"
                y2="30"
                stroke={REDE}
                strokeWidth="2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className="mt-1.5 flex items-baseline justify-between font-jet text-[11px]">
            <span style={{ color: REDE }}>0 B</span>
            <span className="text-ink-3 tabular-nums">0 requests</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-white/8 pt-3 font-jet text-[10.5px] text-ink-3">
          <i aria-hidden="true" className="pulse-dot block size-[5px] shrink-0 rounded-full bg-ok" />
          <span className="tabular-nums">482 runs stored</span>
          <span aria-hidden="true">·</span>
          <span>no account</span>
        </div>
      </div>
    </Janela>
  );
}

/**
 * Deriva.
 *
 * As barras passaram a ser CUSTO, e não turns: dólar é a moeda da página
 * inteira, e turns já aparece como legenda. E ficaram altas o bastante pra a
 * curva ter forma — barra de 86px num painel de 300px era um gráfico pedindo
 * desculpa por existir.
 */
function VisualDeriva() {
  const max = Math.max(...HISTORICO);
  const primeiro = HISTORICO[0];
  const ultimo = HISTORICO[HISTORICO.length - 1];

  return (
    <Janela titulo={`${RUN_NOME} · cost per run`}>
      <div className="px-4 py-3.5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[9px] tracking-[.2em] uppercase text-ink-3">
            last 7 runs
          </span>
          <span
            className="rounded-full px-2 py-[2px] font-jet text-[10px] font-medium"
            style={{
              background: `color-mix(in oklab, ${QUENTE} 18%, transparent)`,
              color: QUENTE,
            }}
          >
            +{Math.round((ultimo / primeiro - 1) * 100)}%
          </span>
        </div>

        <div className="mt-3 flex h-[132px] items-end gap-[6px]">
          {HISTORICO.map((c, i) => {
            const fim = i === HISTORICO.length - 1;
            return (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`font-jet text-[9px] tabular-nums ${fim ? "text-ink" : "text-ink-3"}`}
                >
                  {TURNS[i]}
                </span>
                <span
                  className="w-full rounded-t-[3px]"
                  style={{
                    height: `${(c / max) * 108}px`,
                    background: fim ? QUENTE : "rgba(255,255,255,.13)",
                    boxShadow: fim ? `0 0 24px -4px ${QUENTE}` : undefined,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* O valor em dólar vai em mint — dinheiro é o único trabalho dele
            agora. A barra e o chip de percentual vão em laranja, porque o que
            eles dizem não é "custou X", é "está esquentando". */}
        <div className="mt-2.5 flex items-baseline justify-between border-t border-white/8 pt-2.5 font-jet text-[10.5px] text-ink-3 tabular-nums">
          <span>
            <span style={{ color: DINHEIRO, opacity: 0.6 }}>${primeiro.toFixed(2)}</span> · 4 turns
          </span>
          <span aria-hidden="true" className="text-ink-3">
            →
          </span>
          <span className="text-ink">
            <span style={{ color: DINHEIRO }}>${ultimo.toFixed(2)}</span> · 11 turns
          </span>
        </div>
      </div>
    </Janela>
  );
}

/* Só a ESTRUTURA e o visual moram aqui. O texto de cada item vem do bloco de
   idioma, na mesma ordem. */
const ITENS = [
  {
    id: "write",
    Visual: VisualCodigo,
  },
  {
    id: "back",
    Visual: VisualSaida,
  },
  {
    id: "local",
    Visual: VisualDisco,
  },
  {
    id: "drift",
    Visual: VisualDeriva,
  },
];

/* ── VOZ ───────────────────────────────────────────────────────────────────
   Nada aqui fala COM o leitor. A versão anterior rotulava "o que você escreve"
   e "o que volta pra você" — input e output explicados pra engenheiro sênior
   que orquestra LLM — e dava ordem em imperativo ("passe o stream", "rode
   spanix"). É voz de tutorial, e ela derruba a autoridade da página inteira.

   Ferramenta de infraestrutura descreve o SOFTWARE, não o usuário: `uv`, Ruff
   e FastAPI enunciam o que a coisa faz e qual restrição ela obedece, em
   terceira pessoa e no presente. As sobrancelhas viraram restrições
   (`one line`, `one command`, `no egress`, `drift`) e os títulos viraram
   afirmações sobre o programa. */
const T = {
  en: {
    olho: "the library",
    h2: "A profiler, not a platform.",
    subA: "One",
    subB: ", no account and no server.",
    itens: [
      {
        olho: "one line",
        titulo: "Wraps the stream. Yields it untouched.",
        desc: "The async iterator your agent already returns, accounted for in place. Every message comes out intact and in order, so the loop around it is unchanged.",
      },
      {
        olho: "one command",
        titulo: "The receipt, and the link.",
        desc: "`spanix` prints the last run, marks what moved, and hands over the panel URL. Terminal answers whether. Panel answers what.",
      },
      {
        olho: "no egress",
        titulo: "Never opens a socket.",
        desc: "No socket, no upload, no account. Counters live in the process today, in ~/.spanix/runs.db from 0.1. Both on your disk.",
      },
      {
        olho: "drift",
        titulo: "Same task. Three times the bill.",
        desc: "Four turns last month, eleven today, nothing broken. A named run is the only thing comparable to itself.",
      },
    ],
  },
  pt: {
    olho: "a biblioteca",
    h2: "Um profiler, não uma plataforma.",
    subA: "Um",
    subB: ", sem conta e sem servidor.",
    itens: [
      {
        olho: "uma linha",
        titulo: "Envolve o stream. Devolve intacto.",
        desc: "O iterador assíncrono que seu agente já devolve, contabilizado no lugar. Cada mensagem sai intacta e na ordem, então o loop em volta dela não muda.",
      },
      {
        olho: "um comando",
        titulo: "O recibo, e o link.",
        desc: "`spanix` imprime a última execução, marca o que mudou e entrega a URL do painel. Terminal responde se. Painel responde o quê.",
      },
      {
        olho: "sem saída de rede",
        titulo: "Nunca abre um socket.",
        desc: "Sem socket, sem upload, sem conta. Os contadores vivem no processo hoje, e em ~/.spanix/runs.db a partir da 0.1. Os dois no seu disco.",
      },
      {
        olho: "drift",
        titulo: "Mesma tarefa. Três vezes a conta.",
        desc: "Quatro turnos mês passado, onze hoje, nada quebrado. Execução com nome é a única coisa comparável com ela mesma.",
      },
    ],
  },
};


export function LibrarySection() {
  const t = useTxt(T);
  const [ref, visivel] = usarNaTela<HTMLDivElement>();
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (!visivel || pausado || reduzido()) return;
    const t = window.setTimeout(() => setAtivo((a) => (a + 1) % ITENS.length), PASSO_MS);
    return () => window.clearTimeout(t);
  }, [visivel, pausado, ativo]);

  const Visual = ITENS[ativo].Visual;

  return (
    <section id="library" className="relative">
      <div
        ref={ref}
        className="mx-auto w-full max-w-[1240px] px-6 py-[clamp(80px,11vh,128px)] lg:px-10"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        {/* LARGURA. O contêiner era 1120 com colunas de 420+520 = 940, então
            sobravam 100px de folga que ninguém usava e a seção inteira ficava
            encolhida no meio de uma tela de 24". Agora são 1240 de contêiner
            e 392+680, empurradas pelas pontas: o texto continua numa medida
            legível (~55 caracteres) e todo o resto vai pro terminal, que é o
            que precisa de área. As duas colunas seguem com largura declarada
            — nenhuma leva "o que sobrar", que foi o erro da versão em que a
            direita era `1fr` e virava o dobro da esquerda. */}
        <div className="grid items-center gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,392px)_minmax(0,620px)] lg:justify-between">
          {/* ══ esquerda · o texto ══ */}
          <Reveal>
            <span className="olho">
              <i aria-hidden="true" />
              {t.olho}
            </span>
            <h2 className="h-secao mt-3.5 max-w-[16ch]">{t.h2}</h2>
            <p className="mt-3.5 max-w-[46ch] text-[14.5px] leading-[1.7] font-[450] text-ink-2">
              {t.subA} <span className="font-jet text-[13.5px] text-ink">pip install</span>
              {t.subB}
            </p>

            <div className="mt-8 flex flex-col">
              {ITENS.map((it, i) => {
                const sel = i === ativo;
                return (
                  /* O SELECIONADO PRECISA PARECER SELECIONADO. Antes a única
                     diferença entre ativo e inativo era o tom do texto, e como
                     `ink-3` já é bem claro, os quatro liam como uma lista
                     branca uniforme: a troca automática acontecia e ninguém
                     via o que tinha mudado.

                     Agora o estado é dito por quatro sinais somados — o item
                     ganha superfície e borda, o rótulo acende em mint, o
                     título vai a branco puro, e o trilho da esquerda enche em
                     mint com brilho. Os inativos recuam de verdade (opacidade
                     no bloco inteiro), então o contraste entre eles existe por
                     diferença real e não por meio tom de cinza. */
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setAtivo(i)}
                    aria-current={sel}
                    className={`group relative rounded-[10px] py-3 pr-3 pl-5 text-left transition-all duration-300 ${
                      sel
                        ? "border border-white/10 bg-white/[.045] shadow-[0_10px_30px_-18px_rgba(0,0,0,.9)]"
                        : "border border-transparent opacity-55 hover:opacity-90"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute top-2 bottom-2 left-0 w-[2px] rounded-full bg-white/10"
                    />
                    {sel && (
                      <span
                        key={ativo}
                        aria-hidden="true"
                        className="trilho absolute top-2 bottom-2 left-0 w-[2px] rounded-full"
                        style={{
                          background: DINHEIRO,
                          boxShadow: "0 0 12px -1px var(--color-viol)",
                          animationDuration: `${PASSO_MS}ms`,
                          animationPlayState: pausado ? "paused" : "running",
                        }}
                      />
                    )}

                    <span
                      className="flex items-center gap-2 font-mono text-[9px] tracking-[.22em] uppercase transition-colors"
                      style={{ color: sel ? DINHEIRO : "var(--color-ink-3)" }}
                    >
                      {sel && (
                        <i
                          aria-hidden="true"
                          className="block size-[4px] rounded-full"
                          style={{ background: DINHEIRO, boxShadow: "0 0 8px var(--color-viol)" }}
                        />
                      )}
                      {t.itens[i].olho}
                    </span>
                    <span
                      className={`mt-1.5 block font-sora text-[17px] leading-[1.25] font-semibold tracking-[-.025em] transition-colors ${
                        sel ? "text-white" : "text-ink-2"
                      }`}
                    >
                      {t.itens[i].titulo}
                    </span>
                    {sel && (
                      <span className="mt-2 block max-w-[42ch] text-[13px] leading-[1.6] text-ink-2">
                        {t.itens[i].desc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ══ direita · o visual ══ */}
          <Reveal delay={90}>
            {/* SEM PALCO. A caixa que estava aqui — borda, fundo próprio,
                grade quadriculada e luz de aresta — era moldura sobre moldura:
                a janela do terminal já é um objeto com borda e sombra, e
                emoldurar um objeto emoldurado só produz duas linhas paralelas
                brigando. A grade ainda por cima duplicava a textura do fundo
                da página, então aparecia como um retângulo quadriculado colado
                no meio da seção.

                Agora a janela flutua direto sobre a vinheta da página, e é a
                sombra dela que a descola do fundo. Sobrou desta div só o que
                tem função: altura fixa e centralização, pra os quatro visuais
                ocuparem exatamente o mesmo espaço e a troca não dar salto. */}
            {/* ── o poço de luz ────────────────────────────────────────────
                O fundo continuava chapado porque, ao tirar a caixa com borda
                e grade, eu não pus nada no lugar — a janela ficou boiando
                sobre preto liso. Aqui entra o que dá profundidade sem trazer
                moldura de volta: uma poça de luz violeta atrás dela.

                Isso funciona porque profundidade se lê por diferença de
                luminosidade entre o objeto e o que está atrás. Borda desenha
                um limite; luz cria um LUGAR. A janela passa a estar dentro de
                algo, em vez de colada em cima de nada. */}
            <div className="relative isolate flex h-[clamp(348px,47vh,428px)] items-center">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(60% 64% at 50% 44%, rgba(var(--viol-rgb),.17), transparent 72%)",
                }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-[12%] bottom-[6%] -z-10 h-[22%] rounded-[999px] blur-2xl"
                style={{ background: "rgba(2,1,6,.85)" }}
              />

              {/* LARGURA MÁXIMA na janela, e é isso que conserta o formato.
                  A linha mais longa da saída tem 44 caracteres — cerca de
                  390px de texto. Numa coluna de 680 sobravam quase 300px de
                  vazio dos dois lados, e é a sobra que fazia o terminal ler
                  como uma tira horizontal. Limitando a 486px, a proporção cai
                  de ~2,3:1 para ~1,4:1: a janela vira retrato, não faixa. */}
              <div key={ITENS[ativo].id} className="visual-entra mx-auto w-full max-w-[486px]">
                <Visual />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

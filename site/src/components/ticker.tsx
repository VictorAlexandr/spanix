"use client";

import { useTxt } from "./i18n";

/**
 * Faixa corrida entre a hero e a seção 2.
 *
 * Estrutura portada da lattis: cada item é uma CÉLULA com borda, carregando
 * dois chips (origem + tipo) antes do texto. É a célula que dá cara de fio de
 * notícias — texto solto com separador flutuando não lê como faixa, lê como
 * legenda espalhada.
 *
 * Ela existe por dois motivos. O estrutural: uma faixa cheia É a divisão entre
 * a hero e a seção 2, então não sobra emenda pra acertar. O narrativo: é o
 * inventário do problema, dito em sete achados, logo antes de a página
 * começar a resolver.
 *
 * ── A FAIXA FALAVA A PALETA VELHA ─────────────────────────────────────────
 * Ela ficou pra trás em todas as convergências: tinha laranja (#D97757),
 * âmbar (#ffb020), ciano (#22d3ee) e ácido (#c8f751) — quatro matizes que
 * saíram do resto da página, um deles reprovado no validador contra o mint.
 * Sentada entre a hero e a seção 2, era a transição mais visível do site
 * falando outra língua.
 *
 * AGORA ELA SEGUE A LEGENDA DO PAINEL, que é a mesma coisa que o docstring
 * já prometia: agente é VIOLETA, ferramenta é CARMIM. E as etiquetas usam o
 * carmim como ele é usado em toda parte — para o que está errado. Sobra uma
 * única etiqueta mint, LOCAL, que é a resposta no meio do inventário.
 *
 * As duas famílias não se confundem porque o TRATAMENTO difere: o chip de
 * origem é sólido (texto escuro sobre cor), a etiqueta é tingida (cor sobre
 * fundo escuro). Mesmo matiz, pesos opostos.
 *
 * O conteúdo são achados da mesma execução #482 que aparece no filme e no
 * painel — os chips usam as mesmas cores por agente, então a faixa e o filme
 * falam a mesma língua.
 */

/* origem, em sólido. Agente é violeta e ferramenta é carmim, exatamente como
   no painel; `runtime` não é nenhum dos dois e fica neutro. */
const NODE = {
  "main": "#8a6eff",
  "research": "#8a6eff",
  "verify": "#8a6eff",
  "WebFetch": "#FF2D55",
  runtime: "#D5D5DD",
} as const;

/* tipo do achado, em tingido. Quatro problemas em carmim, uma resposta em
   mint — a mesma divisão que a página faz em todo lugar. */
const PROBLEMA = "bg-[rgba(255,45,85,.16)] text-[#FF8DA5]";
const TAG: Record<string, string> = {
  COST: PROBLEMA,
  RETRY: PROBLEMA,
  DRIFT: PROBLEMA,
  TOKENS: PROBLEMA,
  LOCAL: "bg-[rgba(61,255,196,.14)] text-[#7CF0CE]",
};

type Item = { no: keyof typeof NODE; tag: keyof typeof TAG; t: string };

/* As ETIQUETAS não traduzem. COST, RETRY, DRIFT, TOKENS e LOCAL são rótulos de
   instrumento, e instrumento fala inglês no mundo inteiro — quem lê "CUSTO"
   numa faixa de telemetria estranha mais do que quem lê "COST". Só a frase
   muda de idioma. */
const BASE: { no: keyof typeof NODE; tag: keyof typeof TAG }[] = [
  { no: "research", tag: "COST" },
  { no: "WebFetch", tag: "RETRY" },
  { no: "main", tag: "DRIFT" },
  { no: "verify", tag: "TOKENS" },
  { no: "runtime", tag: "LOCAL" },
  { no: "main", tag: "COST" },
  { no: "research", tag: "RETRY" },
];

const T = {
  en: {
    rotulo: "Findings from a sample run",
    frases: [
      "one subagent burned 142k tokens on its own context",
      "the same tool called 5 times with the same argument",
      "this agent solved it in 4 turns last month, 11 today",
      "subagents carry their own context, and their own bill",
      "free and local by default, and the cloud never sees a prompt",
      "the SDK tells you the cost once, then it is gone",
      "a subagent that hit its turn limit and returned nothing",
    ],
  },
  pt: {
    rotulo: "Achados de uma execução de exemplo",
    frases: [
      "um subagente queimou 142k tokens no próprio contexto",
      "a mesma ferramenta chamada 5 vezes com o mesmo argumento",
      "esse agente resolvia em 4 turnos mês passado; hoje são 11",
      "subagentes carregam o próprio contexto, e a própria conta",
      "grátis e local por padrão, e a nuvem nunca vê um prompt",
      "o SDK mostra o custo uma vez e some com ele",
      "um subagente que bateu o limite de turnos e não voltou com nada",
    ],
  },
};

export function Ticker() {
  const t = useTxt(T);
  const ITENS: Item[] = BASE.map((b, i) => ({ ...b, t: t.frases[i] }));
  /* duplicado para o laço fechar sem salto — a animação anda -50% */
  const loop = [...ITENS, ...ITENS];

  return (
    <section
      aria-label={t.rotulo}
      /* Preto translúcido em vez de opaco: a faixa continua sendo a banda
         mais escura da página, mas a vinheta do fundo passa por baixo dela em
         vez de ser interrompida. Slab opaco no meio de um fundo modulado
         aparece como remendo. */
      className="ticker-mask relative overflow-hidden border-t border-(--hair) bg-black/35"
    >
      {/* fio CARMIM no topo. As emendas de seção são violeta; esta é a única
          carmim da página, e é ela que marca a faixa como a banda do
          problema. A cor entra no lugar onde a informação também é essa. */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-[8%] left-[8%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(255,45,85,.55),transparent)",
        }}
      />

      <div className="ticker-track flex w-max">
        {loop.map((it, i) => (
          <span
            key={`${i}`}
            className="flex shrink-0 items-center gap-[10px] border-r border-white/[.07] px-5 py-[11px] text-[12.5px] text-ink-2 transition-colors hover:bg-white/[.03] hover:text-ink"
          >
            <span
              className="shrink-0 rounded-[4px] px-2 py-[3px] font-mono text-[9.5px] tracking-[.06em]"
              style={{ background: NODE[it.no], color: "#0A0812" }}
            >
              {it.no}
            </span>
            <span
              className={`shrink-0 rounded-[3px] px-[7px] py-[3px] font-mono text-[8.5px] font-semibold tracking-[.1em] ${TAG[it.tag]}`}
            >
              {it.tag}
            </span>
            <span className="whitespace-nowrap">{it.t}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

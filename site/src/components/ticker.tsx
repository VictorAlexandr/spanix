/**
 * Faixa corrida entre a hero e a seção 2.
 *
 * Estrutura portada da lattis: cada item é uma CÉLULA com borda, carregando
 * dois chips (origem + tipo) antes do texto. É a célula que dá cara de fio de
 * notícias — texto solto com separador flutuando não lê como faixa, lê como
 * legenda espalhada.
 *
 * Ela existe por dois motivos. O estrutural: uma faixa cheia É a divisão entre
 * a hero e a seção 2, então não sobra emenda pra acertar. O cromático: é o
 * único ponto da página onde entra o ácido.
 *
 * O conteúdo são achados da mesma execução #482 que aparece no filme e no
 * painel — os chips usam as mesmas cores por agente, então a faixa e o filme
 * falam a mesma língua.
 */

const NODE = {
  "main": "#D97757",
  "research": "#ffb020",
  "verify": "#22d3ee",
  "WebFetch": "#8a6eff",
  runtime: "#c8f751",
} as const;

const TAG: Record<string, string> = {
  COST: "bg-[#7a4f00] text-[#ffd08a]",
  RETRY: "bg-white/10 text-ink-2",
  DRIFT: "bg-[#6e1f26] text-[#ffb3b3]",
  TOKENS: "bg-[#3b2a7a] text-[#c9b8ff]",
  LOCAL: "bg-[#2a4a12] text-[#dcf7a0]",
};

type Item = { no: keyof typeof NODE; tag: keyof typeof TAG; t: string };

const ITENS: Item[] = [
  { no: "research", tag: "COST", t: "one subagent burned 142k tokens on its own context" },
  { no: "WebFetch", tag: "RETRY", t: "the same tool called 5 times with the same argument" },
  { no: "main", tag: "DRIFT", t: "this agent solved it in 4 turns last month, 11 today" },
  { no: "verify", tag: "TOKENS", t: "subagents carry their own context, and their own bill" },
  { no: "runtime", tag: "LOCAL", t: "free and local by default, and the cloud never sees a prompt" },
  { no: "main", tag: "COST", t: "the SDK tells you the cost once, then it is gone" },
  { no: "research", tag: "RETRY", t: "a subagent that hit its turn limit and returned nothing" },
];

export function Ticker() {
  /* duplicado para o laço fechar sem salto — a animação anda -50% */
  const loop = [...ITENS, ...ITENS];

  return (
    <section
      aria-label="Findings from a sample run"
      className="ticker-mask relative overflow-hidden border-y border-(--hair) bg-[#0A0812]"
    >
      {/* fio ácido no topo: o único ponto cromático fora do violeta na página */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-[8%] left-[8%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(200,247,81,.55),transparent)",
        }}
      />

      <div className="ticker-track flex w-max">
        {loop.map((it, i) => (
          <span
            key={`${it.t}-${i}`}
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

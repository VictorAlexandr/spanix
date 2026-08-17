"use client";

import { useTxt } from "./i18n";

import Reveal from "./reveal";

/**
 * Seção 05 · a superfície pública.
 *
 * A IDEIA, e ela é do cliente: em vez de uma seção listando nomes e outra
 * explicando que não há mágica, uma só que responde "o que a biblioteca TEM".
 * Nome, assinatura e o que cada um faz — e, embaixo, como ele acha o número.
 * As duas perguntas são a mesma pergunta feita em dois níveis.
 *
 * POR QUE ISTO É UM ARGUMENTO, e não documentação perdida numa landing:
 * `__all__` do pacote tem quatro nomes. Quatro. Num mercado onde todo
 * concorrente chega com SDK, painel hospedado e onboarding, mostrar que a
 * superfície pública inteira cabe numa tela É o posicionamento — "a profiler,
 * not a platform" deixa de ser slogan e vira uma lista que a pessoa confere.
 *
 * E é a única seção da página que não promete nada: tudo aqui existe na 0.0.2
 * publicada. Depois de duas seções mostrando o painel do 0.1, uma que só
 * mostra o que já está no ar é o que devolve o pé no chão.
 *
 * A METADE DE BAIXO é o "sem mágica". O `_run.py` procura cada número numa
 * lista literal de nomes candidatos, porque runtimes discordam de grafia e o
 * arquivo não pode importar nenhum deles pra descobrir. Mostrar essas listas
 * responde de uma vez as duas perguntas que o `works with` da hero deixa em
 * aberto: como ele acha meus números, e o que acontece se meu runtime for
 * outro. Resposta: é mais uma lista de nomes.
 */

const COD = {
  kw: "#C099FF",
  spx: "var(--color-viol)",
  str: "#FF2D55",
  id: "#D5D5DD",
  dim: "#6E6A80",
} as const;

type Peca = {
  nome: string;
  args: string;
  tipo: string;
};

/* NOME, ASSINATURA E TIPO NÃO TRADUZEM: são o identificador em Python, e
   traduzir identificador seria escrever código que não existe. Só a descrição
   muda de idioma, no bloco `T` abaixo, na mesma ordem desta lista. */
const API: Peca[] = [
  {
    nome: "watch",
    args: "(stream, run=None, on_end=None)",
    tipo: "async iterator",
  },
  {
    nome: "Run",
    args: "",
    tipo: "dataclass",
  },
  {
    nome: "last_run",
    args: "()",
    tipo: "Run | None",
  },
  {
    nome: "runs",
    args: "()",
    tipo: "list[Run]",
  },
];

/* As tuplas literais de `_run.py`, sem edição. */
const CAMPOS: [string, string[]][] = [
  ["cost", ["total_cost_usd", "cost_usd", "total_cost"]],
  ["turns", ["num_turns", "turns"]],
  ["in", ["input_tokens", "prompt_tokens", "in_tokens"]],
  ["out", ["output_tokens", "completion_tokens", "out_tokens"]],
  ["cache", ["cache_read_input_tokens", "cache_creation_input_tokens", "cached_tokens"]],
];

const T = {
  en: {
    olho: "the api",
    h2: "Four names. That is the whole library.",
    subA: "The literal",
    subB: ": these four and a version string. All of it ships in the release on PyPI.",
    descs: [
      "Wraps the async iterator your agent already returns, accounts for every message, and yields each one untouched and in order.",
      "Counters for a single run: cost, in/out/cache tokens, turns, messages and a tally of tool calls by name. No message content is ever stored.",
      "The most recently finished run.",
      "Finished runs still in memory, oldest first.",
    ],
    magiaOlho: "no magic",
    magiaH: "How it finds your numbers.",
    magiaP: "Runtimes disagree on spelling, and the file cannot import any of them to find out. So each number is looked up across a literal list of candidate names.",
    fechoA: "Which is why a second runtime is not an integration. It is",
    fechoB: "another list of names",
  },
  pt: {
    olho: "a api",
    h2: "Quatro nomes. É a biblioteca toda.",
    subA: "O",
    subB: "literal: estes quatro e uma string de versão. Tudo já está na versão publicada no PyPI.",
    descs: [
      "Recebe o iterador assíncrono que seu agente já devolve, contabiliza cada mensagem e entrega uma por uma, intactas e na ordem.",
      "Contadores de uma execução: custo, tokens de entrada/saída/cache, turnos, mensagens e a contagem de chamadas por nome de ferramenta. Nenhum conteúdo de mensagem é guardado.",
      "A execução mais recente que terminou.",
      "Execuções concluídas ainda em memória, da mais antiga pra mais nova.",
    ],
    magiaOlho: "sem mágica",
    magiaH: "De onde ele tira os seus números.",
    magiaP: "Cada runtime escreve o nome de um jeito, e o arquivo não pode importar nenhum deles pra descobrir qual. Então cada número é procurado numa lista literal de nomes candidatos.",
    fechoA: "É por isso que um segundo runtime não é uma integração. É",
    fechoB: "outra lista de nomes",
  },
};

export function ApiSection() {
  const t = useTxt(T);
  return (
    <section id="api" className="relative">
      {/* mesma costura da seção anterior: o feixe sobre a emenda */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-[14%] left-[14%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.45),transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-[clamp(76px,10vh,116px)] lg:px-10">
        <Reveal>
          <span className="olho">
            <i aria-hidden="true" />
            {t.olho}
          </span>
          <h2 className="h-secao mt-3.5 max-w-[22ch]">{t.h2}</h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-[1.7] font-[450] text-ink-2">
            {t.subA} <span className="font-jet text-[13.5px] text-ink">__all__</span> {t.subB}
          </p>
        </Reveal>

        <Reveal className="mt-[clamp(38px,5vh,60px)]">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
            {/* ── os quatro nomes ── */}
            <div className="overflow-hidden rounded-[14px] border border-(--hair) bg-[#0A0910]">
              {API.map((p, i) => (
                <div
                  key={p.nome}
                  className={`px-6 py-5 ${i ? "border-t border-(--hair)" : ""}`}
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-jet text-[14px]">
                      <span className="font-medium" style={{ color: COD.spx }}>
                        {p.nome}
                      </span>
                      <span style={{ color: COD.dim }}>{p.args}</span>
                    </span>
                    <span className="ml-auto shrink-0 rounded-md border border-(--hair) px-2 py-[2px] font-mono text-[9px] tracking-[.12em] lowercase text-ink-3">
                      {p.tipo}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[62ch] text-[13px] leading-[1.65] text-ink-2">
                    {t.descs[i]}
                  </p>
                </div>
              ))}

              {/* O import que traz tudo: fecha a lista mostrando que ela cabe
                  numa linha só. */}
              {/* Os quatro nomes já aparecem em mint logo acima, um por linha.
                  Repeti-los em mint aqui dobrava a dose sem acrescentar
                  informação — a linha existe pra mostrar que TUDO cabe num
                  import só, e isso é sobre a forma, não sobre os nomes. */}
              <div className="border-t border-(--hair) bg-[#08070D] px-6 py-3.5">
                <pre className="overflow-x-auto font-jet text-[12px]" style={{ color: COD.id }}>
                  <code>
                    <span style={{ color: COD.kw }}>from</span> spanix{" "}
                    <span style={{ color: COD.kw }}>import</span> watch, Run, last_run, runs
                  </code>
                </pre>
              </div>
            </div>

            {/* ── sem mágica ── */}
            <div className="flex flex-col overflow-hidden rounded-[14px] border border-(--hair) bg-[#0A0910] px-6 py-5">
              {/* Rótulo na mesma gramática do `.olho` das seções: traço curto
                  em mint, texto em tinta neutra. Ele estava inteiro em mint e
                  era um dos pontos que faziam a coluna parecer verde demais. */}
              <span className="inline-flex w-fit items-center gap-2.5 font-mono text-[9px] tracking-[.22em] uppercase text-ink-3">
                <i
                  aria-hidden="true"
                  className="block h-px w-[14px]"
                  style={{ background: "rgba(var(--viol-rgb),.75)" }}
                />
                {t.magiaOlho}
              </span>
              <h3 className="mt-3 font-sora text-[17px] leading-[1.24] font-semibold tracking-[-.025em] text-white">
                {t.magiaH}
              </h3>
              <p className="mt-2.5 text-[13px] leading-[1.65] text-ink-2">
                {t.magiaP}
              </p>

              <dl className="mt-5 flex flex-col">
                {CAMPOS.map(([campo, nomes], i) => (
                  <div key={campo} className={`py-2.5 ${i ? "border-t border-white/8" : ""}`}>
                    {/* Branco, não mint. `cost`, `turns`, `in` são campos de
                        OUTROS runtimes — não são símbolos do spanix, e o mint
                        só marca símbolos do spanix. Pintá-los de mint quebrava
                        a própria regra e enchia a coluna de verde. */}
                    <dt className="font-jet text-[11px] font-medium text-ink">{campo}</dt>
                    <dd className="mt-1 flex flex-wrap gap-x-2 gap-y-1 font-jet text-[10.5px] text-ink-3">
                      {nomes.map((n, j) => (
                        <span key={n}>
                          {j > 0 && <span className="mr-2 opacity-40">·</span>}
                          {n}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-auto border-t border-white/8 pt-4 text-[12.5px] leading-[1.6] text-ink-3">
                {t.fechoA} <span className="text-ink">{t.fechoB}</span>.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

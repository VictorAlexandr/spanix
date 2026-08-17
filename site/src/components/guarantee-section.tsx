"use client";

import { useTxt } from "./i18n";

import { REDE } from "./run-nightly";
import Reveal from "./reveal";

/**
 * Seção 04 · a garantia.
 *
 * POR QUE ELA EXISTE. As seções 02 e 03 respondem "o que a ferramenta faz".
 * Nenhuma responde as três perguntas que um dev faz ANTES de instalar um
 * profiler no laço de produção: isso derruba meu agente? me custa latência?
 * vaza meus prompts? Enquanto elas ficam sem resposta, todo o resto da página
 * é conversa — ninguém instala o que pode quebrar.
 *
 * O QUE ELA NÃO É: uma seção de marketing sobre confiança. As três respostas
 * já estavam escritas, palavra por palavra, como RESTRIÇÕES DE PROJETO no topo
 * do `_run.py` — em ordem de importância, inclusive. Esta seção só traz o que
 * já existe no código pra superfície, e mostra o trecho ao lado de cada
 * afirmação.
 *
 * É a diferença entre "seus dados estão seguros" e "olha o `try/except` que
 * garante isso". A primeira é promessa; a segunda é auditável em trinta
 * segundos no repo — e o público daqui é exatamente quem vai conferir.
 *
 * FORMA: folha de especificação, não cartão. Três colunas separadas por fio,
 * sem caixa, sem sombra, sem elevação. As seções 02 e 03 já são "texto de um
 * lado, tela do outro"; repetir a mesma composição uma terceira vez faria a
 * página inteira ter um ritmo só. Aqui a leitura é horizontal e seca, do jeito
 * que se lê uma tabela de garantia.
 */

const COD = {
  kw: "#C099FF",
  fn: "#7AA2F7",
  str: "#FF2D55",
  spx: "var(--color-viol)",
  id: "#D5D5DD",
  dim: "#6E6A80",
} as const;

type Linha = { t: string; c?: string }[];

/* A ESTRUTURA fica aqui; o TEXTO fica no bloco de idioma logo abaixo, na
   mesma ordem. O código não traduz: ele é citação literal do fonte, e citação
   traduzida deixa de ser prova. */
const REGRAS: { n: string; arquivo: string; codigo: Linha[] }[] = [
  {
    n: "01",
    arquivo: "spanix/__init__.py",
    codigo: [
      [{ t: "async for", c: COD.kw }, { t: " msg " }, { t: "in", c: COD.kw }, { t: " stream:" }],
      [{ t: "    try", c: COD.kw }, { t: ":" }],
      [{ t: "        r." }, { t: "record", c: COD.fn }, { t: "(msg)" }],
      [{ t: "    except", c: COD.kw }, { t: " Exception:" }],
      [{ t: "        pass", c: COD.kw }, { t: "   # nunca propaga", c: COD.dim }],
      [{ t: "    yield", c: COD.kw }, { t: " msg" }],
    ],
  },
  {
    n: "02",
    arquivo: "pyproject.toml",
    codigo: [
      [{ t: "[project]", c: COD.dim }],
      [{ t: "name" }, { t: " = " }, { t: '"spanix"', c: COD.str }],
      [{ t: "requires-python" }, { t: " = " }, { t: '">=3.10"', c: COD.str }],
      [
        { t: "dependencies" },
        { t: " = " },
        { t: "[]", c: COD.spx },
        { t: "   # nenhuma", c: COD.dim },
      ],
    ],
  },
  {
    n: "03",
    arquivo: "spanix/_run.py",
    codigo: [
      [{ t: "@dataclass", c: COD.fn }],
      [{ t: "class", c: COD.kw }, { t: " " }, { t: "Run", c: COD.fn }, { t: ":" }],
      [{ t: "    cost_usd: " }, { t: "float", c: COD.fn }, { t: " = 0.0" }],
      [{ t: "    in_tokens: " }, { t: "int", c: COD.fn }, { t: " = 0" }],
      [{ t: "    tools: " }, { t: "dict", c: COD.fn }, { t: "[str, int]" }],
      [{ t: "    # sem prompt, sem argumento, sem resultado", c: COD.dim }],
    ],
  },
];

const T = {
  en: {
    olho: "the guarantee",
    h2: "Three things it will never do.",
    sub: "Not promises. Design constraints, in the order they appear at the top of the source. All three are one grep away.",
    regras: [
      {
        regra: "never break the caller",
        titulo: "It cannot take your agent down.",
        desc: "Every recording path is wrapped, and the message is yielded untouched no matter what happens inside. A profiler that takes down production is a profiler nobody installs.",
      },
      {
        regra: "never import the sdk",
        titulo: "It adds nothing to your tree.",
        desc: "The agent SDK is never imported. Fields are read by name, with fallbacks. Zero dependencies means pip install spanix drags nothing else in, and a second runtime is only another list of names.",
      },
      {
        regra: "never keep content",
        titulo: "It only ever sees numbers.",
        desc: "Prompts, tool arguments and tool results carry API keys and customer data, so none of them are stored. What the Run keeps is counters and tool names. That is the whole object.",
      },
    ],
    trafego: "outbound traffic · since install",
    trafegoT: "Nothing leaves your machine.",
  },
  pt: {
    olho: "a garantia",
    h2: "Três coisas que o spanix nunca faz.",
    sub: "Não são promessas. São restrições de projeto, na ordem em que aparecem no topo do código-fonte. As três estão a um grep de distância.",
    regras: [
      {
        regra: "nunca quebrar quem chama",
        titulo: "Não tem como derrubar seu agente.",
        desc: "Todo caminho de gravação está protegido, e a mensagem sai intacta aconteça o que acontecer lá dentro. Profiler que derruba produção é profiler que ninguém instala.",
      },
      {
        regra: "nunca importar o sdk",
        titulo: "Não entra nada na sua árvore.",
        desc: "O SDK do agente nunca é importado: os campos são lidos por nome, com alternativas. Zero dependências quer dizer que pip install spanix não arrasta mais nada junto, e que um segundo runtime é só outra lista de nomes.",
      },
      {
        regra: "nunca guardar conteúdo",
        titulo: "Só enxerga números.",
        desc: "Prompt, argumento e resultado de ferramenta carregam chave de API e dado de cliente, então nada disso é guardado. O que o Run guarda são contadores e nomes de ferramenta. É o objeto inteiro.",
      },
    ],
    trafego: "tráfego de saída · desde a instalação",
    trafegoT: "Nada sai da sua máquina.",
  },
};

export function GuaranteeSection() {
  const t = useTxt(T);
  return (
    <section id="guarantee" className="relative">
      {/* O FEIXE, e só ele. A dissolvência já vem de cima: a seção do painel é
          clara e termina devolvendo o escuro, então somar outra aqui
          empilharia duas sombras e viraria uma faixa preta grossa. O que
          faltava era a segunda metade do par — o fio de luz que some nas
          pontas, exatamente sobre a emenda. A dissolvência esconde que houve
          um corte; o fio avisa que houve. Sem ele as seções derretem uma na
          outra. */}
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
          <h2 className="h-secao mt-3.5 max-w-[20ch]">{t.h2}</h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-[1.7] font-[450] text-ink-2">
            {t.sub}
          </p>
        </Reveal>

        {/* Folha de especificação: fio de 1px entre as colunas, sem caixa. */}
        <Reveal className="mt-[clamp(38px,5vh,60px)]">
          <div className="grid gap-px overflow-hidden rounded-[14px] border border-(--hair) bg-(--hair) md:grid-cols-3">
            {REGRAS.map((r, ri) => (
              <article key={r.n} className="flex flex-col bg-[#0A0910] px-6 py-6">
                <span className="flex items-center gap-2.5">
                  <span className="font-jet text-[10px] text-ink-3 tabular-nums">{r.n}</span>
                  <i aria-hidden="true" className="block h-px w-4 bg-[rgba(255,45,85,.6)]" />
                  {/* O CARMIM ENTRA NO "NEVER", e só nele. As três regras
                      começam com a mesma palavra, então isso vira uma coluna
                      de três recusas descendo a seção — o eco visual da
                      manchete, dito na cor que a página já usa pro perigo. O
                      resto do rótulo fica violeta: o que se recusa é
                      vermelho, o que se faz é da marca. */}
                  <span className="font-mono text-[9px] tracking-[.2em] uppercase text-(--color-viol-txt)">
                    <span className="text-[#FF5C7A]">
                      {t.regras[ri].regra.split(" ")[0]}
                    </span>{" "}
                    {t.regras[ri].regra.split(" ").slice(1).join(" ")}
                  </span>
                </span>

                <h3 className="mt-4 font-sora text-[18px] leading-[1.24] font-semibold tracking-[-.025em] text-white">
                  {t.regras[ri].titulo}
                </h3>
                <p className="mt-2.5 text-[13px] leading-[1.68] text-ink-2">{t.regras[ri].desc}</p>

                <div className="mt-auto pt-6">
                  <div className="overflow-hidden rounded-[9px] border border-white/10 bg-[#08070D]">
                    <div className="border-b border-white/8 px-3.5 py-1.5">
                      <span className="font-jet text-[9.5px] text-ink-3">{r.arquivo}</span>
                    </div>
                    <div className="overflow-x-auto px-3.5 py-3">
                      <pre
                        className="font-jet text-[11px] leading-[1.75]"
                        style={{ color: COD.id }}
                      >
                        <code>
                          {r.codigo.map((linha, i) => (
                            <span key={i}>
                              {linha.map((tk, j) => (
                                <span key={j} style={tk.c ? { color: tk.c } : undefined}>
                                  {tk.t}
                                </span>
                              ))}
                              {"\n"}
                            </span>
                          ))}
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        {/* ── o resumo das três ──────────────────────────────────────────────
            As três regras somam uma frase só, e ela é a única coisa que o
            produto garante. Aqui ela vem com o gráfico que a prova: a linha de
            tráfego de saída, reta no zero. Gráfico deliberadamente chato é a
            prova mais forte que esta seção pode dar — não há pico porque não
            há requisição. */}
        <Reveal className="mt-4">
          <div className="flex flex-col gap-5 rounded-[14px] border border-(--hair) bg-[#0A0910] px-6 py-5 sm:flex-row sm:items-center sm:gap-8">
            <div className="shrink-0">
              <span className="font-mono text-[9px] tracking-[.2em] uppercase text-ink-3">
                {t.trafego}
              </span>
              <p className="mt-2 font-sora text-[19px] leading-[1.2] font-semibold tracking-[-.025em] text-white">
                {t.trafegoT}
              </p>
            </div>

            <div className="min-w-0 flex-1">
              <svg
                viewBox="0 0 400 26"
                preserveAspectRatio="none"
                className="h-[26px] w-full"
                role="img"
                aria-label="Outbound network traffic since install: a flat line at zero"
              >
                <line
                  x1="0"
                  x2="400"
                  y1="25"
                  y2="25"
                  stroke="rgba(255,255,255,.09)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1="0"
                  x2="400"
                  y1="21"
                  y2="21"
                  stroke={REDE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="mt-1.5 flex items-baseline justify-between font-jet text-[10.5px]">
                <span style={{ color: REDE }}>0 B out</span>
                <span className="text-ink-3 tabular-nums">0 requests · 0 accounts</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

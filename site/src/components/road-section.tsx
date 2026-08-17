"use client";

import { Install } from "./install";
import { Marca } from "./marca";
import { useTxt } from "./i18n";
import Reveal from "./reveal";

/**
 * Seção 07 · o caminho, e o fim da página.
 *
 * DOIS TRABALHOS NUMA SEÇÃO. O primeiro é fechar uma lacuna de integridade:
 * a seção 03 mostra um painel que a 0.0.2 não tem, e a seção da API diz
 * "everything here ships in the version on PyPI". Um leitor atento junta as
 * duas e pergunta: então cadê o painel? O roadmap responde — e converte a
 * fraqueza em credibilidade, porque "shipping in the open" é valor dev raiz;
 * esconder a versão é que seria suspeito.
 *
 * O segundo é dar fim à página. Ela argumentava e simplesmente PARAVA no
 * rodapé; quem rolou tudo não tinha onde clicar. O CTA final devolve o
 * `pip install` no exato momento em que a pessoa terminou de ser convencida.
 *
 * TUDO AQUI VEM DO CHANGELOG. As duas colunas são a seção [0.0.1]/[0.0.2] e o
 * "Planned for 0.1.0" do `CHANGELOG.md`, sem item inventado — e o link pro
 * arquivo está na própria seção, porque roadmap sem fonte é promessa.
 *
 * FORMA: duas colunas sobre um fio vertical, HOJE à esquerda e A SEGUIR à
 * direita, com o agora marcado por um ponto aceso. Não é timeline de quatro
 * eras: são dois estados e uma travessia, que é a situação real do projeto.
 *
 * ── POR QUE `0.1.0` E NÃO `0.1` ───────────────────────────────────────────
 * Porque `0.0.2` ao lado de `0.1` faz o leitor parar. São contagens de
 * segmentos diferentes lado a lado, e quem lê os dois como decimal chega a
 * achar que o número DIMINUIU. O próprio dono do projeto travou meio segundo
 * nisso; visitante que nunca viu semver com zero na frente trava mais.
 *
 * Com `0.1.0`, os dois viram três segmentos e o dígito do meio sobe à vista:
 *
 *     0 . 0 . 2        hoje
 *     0 . 1 . 0        a seguir
 *         ↑ é este que anda
 *
 * De quebra é a grafia que o `CHANGELOG.md` já usa ("Planned for 0.1.0"), e
 * a seção cita esse arquivo duas linhas acima. Custava dois caracteres. */

const REPO = "https://github.com/VictorAlexandr/spanix";

/* Nomes de comando e caminhos de arquivo não traduzem: é o que a pessoa vai
   digitar. Só a explicação ao lado muda.

   ── ERA `spanix runs` + `spanix serve`, VIROU UM SÓ ─────────────────────
   A coluna prometia dois comandos separados, o que contradizia a decisão da
   §5.2 do KNOWLEDGE.md: um comando só, que imprime o resumo e devolve o link.
   Dois comandos obrigam a pessoa a saber a diferença entre "ver a tabela" e
   "abrir o painel" antes de ter motivo pra se importar com ela — e deixavam a
   página com a mesma pergunta em aberto que o card da seção 02 tinha: é
   terminal ou é localhost? É os dois, em ordem, com um comando. */
const T = {
  en: {
    olho: "the road",
    h2: "0.0.2 today. The panel lands in 0.1.0.",
    subA: "Everything on this page either ships today or is next on the",
    subLink: "changelog",
    subB: ". Built in the open. The version number is part of the product.",
    entregue: "shipped",
    aSeguir: "next",
    hoje: [
      "watch() wraps your stream, zero deps",
      "cost, tokens, turns and tools, per run",
      "summary() prints the receipt",
      "Apache-2.0, on PyPI",
    ],
    depois: [
      "~/.spanix/runs.db, so runs survive the process",
      "the receipt in your terminal, the panel on localhost",
    ],
    fecho: "One line. Your machine. The whole story.",
    estrela: "Read the source",
    pe: "free forever · no signup · nothing leaves your machine",
  },
  pt: {
    olho: "o caminho",
    h2: "0.0.2 hoje. O painel chega na 0.1.0.",
    subA: "Tudo nesta página ou já está publicado, ou é o próximo item do",
    subLink: "changelog",
    subB: ". Construindo em aberto. O número da versão faz parte do produto.",
    entregue: "no ar",
    aSeguir: "a seguir",
    hoje: [
      "watch() em volta do seu stream, zero dependências",
      "custo, tokens, turnos e ferramentas, a cada execução",
      "summary() imprime o recibo",
      "Apache-2.0, no PyPI",
    ],
    depois: [
      "~/.spanix/runs.db, pras execuções sobreviverem ao processo",
      "o resumo no terminal, e o painel no localhost",
    ],
    fecho: "Uma linha. Sua máquina. A história inteira.",
    estrela: "Leia o código-fonte",
    pe: "grátis pra sempre · sem cadastro · nada sai da sua máquina",
  },
};

const DEPOIS = [
  { cmd: false },
  { cmd: true, comando: "spanix" },
];

export function RoadSection() {
  const t = useTxt(T);
  return (
    <section id="roadmap" className="relative">
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
          <p className="mt-3.5 max-w-[60ch] text-[15px] leading-[1.7] font-[450] text-ink-2">
            {t.subA}{" "}
            <a
              href={`${REPO}/blob/main/CHANGELOG.md`}
              target="_blank"
              rel="noreferrer"
              className="text-ink underline decoration-white/25 underline-offset-2 transition-colors hover:decoration-white/60"
            >
              {t.subLink}
            </a>
            {t.subB}
          </p>
        </Reveal>

        <Reveal className="mt-[clamp(38px,5vh,56px)]">
          <div className="grid max-w-[900px] gap-10 md:grid-cols-2 md:gap-14">
            {/* ── hoje ── */}
            <div className="relative pl-7">
              <span
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-0 w-px"
                style={{ background: "linear-gradient(180deg,rgba(var(--mint-rgb),.5),rgba(var(--mint-rgb),.06))" }}
              />
              {/* VERDE, e só nesta coluna: entregue = verde é a semântica
                  mais velha que existe, e é o único lugar da seção onde o
                  mint diz algo. A coluna da direita é VIOLETA, não cinza:
                  cinza dizia "menos importante" quando o que ela diz é "o que
                  vem", e roadmap é argumento de venda, não rodapé. O que
                  separa feito de prometido não é a saturação, é o
                  PREENCHIMENTO: ponto sólido aqui, anel vazado lá. */}
              <span
                aria-hidden="true"
                className="pulse-dot absolute top-1 -left-[3.5px] size-2 rounded-full bg-mint shadow-[0_0_12px_var(--color-mint)]"
              />
              <span className="font-mono text-[10px] tracking-[.22em] uppercase text-mint">
                v0.0.2 · {t.entregue}
              </span>
              <ul className="mt-4 flex flex-col gap-3">
                {t.hoje.map((linha) => (
                  <li key={linha} className="flex items-start gap-3 text-[14px] leading-[1.55] text-ink-2">
                    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-[3px] size-[13px] shrink-0">
                      <path
                        d="M3.4 8.5 6.3 11.4 12.6 5"
                        fill="none"
                        stroke="var(--color-mint)"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {linha}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── a seguir ── */}
            <div className="relative pl-7">
              <span
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-0 w-px"
                style={{ background: "linear-gradient(180deg,rgba(var(--viol-rgb),.5),rgba(var(--viol-rgb),.06))" }}
              />
              <span
                aria-hidden="true"
                className="absolute top-1 -left-[3.5px] size-2 rounded-full border-[1.5px] border-viol bg-transparent shadow-[0_0_10px_rgba(var(--viol-rgb),.55)]"
              />
              <span className="font-mono text-[10px] tracking-[.22em] uppercase text-(--color-viol-txt)">
                v0.1.0 · {t.aSeguir}
              </span>
              <ul className="mt-4 flex flex-col gap-3">
                {DEPOIS.map((i, di) => (
                  <li key={di} className="flex items-start gap-3 text-[14px] leading-[1.55] text-ink-2">
                    <span
                      aria-hidden="true"
                      className="mt-[8px] block size-[5px] shrink-0 rounded-full bg-viol/85 shadow-[0_0_6px_rgba(var(--viol-rgb),.6)]"
                    />
                    <span>
                      {i.cmd ? (
                        <>
                          <span className="font-jet text-[13px] text-ink">{i.comando}</span>
                          <span className="text-ink-2"> · {t.depois[di]}</span>
                        </>
                      ) : (
                        t.depois[di]
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        {/* ── o fim da página ──
            O comando volta aqui porque é aqui que a decisão acontece: quem
            rolou até o fim terminou de ser convencido, e fazê-lo subir a
            página inteira pra achar o `pip install` é perder a conversão no
            último metro. */}
        <Reveal className="mt-[clamp(56px,8vh,88px)]">
          <div className="flex flex-col items-center text-center">
            <h3 className="font-sora text-[clamp(24px,3vw,34px)] leading-[1.15] font-semibold tracking-[-.03em] text-white">
              {t.fecho}
            </h3>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-[13px]">
              <Install cmd="pip install spanix" />
              <a
                href={REPO}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-[9px] rounded-[10px] border border-white/18 px-8 py-[15px] text-[14.5px] font-semibold text-ink transition-all hover:-translate-y-[2px] hover:border-viol hover:text-viol motion-reduce:hover:translate-y-0"
              >
                <Marca nome="github" className="size-[16px] shrink-0" />
                {t.estrela}{" "}
                <span aria-hidden="true" className="font-mono">
                  &rarr;
                </span>
              </a>
            </div>
            <span className="mt-6 font-mono text-[10.5px] tracking-[.1em] lowercase text-ink-3">
              {t.pe}
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

import CopyCommand from "./copy-command";
import Reveal from "./reveal";

/**
 * Seção 04 · dois planos, com hierarquia.
 *
 * Sem glow neon. Vermelho no sistema significa FALHA, então não pode marcar o
 * plano padrão; e barra saturada de 3px em cima de cada card é linguagem de
 * template, não de ferramenta.
 *
 * A hierarquia é bento, não simetria:
 *
 *   LOCAL   superfície plana #0A0A0B, borda white/10, sem sombra e sem
 *           elevação. Ele é o ESTADO NATURAL do produto, então tem que ler
 *           como um bloco de terminal embutido na página, não como oferta.
 *
 *   CLOUD   coluna maior (1.12fr), superfície um passo acima, fio de luz
 *           interno na aresta de cima e sombra real. É upgrade opcional, e
 *           só ele carrega cor: o âmbar do selo e o branco sólido do botão.
 *
 * O contraste entre os dois vem de SUPERFÍCIE e PESO, que é o que dá cara de
 * deep tech. Cor saturada entra uma vez por card, no máximo.
 */

const LOCAL = [
  "one line around the stream you already have",
  "call graph with cost on every node",
  "timeline, retries and stuck tools",
  "drift between one run and the next",
  "SQLite on your disk, no network needed",
];

const CLOUD = [
  "everything in Local, unchanged",
  "alert when a run's cost jumps",
  "keeps watching after you close the terminal",
  "every machine and CI job in one place",
  "budget ceiling, webhook when it breaks",
];

function Item({ t, cor }: { t: string; cor: string }) {
  return (
    <li className="flex gap-3 text-[12.5px] leading-[1.45] text-ink-2">
      <span className={`mt-[6px] block size-[3px] shrink-0 rotate-45 ${cor}`} />
      {t}
    </li>
  );
}

export function PricingSection() {
  return (
    <section id="pricing" className="relative">
      {/* Container na largura dos cards: titulo, texto e grade num EIXO SO.
          Cabecalho a esquerda com cards centralizados eram dois eixos na mesma
          secao, e era isso que lia como bug. As secoes 02 e 03 seguem alinhadas
          a esquerda; pricing centraliza de proposito, e a diferenca marca que
          aqui a leitura e outra. */}
      <div className="mx-auto w-full max-w-[860px] px-6 py-[clamp(66px,9vh,104px)]">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="olho">
              <i aria-hidden="true" />
              04 · pricing
              <i aria-hidden="true" />
            </span>
            <h2 className="h-secao mt-4">
              Where the free part stops.
            </h2>
            <p className="mt-3.5 max-w-[56ch] text-[14.5px] leading-[1.7] font-[450] text-ink-2">
              Every profiling feature is free and runs on your machine. The cloud only sells
              what localhost cannot do, like waking you up at 3am.
            </p>
          </div>
        </Reveal>

        <div className="mt-[clamp(32px,4.5vh,52px)] grid items-stretch gap-5 md:grid-cols-[1fr_1.12fr]">
          {/* ══ LOCAL · bloco de terminal, sem elevação ══ */}
          <Reveal>
            <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-[#0A0A0B] px-6 py-7">
              <span className="flex items-center gap-2.5">
                <i aria-hidden="true" className="pulse-dot block size-[5px] rounded-full bg-ok" />
                <span className="text-[10.5px] font-semibold tracking-[.1em] text-ink-3 uppercase">local</span>
              </span>

              <span className="mt-3.5 flex items-baseline gap-2.5">
                <span className="font-sora text-[26px] leading-none font-semibold tracking-[-.035em] text-white">
                  Free
                </span>
                <span className="text-[12.5px] text-ink-3">forever · Apache-2.0</span>
              </span>

              <CopyCommand cmd="pip install spanix" />

              <ul className="mt-5 space-y-[8px]">
                {LOCAL.map((t) => (
                  <Item key={t} t={t} cor="bg-ok" />
                ))}
              </ul>

              <span className="mt-auto pt-5 text-[12px] text-ink-3">
                No account, no telemetry, no limits.
              </span>
            </article>
          </Reveal>

          {/* ══ CLOUD · upgrade opcional. Um passo acima na superfície ══ */}
          <Reveal delay={110}>
            <article className="flex h-full flex-col rounded-2xl border border-white/14 bg-[#0E0C16] px-6 py-7 shadow-[0_24px_60px_-20px_rgba(0,0,0,.9),inset_0_1px_0_rgba(255,255,255,.07)]">
              <span className="flex items-center gap-2.5">
                <span className="text-[10.5px] font-semibold tracking-[.1em] text-ink-3 uppercase">cloud</span>
                {/* A nuvem ainda não subiu. Âmbar comunica beta sem gritar, e
                    não colide com o vermelho, que aqui significa falha. */}
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-[2.5px] text-[9px] font-semibold tracking-[.07em] text-amber-500 uppercase">
                  in development
                </span>
              </span>

              <span className="mt-3.5 flex items-baseline gap-2.5">
                <span className="font-sora text-[26px] leading-none font-semibold tracking-[-.035em] text-white">
                  $19
                </span>
                <span className="text-[12.5px] text-ink-3">per dev · month</span>
              </span>

              <a
                href="/checkout"
                className="group mt-4 flex items-center justify-center gap-2 rounded-lg bg-white py-[9px] text-[12.5px] font-semibold text-black transition-colors hover:bg-gray-200"
              >
                Go to checkout
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-[3px]">
                  →
                </span>
              </a>

              <ul className="mt-5 space-y-[8px]">
                {CLOUD.map((t) => (
                  <Item key={t} t={t} cor="bg-viol" />
                ))}
              </ul>

              <span className="mt-auto pt-5 text-[12px] text-ink-3">
                Metrics only. Your prompts never leave.
              </span>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

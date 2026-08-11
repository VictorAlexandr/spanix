import Reveal from "./reveal";

/**
 * Seção 02 · a apresentação da biblioteca.
 *
 * Quatro cartões iguais, e a COR É RECOMPENSA DO HOVER, não estado de repouso.
 * Em repouso tudo é grafite: barra do topo apagada, número em cinza, artefatos
 * monocromáticos. Quatro barras saturadas lado a lado viram mural de
 * patrocinador — e o hover, que antes só levantava o cartão, passa a ter
 * consequência visível.
 *
 * Cada cartão carrega um ARTEFATO: um trecho de código, um caminho de arquivo,
 * uma barra, um sparkline. Afirmação sem evidência é slide.
 *
 * Tudo em `group-hover`, sem estado e sem JS por quadro.
 */

const CARDS: [string, string, string, string][] = [
  ["01", "One line", "Wrap the stream your agent already returns. Nothing else in your code moves.", "zero config"],
  ["02", "Local first", "SQLite on your disk, panel on localhost. The cloud is opt-in and never sees a prompt.", "your data stays yours"],
  ["03", "Cost per node", "The SDK prices every turn and discards it. spanix keeps it and rolls it up the tree.", "subagents included"],
  ["04", "Drift over time", "Four turns last month, eleven today. Nothing broke. It just got slower and more expensive.", "nothing else shows this"],
];

const DERIVA = [4, 4, 5, 6, 8, 9, 11];

/* O acento que aparece DENTRO dos dados. Uma constante só — trocar por carmim
   (#BE2D55) é uma linha. As quatro cores por cartão continuam guardadas pro
   hover; esta aqui é o clima da seção. */
const ACENTO = "var(--color-crim)";  // token --crim · antes hex solto aqui

/* Artefatos em grafite. A única cor em repouso é o `watch` — porque ele É o
   produto — e mesmo essa fica contida. */
const ARTEFATO: Record<string, React.ReactNode> = {
  "01": (
    <div className="rounded-lg border border-[rgba(var(--viol-rgb),.14)] bg-black/45 px-3.5 py-3 font-jet text-[11px] leading-[1.7]">
      <span className="text-ink-3">async for msg in </span>
      <span className="text-viol">watch</span>
      <span className="text-ink-3">(stream):</span>
    </div>
  ),
  "02": (
    <div className="flex items-center gap-2.5 rounded-lg border border-[rgba(var(--viol-rgb),.14)] bg-black/45 px-3.5 py-3">
      <i className="size-[4px] shrink-0 rounded-full" style={{ background: ACENTO }} />
      <span className="font-jet text-[11px]" style={{ color: ACENTO }}>~/.spanix/runs.db</span>
      <span className="ml-auto font-jet text-[10px] text-ink-3">offline</span>
    </div>
  ),
  "03": (
    <div className="rounded-lg border border-[rgba(var(--viol-rgb),.14)] bg-black/45 px-3.5 py-3">
      <div className="flex h-[6px] gap-[3px]">
        <span className="rounded-[2px] bg-white/22" style={{ width: "22%" }} />
        <span className="rounded-[2px]" style={{ width: "64%", background: ACENTO }} />
        <span className="rounded-[2px] bg-white/16" style={{ width: "14%" }} />
      </div>
      <div className="mt-2 flex justify-between font-jet text-[10px] text-ink-3 tabular-nums">
        <span>$0.14</span>
        <span style={{ color: ACENTO }}>research $0.42</span>
        <span>$0.09</span>
      </div>
    </div>
  ),
  "04": (
    <div className="rounded-lg border border-[rgba(var(--viol-rgb),.14)] bg-black/45 px-3.5 py-3">
      <div className="flex h-[34px] items-end gap-[4px]">
        {DERIVA.map((t, i) => (
          <span
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${(t / 11) * 100}%`,
              background: i > 3 ? ACENTO : "#fff",
              opacity: i > 3 ? 0.9 : 0.16,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between font-jet text-[10px] text-ink-3 tabular-nums">
        <span>4 turns</span>
        <span style={{ color: ACENTO }}>11 turns</span>
      </div>
    </div>
  ),
};

export function LibrarySection() {
  return (
    <section id="library" className="relative">
      <div className="mx-auto w-full max-w-[1280px] px-6 py-[clamp(88px,13vh,148px)] lg:px-10">
        <Reveal>
          <span className="olho">
            <i aria-hidden="true" />
            02 · the library
          </span>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-3">
            <h2 className="h-secao">A profiler, not a platform.</h2>
            <i aria-hidden="true" className="mx-2 hidden h-px flex-1 bg-(--hair) lg:block" />
          </div>
          <p className="mt-4 max-w-[62ch] text-[15.5px] leading-[1.72] font-[450] text-ink-2">
            One <span className="font-jet text-[14px] text-ink">pip install</span>. It runs on your
            machine and keeps the numbers the SDK throws away.
          </p>
        </Reveal>

        <div className="mt-[clamp(54px,7.5vh,88px)] grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map(([n, t, d, tag], i) => (
            <Reveal key={n} delay={i * 100}>
              <article
                style={{
                  background:
                    "radial-gradient(130% 82% at 50% 122%, rgba(var(--viol-rgb),.13), transparent 62%), #0A090F",
                }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-(--hair) px-7 pt-9 pb-7 shadow-[0_14px_34px_rgba(0,0,0,.42)] transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-[7px] hover:border-white/14 hover:shadow-[0_30px_62px_rgba(0,0,0,.78)] motion-reduce:hover:translate-y-0"
              >
                {/* Uma barra só, sempre em ultravioleta. A troca de cor por cartão
                    saiu: quatro matizes piscando no hover é ruído, e o acento do
                    site é um só. */}
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-viol" />
                {/* halo descendo da aresta: é ela que dá a sensação de luz e não de traço */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-[86px] opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(var(--viol-rgb),.22), transparent 78%)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-10 -right-10 size-[160px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: "radial-gradient(closest-side, rgba(var(--viol-rgb),.16), transparent 70%)" }}
                />

                <span className="block font-jet text-[11.5px] text-ink-3 transition-colors duration-300 group-hover:text-viol tabular-nums">
                  {n}
                </span>

                <h3 className="mt-3 font-sora text-[18.5px] leading-[1.22] font-semibold tracking-[-.02em] text-white">
                  {t}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[1.68] text-ink-2">{d}</p>

                <div className="mt-6">{ARTEFATO[n]}</div>

                <span className="mt-auto pt-6 font-jet text-[10px] tracking-[.12em] text-ink-3 lowercase">
                  {tag}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

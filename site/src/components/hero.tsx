import Aurora from "./aurora";
import { Install } from "./install";
import { COR, Marca } from "./marca";

/**
 * Hero · layout portado da lattis.
 *
 * Mesma anatomia: aurora em canvas, véu radial pra manter o texto legível,
 * nav em pílula flutuante, conteúdo centralizado, faixa de integrações e
 * pista de rolagem. O que muda é o conteúdo, porque o público aqui é dev:
 * o comando de instalação entra no lugar do botão de carteira, e a faixa
 * lista os orquestradores suportados em vez de fontes de dados.
 */

/* Um lugar só pra trocar quando o repo existir. */
const REPO = "https://github.com/VictorAlexandr/spanix";

/* Marca oficial do GitHub (octocat). Inline porque a lucide tirou os ícones
   de marca — e porque logo de terceiro tem que ser o path oficial, não uma
   aproximação desenhada à mão. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const LINKS = [
  { href: "#library", label: "The library" },
  { href: "#panel", label: "The panel" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
];

/* Lista de compatibilidade, não de providers: o que aparece aqui é quem
   decide a ordem dos nós. Cliente de API solto (openai, anthropic) não entra
   — o profiler não tem grafo pra desenhar em cima de uma chamada única. */
/* O SDK leva a marca da ANTHROPIC e o Claude Code leva a do CLAUDE: são
   glifos diferentes no simple-icons, e a distinção é factual — um é a
   biblioteca da empresa, o outro é o produto. Com a mesma marca nos dois,
   eles ficariam indistinguíveis lado a lado. */
const RUNTIMES = [
  { name: "Claude Agent SDK", marca: "anthropic" },
  { name: "Claude Code", marca: "claude" },
  { name: "CrewAI", marca: "crewai" },
  { name: "LangGraph", marca: "langchain" },
] as const;

export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <Aurora />

      {/* Vinheta: escurece cantos e bordas. É o que devolve amplitude — o
          claro fica claro e o escuro fica realmente escuro. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(112% 126% at 50% 88%, transparent 24%, rgba(2,1,5,.5) 64%, rgba(2,1,5,.88) 100%)",
          maskImage: "linear-gradient(180deg, #000 30%, transparent 66%)",
          WebkitMaskImage: "linear-gradient(180deg, #000 30%, transparent 66%)",
        }}
      />

      {/* Grade: o peso de ferramenta vem de estrutura, não de cor. Preenche
          o vazio de cima com geometria em vez de névoa. 1px a 3% — some se
          você procurar, mas é o que faz a tela ler como instrumento. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,.03) 1px, transparent 1px)," +
            "linear-gradient(to bottom, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(70% 44% at 50% 26%, #000 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(70% 44% at 50% 26%, #000 0%, transparent 70%)",
        }}
      />

      {/* Teto preto: garante que a pílula da nav flutue no vazio em vez de
          apoiar em luz. Sem isso qualquer banda alta encosta nela. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[34vh]"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,1,5,.95) 0%, rgba(2,1,5,.78) 22%, rgba(2,1,5,.4) 52%, transparent 100%)",
        }}
      />

      {/* nav pílula */}
      <div className="relative z-20 px-5 pt-[22px] lg:px-7">
        <nav className="mx-auto flex w-fit max-w-full items-center gap-1 rounded-full border border-(--hair) bg-(--glass) p-[5px] shadow-[0_12px_44px_rgba(0,0,0,.5)] backdrop-blur-xl">
          <a
            href="/"
            className="px-[21px] py-[5px] font-sora text-[17px] font-semibold tracking-[-.03em]"
          >
            spanix<i className="not-italic text-viol">.</i>
          </a>
          <div className="ml-16 hidden gap-[12px] min-[880px]:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-[19px] py-[7px] text-[13.5px] text-ink-2 transition-colors hover:bg-white/7 hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>
          <a
            href="#pricing"
            className="mr-1 hidden rounded-full px-[15px] py-[7px] text-[13.5px] text-ink-3 transition-colors hover:text-ink min-[880px]:block"
          >
            Log in
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-[9px] rounded-full bg-white px-[23px] py-[7px] text-[13px] font-semibold text-[#0A0714] transition-all hover:bg-viol hover:text-white hover:shadow-[0_6px_24px_rgba(var(--viol-rgb),.45)]"
          >
            <GithubMark className="size-[15px]" />
            GitHub
          </a>
        </nav>
      </div>

      {/* conteúdo centralizado */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center justify-center px-5 pt-[clamp(36px,9vh,80px)] pb-[clamp(20px,3vh,48px)] text-center lg:px-7">
        <div className="flex flex-wrap items-center justify-center gap-[10px]">
          <span className="inline-flex items-center gap-[9px] rounded-[8px] border border-(--hair) bg-white/5 px-[15px] py-2 font-mono text-[10.5px] tracking-[.14em] lowercase text-ink-2">
            <span className="text-viol">◇</span> local profiler for ai agents
          </span>
          {/* "open source" é a alegação, a licença é a prova — os dois, nessa
              ordem. Quando o repo abrir, a contagem de estrelas toma o lugar
              da licença aqui e ela desce pro rodapé. */}
          {/* Violeta fica no LED, na borda e no fundo — não no texto. Em mono
              de 10,5px com tracking, cor cromática perde contra branco quase
              puro: 15,7:1 contra os 7,2:1 do violeta cheio. */}
          <span className="inline-flex items-center gap-2 rounded-[8px] border border-[rgba(var(--ok-rgb),.42)] bg-[rgba(var(--ok-rgb),.13)] px-[15px] py-2 font-mono text-[10.5px] font-medium tracking-[.1em] text-ink">
            <span className="pulse-dot h-[6px] w-[6px] rounded-full bg-ok shadow-[0_0_12px_var(--color-ok)]" />
            open source
            <i className="not-italic text-[rgba(var(--ok-rgb),.55)]">·</i>
            <span className="text-ok">apache-2.0</span>
          </span>
        </div>

        <h1
          className="mx-auto mt-[clamp(18px,3.4vh,34px)] max-w-[16ch] font-sora text-[clamp(40px,min(6.4vw,8.2vh),82px)] leading-[1.08] font-semibold tracking-[-.032em] text-white"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,.45), 0 5px 30px rgba(0,0,0,.55)",
            textWrap: "balance",
          }}
        >
          Four agents running. Zero visibility.
        </h1>

        <p
          className="mx-auto mt-[clamp(14px,2.6vh,28px)] max-w-[58ch] text-[17px] leading-[1.8] font-[450] text-ink-2"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,.4), 0 2px 20px rgba(3,2,6,.85)",
          }}
        >
          One line around your agent. A panel opens on localhost with the whole call
          tree and a price on every node. Run it again next week and you see what
          changed.{" "}
          <b className="font-semibold whitespace-nowrap text-white">
            Nothing leaves your machine.
          </b>
        </p>

        <div className="mt-[clamp(20px,4vh,40px)] flex flex-wrap items-center justify-center gap-[13px]">
          <Install cmd="pip install spanix" />
          <a
            href="#panel"
            className="rounded-[10px] border border-white/18 px-8 py-[15px] text-[14.5px] font-semibold text-ink transition-all hover:-translate-y-[2px] hover:border-viol hover:text-viol motion-reduce:hover:translate-y-0"
          >
            See the panel →
          </a>
        </div>

        {/* faixa de compatibilidade: o que o dev checa antes de instalar */}
        <div className="relative mt-[clamp(20px,4.4vh,44px)] flex max-w-[720px] flex-col items-start gap-[10px] rounded-[12px] border border-(--hair) bg-[rgba(12,10,20,.62)] px-5 py-[13px] shadow-[0_18px_50px_rgba(0,0,0,.5)] backdrop-blur-lg min-[821px]:flex-row min-[821px]:items-center min-[821px]:gap-[14px]">
          <span
            aria-hidden="true"
            className="absolute top-0 right-[10%] left-[10%] h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.5),transparent)",
            }}
          />
          <span className="shrink-0 font-mono text-[9.5px] tracking-[.18em] uppercase text-ink-3 min-[821px]:border-r min-[821px]:border-white/9 min-[821px]:pr-[14px]">
            works with
          </span>
          <div className="flex flex-wrap items-center gap-[6px]">
            {RUNTIMES.map((s) => (
              <span
                key={s.name}
                className="inline-flex cursor-default items-center gap-[7px] rounded-[7px] border border-transparent px-[11px] py-[7px] font-mono text-[11.5px] text-ink-2 transition-all hover:border-white/14 hover:bg-white/4 hover:text-white"
              >
                <Marca nome={s.marca} className="size-[13px] shrink-0" style={{ color: COR[s.marca] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(14px,2.6vh,26px)] flex flex-wrap items-center justify-center gap-[14px] font-mono text-[10.5px] tracking-[.1em] lowercase text-ink [text-shadow:0_1px_3px_rgba(3,2,6,.95)]">
          <span>free forever, local</span>
          <i className="text-[rgba(var(--viol-rgb),.55)] not-italic">·</i>
          <span>no signup</span>
          <i className="text-[rgba(var(--viol-rgb),.55)] not-italic">·</i>
          <span>your prompts never leave</span>
        </div>
      </div>

      {/* pista de rolagem */}
      <div className="relative z-10 pb-6 text-center font-mono text-[10.5px] tracking-[.2em] lowercase text-ink [text-shadow:0_1px_3px_rgba(3,2,6,.95)]">
        scroll
        <i
          className="mx-auto mt-2 block h-6 w-px"
          style={{ background: "linear-gradient(var(--color-viol),transparent)" }}
        />
      </div>

    </section>
  );
}

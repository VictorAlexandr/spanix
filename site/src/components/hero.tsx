import { ArrowUpRight, Star } from "lucide-react";
import { Install } from "./install";
import { FlowPanel } from "./flow-panel";

/**
 * Hero.
 *
 * Anatomia de landing de ferramenta, não de SaaS: o comando de instalação
 * tem peso de CTA, a prova é o contador real do GitHub (mesmo em zero) e a
 * imagem é o produto funcionando, não ilustração.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24">
      {/* luz de ambiente, discreta: dá profundidade sem virar gradiente mágico */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[30%] left-1/2 h-[70%] w-[110%] -translate-x-1/2 opacity-70"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,166,35,.10), transparent 70%)",
        }}
      />

      <div className="relative mx-auto grid w-full max-w-[1100px] items-center gap-14 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-edge bg-panel px-3 py-1.5 font-mono text-[11px] text-ink-2 transition-colors duration-300 hover:border-edge-hi"
          >
            <span className="size-[5px] rounded-full bg-acc" />
            v0.1 em desenvolvimento aberto
            <ArrowUpRight size={12} strokeWidth={2} className="text-ink-3" />
          </a>

          <h1 className="mt-7 text-[clamp(38px,4.6vw,58px)] leading-[1.04] font-bold tracking-[-.035em] text-balance">
            Seus agentes viraram
            <br />
            uma caixa preta.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.65] text-ink-2">
            Profiler local para orquestração de LLM. Grafo do fluxo, falha de
            schema e custo em dólar por agente,{" "}
            <span className="text-ink">sem nada saindo da sua máquina.</span>
          </p>

          <div className="mt-9">
            <Install cmd="pip install agent-flow-profiler" />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2.5 rounded-lg bg-ink px-5 py-2.5 text-[14px] font-medium text-base transition-colors duration-300 hover:bg-white"
            >
              <Star size={14} strokeWidth={2} />
              GitHub
              <span className="ml-1 rounded bg-black/10 px-1.5 py-0.5 font-mono text-[11px]">
                0
              </span>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 rounded-lg border border-edge px-5 py-2.5 text-[14px] font-medium text-ink-2 transition-colors duration-300 hover:border-edge-hi hover:text-ink"
            >
              Documentação
            </a>
            <span className="ml-1 font-mono text-[11.5px] text-ink-3">
              Apache-2.0
            </span>
          </div>
        </div>

        <FlowPanel />
      </div>
    </section>
  );
}

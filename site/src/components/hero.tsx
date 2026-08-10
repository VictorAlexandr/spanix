"use client";

import { useEffect, useRef, useState } from "react";
import { Install } from "./install";

/**
 * Hero · a caixa preta e a lente
 *
 * A versão anterior era o kit padrão de toda ferramenta de IA: selo em
 * pílula, título bold, parágrafo cinza e um card à direita. Competente e
 * esquecível.
 *
 * Aqui a página INTEIRA é a caixa preta: um log denso e ilegível de quatro
 * agentes falando ao mesmo tempo, ocupando tudo. Onde o mouse passa, uma
 * lente revela a mesma execução estruturada por baixo — o grafo, o nó que
 * quebrou, o custo.
 *
 * Não é enfeite: é exatamente o que a ferramenta faz, virado interação. O
 * visitante entende o produto antes de ler a primeira frase.
 */

const AGENTES = ["planner", "scraper", "analyst", "writer"];
const VERBOS = [
  "invoke", "tool_call", "retry", "parse", "emit", "chunk",
  "validate", "fetch", "resolve", "yield", "stream", "commit",
];

/** log determinístico: mesmo texto no servidor e no cliente, sem Math.random */
function gerarLog(linhas: number) {
  const out: string[] = [];
  for (let i = 0; i < linhas; i++) {
    const a = AGENTES[(i * 7) % 4];
    const v = VERBOS[(i * 5) % VERBOS.length];
    const ms = 100 + ((i * 137) % 900);
    const tk = 40 + ((i * 61) % 800);
    out.push(
      `${String(12 + ((i * 3) % 12)).padStart(2, "0")}:${String((i * 17) % 60).padStart(2, "0")}:${String((i * 29) % 60).padStart(2, "0")}.${String((i * 91) % 999).padStart(3, "0")}  [${a}] ${v}  latency=${ms}ms tokens=${tk} depth=${i % 5}  {"state":"partial","node":"${a}_${i % 9}","payload":{"len":${tk * 3}}}`,
    );
  }
  return out;
}

const LOG = gerarLog(46);

export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);
  const [lente, setLente] = useState({ x: -999, y: -999 });
  const [ativa, setAtiva] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const mover = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setLente({ x: e.clientX - r.left, y: e.clientY - r.top });
        setAtiva(true);
      });
    };
    const sair = () => setAtiva(false);
    el.addEventListener("mousemove", mover, { passive: true });
    el.addEventListener("mouseleave", sair);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", mover);
      el.removeEventListener("mouseleave", sair);
    };
  }, []);

  /* a mesma máscara nas duas camadas: uma some onde a outra aparece */
  const mascara = `radial-gradient(circle 230px at ${lente.x}px ${lente.y}px, #000 0%, #000 55%, transparent 100%)`;

  return (
    <section
      ref={wrap}
      className="relative min-h-dvh overflow-hidden"
      style={{ cursor: "crosshair" }}
    >
      {/* ── camada 1 · a caixa preta ── */}
      <div
        className="absolute inset-0 px-6 py-10 font-mono text-[11px] leading-[1.85] whitespace-pre text-ink-3/45 select-none"
        style={{
          maskImage: ativa ? `radial-gradient(circle 230px at ${lente.x}px ${lente.y}px, transparent 0%, transparent 55%, #000 100%)` : undefined,
          WebkitMaskImage: ativa ? `radial-gradient(circle 230px at ${lente.x}px ${lente.y}px, transparent 0%, transparent 55%, #000 100%)` : undefined,
        }}
        aria-hidden
      >
        {LOG.map((l, i) => (
          <div key={i} className="overflow-hidden text-ellipsis">
            {l}
          </div>
        ))}
      </div>

      {/* ── camada 2 · o que o profiler enxerga, revelado pela lente ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: ativa ? mascara : "radial-gradient(circle 0px at 50% 50%, #000, transparent)",
          WebkitMaskImage: ativa ? mascara : "radial-gradient(circle 0px at 50% 50%, #000, transparent)",
        }}
        aria-hidden
      >
        <Estruturado />
      </div>

      {/* ── aro da lente ── */}
      {ativa && (
        <div
          className="pointer-events-none absolute rounded-full border border-acc/30"
          style={{
            width: 460,
            height: 460,
            left: lente.x - 230,
            top: lente.y - 230,
            boxShadow: "0 0 80px rgba(245,166,35,.08) inset",
          }}
          aria-hidden
        />
      )}

      {/* ── o texto, sempre legível ── */}
      <div className="relative flex min-h-dvh items-center">
        <div className="mx-auto w-full max-w-[1100px] px-6">
          <div className="max-w-[19ch] rounded-2xl bg-base/70 p-2 backdrop-blur-[2px]">
            <h1 className="text-[clamp(40px,5.4vw,72px)] leading-[1.02] font-bold tracking-[-.04em]">
              Quatro agentes.
              <br />
              <span className="text-ink-3">Zero visibilidade.</span>
            </h1>
          </div>

          <p className="mt-7 max-w-[44ch] rounded-xl bg-base/70 p-2 text-[16.5px] leading-[1.6] text-ink-2 backdrop-blur-[2px]">
            Isto aqui é o seu terminal hoje.{" "}
            <span className="text-ink">Mova o mouse</span> e veja o que o
            profiler enxerga no mesmo instante.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Install cmd="pip install agent-flow-profiler" />
            <span className="font-mono text-[11.5px] text-ink-3">
              local · Apache-2.0
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── a execução estruturada, espalhada pela tela inteira ── */

const NOS = [
  { id: "planner", x: 18, y: 30, cor: "#3ecf8e", info: "1.2s · $0.04" },
  { id: "scraper", x: 44, y: 16, cor: "#3ecf8e", info: "4.8s · $0.11" },
  { id: "analyst", x: 44, y: 52, cor: "#f5a623", info: "2.1s · $0.29" },
  { id: "writer", x: 72, y: 32, cor: "#f2555a", info: "falhou" },
];

const ARESTAS: [number, number, number, number][] = [
  [18, 30, 44, 16],
  [18, 30, 44, 52],
  [44, 16, 72, 32],
  [44, 52, 72, 32],
];

function Estruturado() {
  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {ARESTAS.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={`${x1 + 4}%`}
            y1={`${y1}%`}
            x2={`${x2 - 4}%`}
            y2={`${y2}%`}
            stroke="#3a3a42"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      {NOS.map((n) => (
        <div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-panel px-4 py-2.5"
          style={{ left: `${n.x}%`, top: `${n.y}%`, borderColor: n.cor + "55" }}
        >
          <span className="flex items-center gap-2.5 font-mono text-[12px] text-ink">
            <i className="size-[6px] rounded-full" style={{ background: n.cor }} />
            {n.id}
          </span>
          <span className="mt-1 block font-mono text-[10px] text-ink-3">
            {n.info}
          </span>
        </div>
      ))}

      {/* o achado que o log escondia */}
      <div className="absolute top-[70%] left-[52%] max-w-[330px] rounded-lg border border-[#f2555a]/35 bg-[#f2555a]/[.07] px-4 py-3">
        <span className="font-mono text-[11px] font-medium text-[#ff8a8d]">
          ValidationError · writer
        </span>
        <p className="mt-1.5 font-mono text-[11px] text-ink-3">
          <span className="text-ink-2">price</span> esperava{" "}
          <span className="text-ink-2">float</span>, recebeu{" "}
          <span className="text-[#ff8a8d]">&quot;R$ 42,90&quot;</span>
        </p>
      </div>

      <div className="absolute top-[16%] right-[6%] rounded-lg border border-edge bg-panel px-4 py-3">
        <span className="block font-mono text-[9.5px] tracking-[.12em] text-ink-3 uppercase">
          custo da run
        </span>
        <span className="mt-1 block font-mono text-[18px] text-acc">$0.412</span>
      </div>
    </div>
  );
}

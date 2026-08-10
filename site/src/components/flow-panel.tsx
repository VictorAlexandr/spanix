/**
 * O painel do produto.
 *
 * É por esta imagem que o dev julga a qualidade da ferramenta, então ela é
 * UI acabada, não simulação de terminal: moldura arredondada, elevação real,
 * hierarquia de tipo e espaçamento de produto.
 *
 * Mostra as três features de uma vez — grafo do fluxo, um nó em falha de
 * schema e o custo em dólar acumulando — porque é essa combinação que não
 * existe em nenhuma outra ferramenta.
 */

const NOS = [
  { id: "planner", x: 26, y: 78, estado: "ok" as const, ms: "1.2s" },
  { id: "scraper", x: 128, y: 30, estado: "ok" as const, ms: "4.8s" },
  { id: "analyst", x: 128, y: 126, estado: "run" as const, ms: "2.1s" },
  { id: "writer", x: 236, y: 78, estado: "err" as const, ms: "0.4s" },
];

const ARESTAS = [
  [26, 78, 128, 30],
  [26, 78, 128, 126],
  [128, 30, 236, 78],
  [128, 126, 236, 78],
];

const COR = { ok: "#3ecf8e", run: "#f5a623", err: "#f2555a" };

export function FlowPanel() {
  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-panel shadow-[0_30px_80px_-20px_rgba(0,0,0,.9)]">
      {/* cromo de janela, discreto */}
      <div className="flex items-center gap-3 border-b border-edge px-4 py-3">
        <span className="flex gap-1.5">
          <i className="size-[9px] rounded-full bg-edge-hi" />
          <i className="size-[9px] rounded-full bg-edge-hi" />
          <i className="size-[9px] rounded-full bg-edge-hi" />
        </span>
        <span className="font-mono text-[11.5px] text-ink-3">
          localhost:7788
        </span>
        <span className="ml-auto flex items-center gap-2 rounded-full border border-edge px-2.5 py-1">
          <i className="pulse-dot size-[5px] rounded-full bg-ok" />
          <span className="font-mono text-[10px] tracking-wide text-ink-3">
            gravando
          </span>
        </span>
      </div>

      {/* o grafo */}
      <div className="px-5 pt-5">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[10.5px] tracking-[.12em] text-ink-3 uppercase">
            run #482 · research_graph
          </span>
          <span className="font-mono text-[11px] text-ink-3">8.5s</span>
        </div>

        <svg viewBox="0 0 300 160" className="mt-3 w-full" role="img">
          {ARESTAS.map(([x1, y1, x2, y2], i) => (
            <path
              key={i}
              d={`M${x1 + 22},${y1} C${(x1 + x2) / 2 + 22},${y1} ${(x1 + x2) / 2},${y2} ${x2 - 22},${y2}`}
              fill="none"
              stroke="#35353b"
              strokeWidth="1.5"
              className={i === 1 ? "flowing" : undefined}
            />
          ))}

          {NOS.map((n) => (
            <g key={n.id}>
              <rect
                x={n.x - 22}
                y={n.y - 15}
                width="66"
                height="30"
                rx="7"
                fill="#151519"
                stroke={n.estado === "ok" ? "#232327" : COR[n.estado]}
                strokeWidth={n.estado === "ok" ? 1 : 1.4}
              />
              <circle cx={n.x - 12} cy={n.y} r="3" fill={COR[n.estado]} />
              <text
                x={n.x - 3}
                y={n.y + 3.5}
                fill="#a1a1aa"
                fontSize="9"
                fontFamily="var(--f-mono)"
              >
                {n.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* a falha de schema, que é o diferencial */}
      <div className="mx-5 mt-1 rounded-lg border border-[#f2555a]/25 bg-[#f2555a]/[.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="size-[5px] rounded-full bg-err" />
          <span className="font-mono text-[11px] font-medium text-[#ff8a8d]">
            ValidationError · writer
          </span>
        </div>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-ink-3">
          <span className="text-ink-2">price</span>
          <span className="mx-1.5">esperava</span>
          <span className="text-ink-2">float</span>
          <span className="mx-1.5">e recebeu</span>
          <span className="text-[#ff8a8d]">&quot;R$ 42,90&quot;</span>
        </p>
      </div>

      {/* o custo */}
      <div className="mt-4 grid grid-cols-3 gap-px border-t border-edge bg-edge">
        {[
          ["custo da run", "$0.412", true],
          ["tokens", "184k", false],
          ["agente mais caro", "analyst", false],
        ].map(([k, v, destaque]) => (
          <div key={k as string} className="bg-panel px-4 py-3.5">
            <span className="block font-mono text-[9.5px] tracking-[.1em] text-ink-3 uppercase">
              {k}
            </span>
            <span
              className={`mt-1.5 block font-mono text-[15px] ${destaque ? "text-acc" : "text-ink"}`}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

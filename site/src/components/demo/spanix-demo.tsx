import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

/**
 * SpanixDemo — composição do showcase.
 *
 * PLACEHOLDER: quatro fases de texto, só pra o container ficar encaixado e o
 * tempo já correr certo. A animação de verdade entra aqui.
 *
 * Ela é a mesma composição usada pelo <Player /> na página e pelo
 * `npm run film`, que renderiza MP4 pelo CLI. Um arquivo só, dois destinos —
 * o que for feito aqui vale nos dois sem duplicar nada.
 *
 * Nada de fundo próprio: o wrapper na página já é a janela. Se a composição
 * pintasse a própria moldura, seriam duas bordas encaixadas.
 */

export const DEMO_FPS = 30;
export const DEMO_FRAMES = 600; // 20s

const FASE = 600 / 4;

const PHASES = ["$ spanix run python agent.py", "Dashboard loading…", "Token Bleed Detected ($0.42)", "Pydantic Error Catch"];

const C = {
  bg: "#0A0A0B",
  ink: "#f2f1f7",
  ink3: "#8e8aa0",
  viol: "#8a6eff",
} as const;

const MONO = "var(--font-plex-mono), ui-monospace, SFMono-Regular, monospace";

export const SpanixDemo: React.FC = () => {
  const f = useCurrentFrame();
  const i = Math.min(PHASES.length - 1, Math.floor(f / FASE));
  const local = f - i * FASE;

  /* entra e sai dentro da própria fase, então a troca nunca corta seco */
  const o = interpolate(local, [0, 14, FASE - 14, FASE], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: C.bg,
        fontFamily: MONO,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 72,
      }}
    >
      <div style={{ textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
        <div style={{ fontSize: 20, letterSpacing: ".24em", color: C.ink3, marginBottom: 26 }}>
          {String(i + 1).padStart(2, "0")} / 04
        </div>
        <div style={{ fontSize: 44, color: C.ink, lineHeight: 1.4 }}>{PHASES[i]}</div>
      </div>

      {/* régua de progresso: só pra dar noção de tempo enquanto é placeholder */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 56, height: 2, background: "rgba(255,255,255,.07)" }}>
        <div
          style={{
            height: "100%",
            width: `${(f / DEMO_FRAMES) * 100}%`,
            background: C.viol,
            opacity: 0.75,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

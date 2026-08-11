"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/**
 * Seção 2 · o grafo, a linha do tempo e o inspetor.
 *
 * Três caixas em fila é diagrama. O que faz ler como ferramenta são quatro
 * camadas de informação convivendo:
 *
 *   1. GRAFO RAMIFICADO — o scraper abre em três ferramentas e volta. Sistema
 *      real ramifica; fila reta é ilustração de slide.
 *   2. DADO VIVO NO NÓ — cada caixa carrega custo e latência próprios, subindo.
 *   3. LINHA DO TEMPO — a mesma execução vista no tempo. É aqui que o laço
 *      deixa de ser afirmação: aparecem CINCO barras repetidas de fetch:api.
 *   4. INSPETOR — painel lateral que troca de conteúdo por fase.
 *
 * A energia nas arestas é `stroke-dashoffset` em CSS, então roda no
 * compositor. Os transforms são funções contínuas do progresso — sem faixa de
 * keyframe, o erro de offset da WAAPI não tem como voltar.
 */

const STEPS = [
  ["One line", "Wrap the stream. The SDK already knows the cost. It just throws it away."],
  ["The session opens", "The main agent, its tools, and the subagents it spawned. Each one with its own context."],
  ["The bleed", "A subagent burning 142k tokens and a tool called five times over."],
  ["The drift", "Same task, four turns last month. Eleven today. Nobody was watching."],
] as const;

type Node = {
  id: string; sub: string; x: number; y: number; cor: string; wake: number;
  lat: string; custo: string; hot?: boolean; bad?: boolean;
};

const W = 1000;
const H = 380;

const NOS: Node[] = [
  { id: "main", sub: "orchestrator · 11 turns", x: 60, y: 190, cor: "#D97757", wake: 0.9, lat: "22.6s", custo: "$0.14" },
  { id: "Read", sub: "tool", x: 292, y: 58, cor: "#8a6eff", wake: 1.0, lat: "0.2s", custo: "+0.4k" },
  { id: "WebFetch", sub: "tool · called 5×", x: 292, y: 178, cor: "#8a6eff", wake: 1.06, lat: "5.4s", custo: "+38k", hot: true },
  { id: "research", sub: "Task · subagent", x: 292, y: 312, cor: "#ffb020", wake: 1.12, lat: "14.2s", custo: "$0.42", hot: true },
  { id: "verify", sub: "Task · subagent", x: 540, y: 58, cor: "#22d3ee", wake: 1.26, lat: "3.1s", custo: "$0.09" },
  { id: "Grep", sub: "tool", x: 540, y: 312, cor: "#8a6eff", wake: 1.2, lat: "0.3s", custo: "+1.1k" },
  { id: "result", sub: "run total", x: 790, y: 190, cor: "#3de3a0", wake: 1.42, lat: "22.6s", custo: "$0.65", bad: true },
];

const NW = 202;
const NH = 66;

/* As arestas SAEM da geometria dos nós, não de caminhos escritos à mão. Foi
   exatamente esse desencontro que soltou as curvas da caixa: `n.x` é a borda
   ESQUERDA, e eu vinha traçando como se fosse o centro. */
const de_para = (a: string, b: string) => {
  const A = NOS.find((n) => n.id === a)!;
  const B = NOS.find((n) => n.id === b)!;
  const x1 = A.x + NW;
  const x2 = B.x;
  const c = x1 + (x2 - x1) * 0.55;
  return `M ${x1} ${A.y} C ${c} ${A.y}, ${c} ${B.y}, ${x2} ${B.y}`;
};

const ARESTAS: [string, number][] = [
  [de_para("main", "Read"), 0.96],
  [de_para("main", "WebFetch"), 1.02],
  [de_para("main", "research"), 1.08],
  [de_para("Read", "verify"), 1.2],
  [de_para("research", "Grep"), 1.16],
  [de_para("WebFetch", "result"), 1.36],
  [de_para("verify", "result"), 1.38],
  [de_para("Grep", "result"), 1.4],
];



/* o laço fica no fetch:api, que é quem realmente falha e força a retentativa */
/* mergulha até y≈266; o research começa em 279, então sobram 13 de folga */
const DL = "M 340 211 C 298 266, 468 266, 426 211";

/* linha do tempo · o fetch:api vira UMA linha com cinco segmentos: além de
   caber na tela, blocos repetidos na mesma faixa lêem como laço melhor que
   cinco linhas separadas */
type Faixa = { n: string; segs: [number, number][]; cor: string; retry?: boolean };
const TL: Faixa[] = [
  { n: "main", segs: [[0, 100]], cor: "#D97757" },
  { n: "Read", segs: [[2, 2]], cor: "#8a6eff" },
  { n: "WebFetch", segs: [[6, 4], [12, 5], [19, 5], [26, 6], [34, 8]], cor: "#8a6eff", retry: true },
  { n: "research", segs: [[44, 38]], cor: "#ffb020" },
  { n: "Grep", segs: [[52, 3]], cor: "#8a6eff" },
  { n: "verify", segs: [[84, 12]], cor: "#22d3ee" },
  { n: "result", segs: [[97, 3]], cor: "#3de3a0" },
];

const suave = (v: number) => v * v * (3 - 2 * v);
const jan = (v: number, a: number, b: number) => suave(Math.max(0, Math.min(1, (v - a) / (b - a))));
const pc = (n: number, t: number) => `${(n / t) * 100}%`;


/* ── passo 01 ──────────────────────────────────────────────────────────────
   O card era a única coisa parada da seção. Agora o código digita linha a
   linha e as mensagens do SDK CHEGAM E SOMEM — a tese do produto animada em
   vez de escrita: o dado existe, com custo calculado, e evapora. */

const CODIGO: [string, React.ReactNode][] = [
  ["1", <><span className="text-[#c48bff]">from</span> <span className="text-ink-3">claude_agent_sdk</span> <span className="text-[#c48bff]">import</span> <span className="text-ink-3">query</span></>],
  ["2", <><span className="text-[#c48bff]">from</span> <span className="text-ink-2">spanix</span> <span className="text-[#c48bff]">import</span> <span className="text-viol">watch</span></>],
  ["3", <span />],
  ["4", <><span className="text-ink-3">stream = query(prompt=p, options=opts)</span></>],
  ["5", <span />],
  ["6", <><span className="text-[#c48bff]">async for</span> <span className="text-ink-3">msg</span> <span className="text-[#c48bff]">in</span> <span className="text-viol">watch</span><span className="text-ink-3">(stream, run=</span><span className="text-[#a3e07a]">&quot;nightly&quot;</span><span className="text-ink-3">):</span></>],
  ["7", <span className="pl-5 text-ink-3">handle(msg)</span>],
];

const FLUXO: [string, string, string, number][] = [
  ["SystemMessage", "init · model claude-opus-4 · cwd ~/agents", "#8e8aa0", 0.2],
  ["AssistantMessage", "ToolUseBlock · WebFetch", "#8a6eff", 0.25],
  ["UserMessage", "ToolResultBlock · 6.2k tokens", "#8e8aa0", 0.3],
  ["AssistantMessage", "ToolUseBlock · Task(research)", "#ffb020", 0.35],
  ["AssistantMessage", "TextBlock", "#8e8aa0", 0.4],
  /* nivel de execucao: bate com o KNOWLEDGE (11 turnos, 206k, USD 0.65).
     Antes dizia 0.14, que e o custo so do main — numero errado nesta linha. */
  ["ResultMessage", "usage 206k · $0.65 · 11 turns", "#3de3a0", 0.45],
];

function LinhaCod({ p, i, n, filho }: { p: MotionValue<number>; i: number; n: string; filho: React.ReactNode }) {
  const on = useTransform(p, (v) => jan(v, 0.04 + i * 0.035, 0.1 + i * 0.035));
  const x = useTransform(on, (v) => (1 - v) * -8);
  return (
    <motion.div style={{ opacity: on, x }} className="flex gap-4">
      <span className="w-3 shrink-0 text-right text-ink-3 tabular-nums">{n}</span>
      <span className="min-w-0 whitespace-nowrap">{filho}</span>
    </motion.div>
  );
}

function MsgFluxo({ p, m, i }: { p: MotionValue<number>; m: (typeof FLUXO)[number]; i: number }) {
  const [tipo, det, cor, at] = m;
  /* Slot fixo e absoluto. Em fluxo normal, a mensagem que some deixa o espaço
     ocupado e as outras não sobem — era isso que fazia a coluna pular. */
  const entra = useTransform(p, (v) => jan(v, at, at + 0.05));
  /* acumulam e escurecem; a evaporação é COLETIVA no fim, e bate mais forte */
  const some = useTransform(p, (v) => jan(v, 0.52, 0.62));
  const opacity = useTransform([entra, some], ([e, s2]) => (e as number) * (1 - (s2 as number)) * (1 - (s2 as number) * 0.2));
  const y = useTransform([entra, some], ([e, s2]) => (1 - (e as number)) * 8 - (s2 as number) * 16);
  const filter = useTransform(some, (v) => `blur(${v * 5}px)`);

  return (
    <motion.div
      style={{ opacity, y, filter, top: i * 56 }}
      className="absolute inset-x-0 flex items-baseline gap-2"
    >
      <i className="mt-[6px] size-[4px] shrink-0 rounded-full" style={{ background: cor }} />
      <span className="min-w-0">
        <span className="text-ink-2">{tipo}</span>
        <span className="block truncate text-ink-3">└ {det}</span>
      </span>
    </motion.div>
  );
}

function No({ p, n }: { p: MotionValue<number>; n: Node }) {
  const on = useTransform(p, (v) => jan(v, n.wake, n.wake + 0.26));
  const quente = useTransform(p, (v) => (n.hot ? jan(v, 1.95, 2.2) : 0));
  const falha = useTransform(p, (v) => (n.bad ? jan(v, 2.6, 2.82) : 0));

  const tom = (q: number, f: number) => (f > 0.5 ? "#ff6b6b" : q > 0.5 ? "#ffb020" : n.cor);
  const cor = useTransform([quente, falha], ([q, f]) => tom(q as number, f as number));
  const borda = useTransform([quente, falha], ([q, f]) => `${tom(q as number, f as number)}${(q as number) + (f as number) > 0.5 ? "8c" : "38"}`);
  const brilho = useTransform([on, quente, falha], ([a, q, f]) => {
    const t = tom(q as number, f as number);
    const forca = (0.06 + (q as number) * 0.36 + (f as number) * 0.36) * (a as number);
    return `0 0 ${14 + (q as number) * 34 + (f as number) * 34}px ${t}${Math.round(forca * 255).toString(16).padStart(2, "0")}`;
  });
  const opacity = useTransform(on, (v) => 0.18 + v * 0.82);
  const scale = useTransform(on, (v) => 0.92 + v * 0.08);
  /* o custo só aparece depois que o nó acorda — dado vivo, não rótulo fixo */
  const dado = useTransform(p, (v) => jan(v, n.wake + 0.2, n.wake + 0.5));

  return (
    <motion.div
      style={{
        opacity, scale, borderColor: borda, boxShadow: brilho,
        left: pc(n.x, W), top: pc(n.y - NH / 2, H), width: pc(NW, W), height: pc(NH, H),
      }}
      className="absolute flex flex-col justify-center rounded-[10px] border bg-[#0B0A12]/94 px-3.5 backdrop-blur-sm"
    >
      <span className="flex items-center gap-1.5">
        <motion.i style={{ background: cor }} className="size-[6px] shrink-0 rounded-full" />
        <span className="truncate font-jet text-[13px] font-medium text-ink">{n.id}</span>
        <motion.span style={{ opacity: dado, color: cor }} className="ml-auto font-jet text-[12px] tabular-nums">
          {n.custo}
        </motion.span>
      </span>
      <motion.span style={{ opacity: dado }} className="mt-0.5 flex items-baseline gap-1.5">
        <span className="truncate font-jet text-[10.5px] text-ink-3">{n.sub}</span>
        <span className="ml-auto font-jet text-[10.5px] text-ink-3 tabular-nums">{n.lat}</span>
      </motion.span>
    </motion.div>
  );
}

function Aresta({ p, d, de }: { p: MotionValue<number>; d: string; de: number }) {
  const on = useTransform(p, (v) => jan(v, de, de + 0.24));
  return (
    <>
      <path d={d} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth={1.4} />
      <motion.path style={{ opacity: on }} className="fluxo" d={d} fill="none" stroke="#8a6eff" strokeWidth={2.2} strokeLinecap="round" />
    </>
  );
}

/* A faixa deixa de ser gráfico e passa a TOCAR: cada segmento cresce da
   esquerda no instante em que aquele trecho da execução aconteceu. O mapa é
   linear — posição no tempo da run vira posição no scroll. */
const T0 = 1.3;
const T1 = 1.95;
const quando = (x: number) => T0 + (x / 100) * (T1 - T0);

function Barra({ p, f }: { p: MotionValue<number>; f: Faixa }) {
  return (
    <>
      {f.segs.map(([x, w], j) => (
        <Seg key={j} p={p} x={x} w={w} cor={f.cor} at={quando(x)} />
      ))}
    </>
  );
}

function Seg({ p, x, w, cor, at }: { p: MotionValue<number>; x: number; w: number; cor: string; at: number }) {
  /* dura o mesmo que o trecho dura na execução real: barra longa cresce devagar */
  const dur = Math.max(0.05, (w / 100) * (T1 - T0));
  const t = useTransform(p, (v) => jan(v, at, at + dur));
  const op = useTransform(p, (v) => jan(v, at, at + 0.04));
  return (
    <motion.span
      style={{ scaleX: t, opacity: op, left: `${x}%`, width: `${w}%`, background: cor, originX: 0 }}
      className="absolute h-full rounded-[2px]"
    />
  );
}

function Inspetor({ p }: { p: MotionValue<number> }) {
  /* Sem folga entre eles, dois cartões ficam empilhados no mesmo top-0 e o
     resultado lê como bug. Cada um fecha antes do seguinte abrir. */
  const a = useTransform(p, (v) => jan(v, 1.5, 1.68) * (1 - jan(v, 1.82, 1.94)));
  const b = useTransform(p, (v) => jan(v, 2.0, 2.16) * (1 - jan(v, 2.44, 2.56)));
  const c = useTransform(p, (v) => jan(v, 2.62, 2.84));

  return (
    <div className="absolute top-0 right-0 h-full w-[238px]">
      <motion.div style={{ opacity: a }} className="absolute inset-x-0 top-0 rounded-xl border border-white/10 bg-[#0A0A0B]/94 p-3.5 backdrop-blur-md">
        <span className="block font-jet text-[9.5px] tracking-[.16em] text-ink-3 uppercase">inspector · scraper</span>
        <div className="mt-2.5 space-y-1.5 font-jet text-[10.5px]">
          {[["turns", "11"], ["tools called", "8"], ["subagents", "2"], ["own tokens", "46k"]].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-ink-3">{k}</span>
              <span className="text-ink-2 tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div style={{ opacity: b }} className="absolute inset-x-0 top-0 rounded-xl border border-[#ffb020]/34 bg-[#160f05]/95 p-3.5 backdrop-blur-md">
        <span className="block font-jet text-[8.5px] tracking-[.16em] text-[#ffd08a]/80 uppercase">retry log · WebFetch</span>
        <div className="mt-2.5 space-y-1 font-jet text-[10.5px]">
          {[["1", "0.9s", "+6.2k"], ["2", "1.1s", "+7.4k"], ["3", "1.0s", "+7.1k"], ["4", "1.2s", "+8.0k"], ["5", "1.2s", "+9.3k"]].map(([n, t, c2]) => (
            <div key={n} className="flex items-center gap-2">
              <span className="w-3 text-ink-3 tabular-nums">{n}</span>
              <span className="h-[4px] flex-1 rounded-full bg-[#ffb020]/70" style={{ maxWidth: `${28 + Number(n) * 14}%` }} />
              <span className="text-ink-3 tabular-nums">{t}</span>
              <span className="w-[42px] text-right text-[#ffd08a] tabular-nums">{c2}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 border-t border-white/[.08] pt-2 font-jet text-[10px] text-[#ffd08a]">
          38k tokens pushed into main's context
        </div>
      </motion.div>

      <motion.div style={{ opacity: c }} className="absolute inset-x-0 top-0 rounded-xl border border-[#ff6b6b]/34 bg-[#150a0d]/95 p-3.5 backdrop-blur-md">
        <span className="block font-jet text-[8.5px] tracking-[.16em] text-[#ffb3b3]/80 uppercase">drift · turns per run</span>
        <div className="mt-3 flex h-[52px] items-end gap-[5px]">
          {[4, 4, 5, 6, 8, 9, 11].map((t, k) => (
            <span
              key={k}
              className="flex-1 rounded-[2px]"
              style={{
                height: `${(t / 11) * 100}%`,
                background: k > 3 ? "#ff6b6b" : "#3de3a0",
                opacity: k > 3 ? 0.9 : 0.45,
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-jet text-[9px] text-ink-3">
          <span>6 weeks ago</span><span>now</span>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/[.08] pt-2.5 font-jet text-[10.5px]">
          <div className="flex justify-between"><span className="text-ink-3">turns</span><span className="text-[#ff9b9b] tabular-nums">4 → 11</span></div>
          <div className="flex justify-between"><span className="text-ink-3">cost / run</span><span className="text-[#ff9b9b] tabular-nums">$0.21 → $0.65</span></div>
          <div className="flex justify-between"><span className="text-ink-3">same task</span><span className="text-ink-2">unchanged</span></div>
        </div>
      </motion.div>
    </div>
  );
}

export function PanelSection() {
  const palco = useRef<HTMLDivElement>(null);
  const { scrollYProgress: entrada } = useScroll({ target: palco, offset: ["start end", "start start"] });
  const { scrollYProgress: cru } = useScroll({ target: palco, offset: ["start start", "end end"] });
  const sp = useSpring(cru, { stiffness: 420, damping: 46, mass: 0.18 });
  /* p chega em 3 quando o scroll está em 83%, e trava. Os últimos 17% do
     percurso (~37vh) são zona de ASSENTAMENTO: nada mais anima enquanto o
     pino solta. Antes o quarto passo só completava no último pixel, e com o
     atraso da mola ele ainda estava animando quando a seção saía — era o
     "desce e sobe". */
  const p = useTransform(sp, (v) => Math.min(3, v * 3.45));

  const inOp = useTransform(entrada, (v) => Math.max(0, Math.min(1, (v - 0.04) / 0.44)));
  const inY = useTransform(entrada, (v) => (1 - Math.max(0, Math.min(1, (v - 0.04) / 0.5))) * 64);

  const laco = useTransform(p, (v) => jan(v, 1.9, 2.15));
  /* fecha em $0.65 — o mesmo total dos nós. Duas contas diferentes na mesma
     tela é o tipo de erro que um dev nota em três segundos. */
  const custo = useTransform(p, (v) => jan(v, 1.0, 1.6) * 0.14 + jan(v, 1.95, 2.45) * 0.51);
  const custoTxt = useTransform(custo, (v) => `$${v.toFixed(2)}`);
  const tok = useTransform(p, (v) => jan(v, 1.0, 1.6) * 46 + jan(v, 1.95, 2.45) * 160);
  const tokTxt = useTransform(tok, (v) => `${v.toFixed(0)}k`);
  const tent = useTransform(p, (v) => Math.round(2 + jan(v, 1.1, 2.5) * 9));
  const tentTxt = useTransform(tent, (v) => `${v}`);
  const tentCurto = useTransform(tent, (v) => `${v}`);
  const custoCor = useTransform(p, (v) => (jan(v, 1.98, 2.22) > 0.5 ? "#ffb020" : "#8a6eff"));
  /* o terminal tem que sumir ANTES do primeiro nó acordar (0.18), senão
     fica em cima das caixas do grafo */
  const term = useTransform(p, (v) => 1 - jan(v, 0.6, 0.85));
  const termEsc = useTransform(p, (v) => 1 - jan(v, 0.6, 0.85) * 0.06);
  /* Os nós nascem com 18% de opacidade de base. Sem isto, o esqueleto do
     grafo fica visível POR BAIXO do card do passo 01 desde o primeiro quadro
     e a cena lê como sobreposição em vez de sequência. */
  const grafoOn = useTransform(p, (v) => jan(v, 0.72, 0.95));
  const tlOn = useTransform(p, (v) => jan(v, 1.24, 1.44));
  /* o playhead percorre a área das barras (depois da coluna de 74px + gap) */
  const cabecaX = useTransform(p, (v) => {
    const t = Math.max(0, Math.min(1, (v - T0) / (T1 - T0)));
    return `calc(74px + 10px + (100% - 84px) * ${t})`;
  });
  const cabecaOp = useTransform(p, (v) => jan(v, T0, T0 + 0.06) * (1 - jan(v, T1 - 0.05, T1 + 0.12)));
  const fimFluxo = useTransform(p, (v) => jan(v, 0.6, 0.7));
  const saida = useTransform(p, (v) => jan(v, 0.3, 0.4));

  return (
    <section id="panel" ref={palco} className="relative h-[500vh]">
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(52% 44% at 50% 40%, rgba(var(--viol-rgb),.13), transparent 70%), radial-gradient(120% 100% at 50% 50%, transparent 42%, rgba(3,2,8,.66) 100%)",
          }}
        />

        <motion.div
          style={{ opacity: inOp, y: inY }}
          className="relative mx-auto flex w-full max-w-[1160px] flex-col items-center px-6"
        >
          <span className="olho">
            <i aria-hidden="true" />
            03 · the process
          </span>

          {/* ══ PALCO ══
              Grafo e tabela num contêiner só, pra o card do passo 01 poder
              cobrir a área inteira. Sem isso a tabela fica invisível MAS
              ocupando espaço, e sobra um buraco embaixo do card. */}
          {/* ══ legenda ══ no TOPO: a fala tem que chegar antes da cena, senao
              o leitor decifra o grafo sozinho e a frase vira redundancia.
              Altura 104px medida no pior caso (contador 13 + titulo 30 + duas
              linhas de 19). Em 84px o passo 04 estourava e o overflow do pai
              cortava. */}
          <div className="relative mt-4 h-[112px] w-full max-w-[60ch]">
            {STEPS.map(([t, d], i) => (
              <Legenda key={t} p={p} i={i} t={t} d={d} />
            ))}
          </div>

          <div className="relative mt-1 w-full">
            <div className="relative w-full">
              <div className="relative aspect-[1000/380] w-[calc(100%-250px)]">
                <motion.div style={{ opacity: grafoOn }} className="absolute inset-0">
                  <svg viewBox="0 0 1000 380" className="absolute inset-0 h-full w-full overflow-visible">
                    {ARESTAS.map(([d, de]) => (
                      <Aresta key={d} p={p} d={d} de={de} />
                    ))}
                    <motion.g style={{ opacity: laco }}>
                      <path d={DL} fill="none" stroke="rgba(255,176,32,.2)" strokeWidth={2} />
                      <path className="fluxo-laco" d={DL} fill="none" stroke="#ffb020" strokeWidth={3} strokeLinecap="round" />
                    </motion.g>
                  </svg>
                  {NOS.map((n) => (
                    <No key={n.id} p={p} n={n} />
                  ))}
                </motion.div>

                {/* marca ancorada no arco; o detalhe completo vive no inspetor */}
                <motion.div
                  style={{ opacity: laco, left: "38.3%", top: "67%" }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffb020]/45 bg-[#170f04] px-2.5 py-1 whitespace-nowrap"
                >
                  <span className="font-jet text-[11px] text-[#ffd08a]">↺ 5×</span>
                </motion.div>
              </div>

              <Inspetor p={p} />
            </div>

            <motion.div style={{ opacity: tlOn }} className="mt-6 flex w-full items-stretch gap-3">
              <div className="min-w-0 flex-1 rounded-xl border border-white/[.08] bg-[#0A0A0B]/70 p-3">
                <span className="flex items-baseline justify-between font-jet text-[9.5px] tracking-[.16em] text-ink-3 uppercase">
                  <span>timeline · run #482</span>
                  <span className="tabular-nums">22.6s</span>
                </span>
                <div className="relative mt-2.5 space-y-[3px]">
                  <motion.span
                    aria-hidden="true"
                    style={{ opacity: cabecaOp, left: cabecaX }}
                    className="pointer-events-none absolute inset-y-0 z-10 w-px bg-viol"
                  >
                    <span className="absolute -top-1 left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-viol shadow-[0_0_8px_#8a6eff]" />
                  </motion.span>
                  {TL.map((f) => (
                    <div key={f.n} className="grid grid-cols-[74px_1fr] items-center gap-2.5">
                      <span className="truncate font-jet text-[9.5px] text-ink-3">{f.n}</span>
                      <span className="relative h-[7px] rounded-[2px] bg-white/[.04]">
                        <Barra p={p} f={f} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex w-[238px] shrink-0 flex-col gap-px overflow-hidden rounded-xl border border-white/[.08] bg-white/[.06]">
                {([["run cost", custoTxt, custoCor], ["tokens", tokTxt, undefined], ["turns", tentTxt, undefined]] as const).map(([k, v, c]) => (
                  <div key={k} className="flex flex-1 items-baseline justify-between bg-[#0A0A0B] px-4 py-2.5">
                    <span className="font-jet text-[9.5px] tracking-[.16em] text-ink-3 uppercase">{k}</span>
                    <motion.span style={{ color: c ?? "#f2f1f7" }} className="font-jet text-[19px] tabular-nums">
                      {v}
                    </motion.span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ══ passo 01 · cobre o palco inteiro, então não sobra buraco ══ */}
            <motion.div
              style={{ opacity: term, scale: termEsc }}
              className="absolute inset-x-[13%] top-[1%] bottom-[2%] z-20 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0A0A0B]/97 shadow-[0_40px_110px_-30px_rgba(0,0,0,1)] backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 border-b border-white/[.07] px-4 py-2.5">
                <span className="flex gap-[6px]">
                  <i className="size-[9px] rounded-full bg-[#ff5f57]" />
                  <i className="size-[9px] rounded-full bg-[#febc2e]" />
                  <i className="size-[9px] rounded-full bg-[#28c840]" />
                </span>
                <span className="rounded-md border border-white/[.09] bg-white/[.04] px-2 py-1 font-jet text-[10px] text-ink-2">
                  $ pip install spanix
                </span>
                <span className="ml-auto font-jet text-[10px] text-ink-3">python 3.11+</span>
              </div>

              <div className="grid min-h-0 flex-1 md:grid-cols-[1.18fr_1fr]">
                <div className="flex min-w-0 flex-col border-white/[.07] md:border-r">
                  <div className="border-b border-white/[.07] px-5 py-2.5 font-jet text-[9.5px] tracking-[.14em] text-ink-3 uppercase">
                    research_agent.py
                  </div>
                  {/* topo pro código, rodapé pra saída. Centralizar tudo deixava
                      vazio nas duas pontas — terminal de verdade preenche de cima
                      pra baixo e termina no resultado. */}
                  <div className="flex flex-1 flex-col px-5 pt-5 font-jet text-[12.5px] leading-[2.5]">
                    {CODIGO.map(([n, filho], i) => (
                      <LinhaCod key={n} p={p} i={i} n={n} filho={filho} />
                    ))}
                    {/* o segundo processo. `watch()` grava, `serve` lê — separados
                        de propósito (script curto morre e levaria o painel junto). */}
                    <motion.div style={{ opacity: saida }} className="mt-auto mb-4 leading-normal">
                      <span className="flex items-center gap-2 border-t border-white/[.07] pt-4 text-[12.5px]">
                        <span className="text-ink-3">$</span>
                        <span className="text-ink-2">spanix serve</span>
                      </span>
                      <span className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-white/[.07] bg-black/40 px-3.5 py-2.5 text-[11.5px]">
                        <span className="text-ok">▸</span>
                        <span className="text-ink-2">127.0.0.1:7788</span>
                        <span className="ml-auto flex items-center gap-1.5">
                          <i className="pulse-dot size-[5px] rounded-full bg-ok" />
                          <span className="text-ink-3">live</span>
                        </span>
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col bg-white/[.014]">
                  <div className="flex items-center gap-2 border-b border-white/[.07] px-5 py-2.5">
                    <span className="pulse-dot size-[5px] rounded-full bg-ok" />
                    <span className="font-jet text-[9.5px] tracking-[.14em] text-ink-3 uppercase">the stream</span>
                    <motion.span style={{ opacity: fimFluxo }} className="ml-auto font-jet text-[10px] text-ink-3 tabular-nums">
                      6 in · 0 kept
                    </motion.span>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pt-5 font-jet text-[12px] leading-[1.5]">
                    <div className="relative flex-1">
                      {FLUXO.map((m, i) => (
                        <MsgFluxo key={m[0] + m[1]} p={p} m={m} i={i} />
                      ))}
                    </div>
                    <motion.div
                      style={{ opacity: fimFluxo }}
                      className="mt-auto mb-4 border-t border-white/[.07] pt-3.5 text-[11.5px] text-ink-3"
                    >
                      said once. kept by nobody.
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}

/* Fronteiras de capítulo, lidas dos beats do palco e não de i ± 0.5:
     card sai 0.60→0.85 · grafo entra 0.72 · nós acordam até 1.42
     laço de retry 1.90 · deriva no inspetor ~2.40
   Antes a legenda trocava em 0.5, com o card do passo 01 ainda inteiro na
   tela — por isso o título 02 aparecia na metade do passo 01. */
const CAP: [number, number][] = [
  [-1, 0.62],
  [0.62, 1.82],
  [1.82, 2.38],
  [2.38, 4],
];

function Legenda({ p, i, t, d }: { p: MotionValue<number>; i: number; t: string; d: string }) {
  /* Antes: `1 - |i - v| * 1.5`. Pico TRIANGULAR — a legenda batia opacidade 1
     num instante só, em v exatamente igual a i, e passava o resto do capítulo
     desbotando. A única que ficava forte era a quarta, porque `p` satura em 3
     e ela ganhava um platô de graça no fim. Daí "só fica forte no final".

     Agora é TRAPÉZIO com travessia cruzada: cheia em 84% do capítulo, e nos
     16% da borda uma sai enquanto a outra entra, as duas em 0.5 no ponto de
     troca. Sem vão preto entre passos e sem desbotar no meio da leitura. */
  const [ini, fim] = CAP[i];
  const entra = useTransform(p, (v) => jan(v, ini - 0.09, ini + 0.09));
  const sai = useTransform(p, (v) => jan(v, fim - 0.09, fim + 0.09));
  const perto = useTransform([entra, sai], ([e, s]) => (e as number) * (1 - (s as number)));
  /* o deslocamento também para no platô: antes ele corria sem parar
     (`(i - v) * 20`), e era esse arrasto contínuo que lia como tranco */
  const y = useTransform([entra, sai], ([e, s]) => (1 - (e as number)) * 14 - (s as number) * 14);
  return (
    <motion.div style={{ opacity: perto, y }} className="absolute inset-x-0 top-0 text-center">
      <span className="font-jet text-[9.5px] tracking-[.24em] text-viol tabular-nums">
        {String(i + 1).padStart(2, "0")} / 04
      </span>
      <h3 className="h-passo mt-2">{t}</h3>
      <p className="mx-auto mt-2 max-w-[54ch] text-[12.5px] leading-[1.5] text-ink-2">{d}</p>
    </motion.div>
  );
}

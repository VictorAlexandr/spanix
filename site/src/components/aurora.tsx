"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo da hero — porte fiel da boreal da lattis
 * (`frontend/src/components/marketing/Aurora.tsx`).
 *
 * O QUE EU TINHA ERRADO, depois de comparar com a fonte. A nossa versão havia
 * divergido em quase tudo que importa, e nenhuma das diferenças era decorativa:
 *
 *  1. FALTAVA A QUARTA BANDA. A original tem um "reflexo baixo" em `base .88`
 *     cujo comentário diz exatamente pra que serve: manter o pé da hero aceso
 *     até encostar na faixa de baixo. Era literalmente a boreal que faltava
 *     embaixo — não dava pra resolver subindo as outras três.
 *
 *  2. FALTAVA A BANDA FRIA. Há uma terceira em ciano (`70,190,255`) a 10% lá
 *     em cima. Aurora de verdade tem mais de um gás; é ela que impede a massa
 *     de ler como um degradê violeta chapado.
 *
 *  3. O CÉU É PINTADO AQUI. A original preenche um degradê vertical no próprio
 *     canvas antes das cortinas. A nossa limpava para transparente e deixava o
 *     fundo da página aparecer — por isso a luz nunca tinha onde assentar.
 *
 *  4. AS ESTRELAS SÃO DESTE CANVAS. Ficam ENTRE o céu e as cortinas, então a
 *     luz passa por cima delas. Com um canvas separado por baixo, elas ficavam
 *     ou totalmente cobertas ou totalmente à frente.
 *
 *  5. O DEGRADÊ DE CADA BANDA TEM TRÊS PARADAS, não seis. Eu tinha inventado um
 *     "núcleo quente" que endurecia a crista e devolvia leitura de relevo.
 *
 *  6. NÃO EXISTEM ESTRIAS NEM DISSOLUÇÃO. Eu havia acrescentado um recorte
 *     vertical e um apagamento no pé; os dois cortavam justamente a massa que
 *     faz a coisa parecer atmosfera.
 *
 * Alphas baixos (.46/.22/.10/.17) e desfoque de 68px: a luz é MUITA área com
 * POUCA opacidade. Era o contrário do que eu vinha fazendo — pouca área com
 * muita opacidade, que é o que produz faixa em vez de céu.
 *
 * DPR limitado a 2 · pausa fora da viewport · congela em prefers-reduced-motion.
 */

const SKY = ["#050409", "#0A0714", "#0D0A1A"] as const;
const STAR = "239,237,246";
const BLUR = 68;

const BANDS = [
  { c: "176,140,255", base: 0.36, amp: 0.105, freq: 1.7, sp: 0.00011, ph: 1.4, h: 0.5, a: 0.46 },
  { c: "110,80,220", base: 0.54, amp: 0.072, freq: 2.4, sp: 0.00016, ph: 3.9, h: 0.34, a: 0.22 },
  { c: "70,190,255", base: 0.24, amp: 0.048, freq: 3.2, sp: 0.00021, ph: 0.3, h: 0.2, a: 0.1 },
  /* reflexo baixo: mantém o pé da hero aceso até encostar na faixa corrida */
  { c: "176,140,255", base: 0.88, amp: 0.05, freq: 1.5, sp: 0.00009, ph: 2.2, h: 0.3, a: 0.17 },
] as const;

type Star = { x: number; y: number; z: number; tw: number; dx: number; dy: number };

export default function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(devicePixelRatio, 2);
    let W = 0;
    let H = 0;
    let stars: Star[] = [];

    const fit = () => {
      W = cv.width = cv.offsetWidth * DPR;
      H = cv.height = cv.offsetHeight * DPR;
      /* PRNG com semente: a composição é a mesma em todo carregamento. */
      let s = 5171;
      const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
      stars = Array.from({ length: 180 }, () => {
        const ang = rnd() * 6.283;
        return {
          x: rnd(),
          y: rnd() * 0.94,
          z: 0.28 + rnd() * 0.72,
          tw: rnd() * 7,
          dx: Math.cos(ang),
          dy: Math.sin(ang) * 0.6,
        };
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(cv);
    fit();

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let running = false;
    let last = 0;

    const draw = (t: number) => {
      if (!running) return;
      if (!W) {
        raf = requestAnimationFrame(draw);
        return;
      }
      const tt = reduce ? 12000 : t;
      const dt = Math.min(50, t - last);
      last = t;

      /* céu */
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, SKY[0]);
      sky.addColorStop(0.55, SKY[1]);
      sky.addColorStop(1, SKY[2]);
      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      /* estrelas em deriva — as mais próximas andam mais rápido */
      for (const st of stars) {
        if (!reduce) {
          const sp = 0.0000048 * (0.4 + st.z) * dt;
          st.x += st.dx * sp;
          st.y += st.dy * sp;
          if (st.x < -0.02) st.x = 1.02;
          else if (st.x > 1.02) st.x = -0.02;
          if (st.y < -0.02) st.y = 0.96;
          else if (st.y > 0.96) st.y = -0.02;
        }
        const tw = 0.84 + 0.16 * Math.sin(tt * 0.00045 + st.tw);
        const a = (0.16 + st.z * 0.4) * tw;
        ctx.fillStyle = `rgba(${STAR},${a})`;
        ctx.beginPath();
        ctx.arc(st.x * W, st.y * H, (0.35 + st.z * 1.15) * DPR, 0, 7);
        ctx.fill();
      }

      /* cortinas */
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = `blur(${(BLUR * DPR) / 2}px)`;
      for (const b of BANDS) {
        const g = ctx.createLinearGradient(0, (b.base - b.h * 0.5) * H, 0, (b.base + b.h) * H);
        g.addColorStop(0, `rgba(${b.c},0)`);
        g.addColorStop(0.32, `rgba(${b.c},${b.a})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        const step = Math.max(6, W / 90);
        for (let x = -step; x <= W + step; x += step) {
          const u = x / W;
          const y =
            (b.base +
              Math.sin(u * b.freq * 6.28 + tt * b.sp + b.ph) * b.amp +
              Math.sin(u * b.freq * 14 + tt * b.sp * 1.9 + b.ph * 2) * b.amp * 0.32) *
            H;
          x <= 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.lineTo(W + step, (b.base + b.h * 1.6) * H);
        ctx.lineTo(-step, (b.base + b.h * 1.6) * H);
        ctx.closePath();
        ctx.fill();
      }
      ctx.filter = "none";
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(draw);
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => (entries[0]?.isIntersecting ? start() : stop()),
      { threshold: 0.01 },
    );
    io.observe(cv);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * A atmosfera do site: só as estrelas e o grão da hero, sem as cortinas.
 *
 * É o que separa "escuro com intenção" de "preto morto com conteúdo boiando".
 * A aurora continua sendo exclusiva da hero — aqui fica só o chão comum.
 *
 * Desenha sobre transparente (não pinta céu), então compõe direto sobre o
 * fundo da seção. Semente diferente da hero de propósito: mesma linguagem,
 * nunca a mesma imagem repetida.
 */

const STAR = "239,237,246";

type Star = { x: number; y: number; z: number; tw: number; dx: number; dy: number };

export default function Starfield({
  density = 110,
  seed = 90210,
}: {
  density?: number;
  seed?: number;
}) {
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

    let s = seed;
    const rnd = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;

    /* grão: mesmo truque da hero, tile gerado uma vez */
    const tile = document.createElement("canvas");
    tile.width = tile.height = 128;
    const tctx = tile.getContext("2d");
    let grain: CanvasPattern | null = null;
    if (tctx) {
      const img = tctx.createImageData(128, 128);
      for (let i = 0; i < img.data.length; i += 4) {
        img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
        img.data[i + 3] = rnd() * 255;
      }
      tctx.putImageData(img, 0, 0);
      grain = ctx.createPattern(tile, "repeat");
    }

    const fit = () => {
      W = cv.width = cv.offsetWidth * DPR;
      H = cv.height = cv.offsetHeight * DPR;
      s = seed;
      /* densidade acompanha a altura: seção longa não pode ficar rarefeita */
      const n = Math.round(density * Math.max(1, cv.offsetHeight / 900));
      stars = Array.from({ length: n }, () => {
        const ang = rnd() * 6.283;
        return {
          x: rnd(), y: rnd(), z: 0.28 + rnd() * 0.72, tw: rnd() * 7,
          dx: Math.cos(ang), dy: Math.sin(ang) * 0.6,
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
      if (!W) { raf = requestAnimationFrame(draw); return; }
      const tt = reduce ? 12000 : t;
      const dt = Math.min(50, t - last);
      last = t;

      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      for (const st of stars) {
        if (!reduce) {
          const sp = 0.0000048 * (0.4 + st.z) * dt;
          st.x += st.dx * sp;
          st.y += st.dy * sp;
          if (st.x < -0.02) st.x = 1.02; else if (st.x > 1.02) st.x = -0.02;
          if (st.y < -0.02) st.y = 1.02; else if (st.y > 1.02) st.y = -0.02;
        }
        const tw = 0.84 + 0.16 * Math.sin(tt * 0.00045 + st.tw);
        const a = (0.16 + st.z * 0.4) * tw;
        ctx.fillStyle = `rgba(${STAR},${a})`;
        ctx.beginPath();
        ctx.arc(st.x * W, st.y * H, (0.35 + st.z * 1.15) * DPR, 0, 7);
        ctx.fill();
      }

      if (grain) {
        ctx.globalAlpha = 0.022;
        ctx.fillStyle = grain;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const io = new IntersectionObserver(
      (e) => (e[0]?.isIntersecting ? start() : stop()),
      { threshold: 0 },
    );
    io.observe(cv);

    return () => { stop(); io.disconnect(); ro.disconnect(); };
  }, [density, seed]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

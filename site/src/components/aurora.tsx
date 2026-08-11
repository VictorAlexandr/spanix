"use client";

import { useEffect, useRef } from "react";

/**
 * Fundo da hero.
 *
 *  1. Céu       degradê vertical quase preto
 *  2. Estrelas  deriva própria, velocidade pela profundidade
 *  3. Cortinas  quatro senoides desfocadas em blend aditivo
 *  4. Grão      ruído aditivo de 1 a 2 níveis: mata banding em painel
 *               OLED/VA e dá textura de filme no lugar de degradê chapado
 *
 * DPR limitado a 2 · pausa fora da viewport · congela em prefers-reduced-motion.
 */

const SKY = ["#050409", "#0A0714", "#08060E"] as const;
const STAR = "239,237,246";

/* O desfoque tem que ser MENOR que a ondulação, senão as cortinas se fundem
   numa mancha só — era o que acontecia a 68px contra amplitudes de 5 a 10%. */
const BLUR = 46;

/* Cada banda tem duas cores: `c` é o corpo e `hot` é o núcleo.
   Sem núcleo, aditivo a alpha .6 sobre preto dá no máximo um violeta MÉDIO
   (#695499) — parece tinta, não luz. O núcleo claro é o que faz a cortina
   ler como fonte luminosa em vez de mancha pintada. */
/* Os `base` têm que ficar ACIMA do início da dissolução, senão a cortina é
   apagada pela própria dissolução e nenhum alpha salva — era exatamente o que
   deixava a aurora opaca: pico em 88% da altura contra apagamento começando
   em 70%, ou seja, 84% da luz morria antes de chegar na tela. */
const BANDS = [
  { c: "138,110,255", hot: "192,170,255", base: 0.66, amp: 0.078, freq: 1.9, sp: 0.00011, ph: 1.4, h: 0.34, a: 0.54 },
  { c: "100,70,228", hot: "156,130,255", base: 0.76, amp: 0.06, freq: 2.6, sp: 0.00016, ph: 3.9, h: 0.3, a: 0.44 },
  { c: "126,96,246", hot: "180,158,255", base: 0.83, amp: 0.045, freq: 1.5, sp: 0.00009, ph: 2.2, h: 0.28, a: 0.42 },
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

    /* As cortinas são compostas fora da tela, sem desfoque, e só depois
       entram borradas de uma vez. Além de permitir recortar os raios, é mais
       barato: um fill borrado por quadro em vez de quatro. */
    const veil = document.createElement("canvas");
    const vctx = veil.getContext("2d");

    /* PRNG com semente: a composição é a mesma em todo carregamento. */
    let seed = 5171;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

    /* ── grão: tile de ruído gerado uma vez ── */
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
      veil.width = W;
      veil.height = H;
      seed = 5171;
      stars = Array.from({ length: 180 }, () => {
        const ang = rnd() * 6.283;
        return {
          x: rnd(), y: rnd() * 0.94, z: 0.28 + rnd() * 0.72, tw: rnd() * 7,
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

      ctx.globalCompositeOperation = "source-over";
      ctx.filter = "none";
      ctx.clearRect(0, 0, W, H);

      /* ── cortinas ──
         A frequência acompanha a proporção: num monitor largo, sem isso cada
         banda vira um ciclo só e o resultado lê como mancha. */
      const fx = Math.max(1, W / H / 1.7);
      if (vctx) {
        type Band = (typeof BANDS)[number];
        const curtain = (b: Band) => {
          const g = vctx.createLinearGradient(0, (b.base - b.h * 0.5) * H, 0, (b.base + b.h) * H);
          /* A linha ondulada cai na parada 0.33 do degradê. Se houvesse luz ali,
             o topo da banda viraria contorno duro — e contorno duro sobre massa
             sólida é silhueta de montanha, não cortina. Então ali é zero: a luz
             nasce ABAIXO da linha e some pra cima.
             O núcleo (0.56) usa a cor clara e alpha acima de 1× do corpo: é o
             estouro que separa "luz" de "tinta". */
          g.addColorStop(0, `rgba(${b.c},0)`);
          g.addColorStop(0.31, `rgba(${b.c},0)`);
          g.addColorStop(0.46, `rgba(${b.c},${b.a * 0.78})`);
          g.addColorStop(0.56, `rgba(${b.hot},${b.a * 1.12})`);
          g.addColorStop(0.66, `rgba(${b.c},${b.a * 0.78})`);
          g.addColorStop(0.82, `rgba(${b.c},${b.a * 0.34})`);
          g.addColorStop(1, `rgba(${b.c},0)`);
          vctx.fillStyle = g;
          vctx.beginPath();
          const step = Math.max(6, W / 90);
          for (let x = -step; x <= W + step; x += step) {
            const u = x / W;
            const y = (b.base
              + Math.sin(u * b.freq * fx * 6.28 + tt * b.sp + b.ph) * b.amp
              + Math.sin(u * b.freq * fx * 14 + tt * b.sp * 1.9 + b.ph * 2) * b.amp * 0.32) * H;
            x <= 0 ? vctx.moveTo(x, y) : vctx.lineTo(x, y);
          }
          vctx.lineTo(W + step, (b.base + b.h * 1.6) * H);
          vctx.lineTo(-step, (b.base + b.h * 1.6) * H);
          vctx.closePath();
          vctx.fill();
        };

        vctx.clearRect(0, 0, W, H);
        vctx.globalCompositeOperation = "lighter";
        for (const b of BANDS) curtain(b);

        /* Raios: recorta colunas de luz com intensidade variável. É a
           assinatura da aurora e o que impede a leitura de relevo — montanha
           não tem estria vertical. Um único fill em destination-out. */
        const ph = tt * 0.000035;
        const rays = vctx.createLinearGradient(0, 0, W, 0);
        for (let i = 0; i <= 48; i++) {
          const u = i / 48;
          const v = 0.5 + 0.5 * Math.sin(u * 27 + ph) * Math.sin(u * 8.3 + ph * 0.7);
          rays.addColorStop(u, `rgba(0,0,0,${0.26 * v})`);
        }
        vctx.globalCompositeOperation = "destination-out";
        vctx.fillStyle = rays;
        vctx.fillRect(0, 0, W, H);

        /* A cortina se dissolve AQUI, dentro do canvas, e não numa costura
           por cima. Costura é sempre um degrau disfarçado: ela termina numa
           cor e a próxima seção começa em outra. Assim a luz simplesmente
           acaba antes da borda e o céu já vale a cor da seção seguinte. */
        const die = vctx.createLinearGradient(0, H * 0.84, 0, H);
        for (let i = 0; i <= 8; i++) {
          const t = i / 8;
          die.addColorStop(t, `rgba(0,0,0,${t * t * (3 - 2 * t)})`);
        }
        vctx.fillStyle = die;
        vctx.fillRect(0, H * 0.84, W, H * 0.16);
        vctx.globalCompositeOperation = "source-over";

        ctx.globalCompositeOperation = "lighter";
        ctx.filter = `blur(${(BLUR * DPR) / 2}px)`;
        ctx.drawImage(veil, 0, 0);
        ctx.filter = "none";
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };

    const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

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

  return (
    <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />
  );
}

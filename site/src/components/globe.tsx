"use client";

import { useEffect, useRef } from "react";
import { TERRA } from "./terra";
import { PAISES, type Pais } from "./downloads";

/**
 * O globo — e ele é um CONTROLE, não um enfeite.
 *
 * Globo que só gira é decoração: bonito por três segundos e mudo depois. Aqui
 * ele responde a três gestos:
 *
 *   APONTAR   o país sob o cursor acende, ganha anel e mostra nome e contagem
 *             ali mesmo. A lista ao lado destaca a mesma linha, e o inverso
 *             também vale — apontar na lista acende no globo.
 *   ARRASTAR  gira o planeta. A rotação automática pausa enquanto se arrasta
 *             e volta depois, então o gesto nunca briga com a animação.
 *   PAUSAR    passar o mouse em qualquer lugar congela a rotação, senão o
 *             alvo escapa do cursor no meio da leitura.
 *
 * A GEOMETRIA está documentada na função `proj`, junto com o bug que ela teve
 * — vale a leitura antes de mexer.
 *
 * Só o hemisfério da frente é desenhado, e um segmento de costa só sai quando
 * os DOIS extremos estão nele. Sem esse teste, uma costa que cruza a borda é
 * ligada por uma reta atravessando o planeta.
 *
 * O ACERTO DO CURSOR usa as posições já projetadas no último quadro, guardadas
 * num ref. Não há segunda matemática pra manter em sincronia: o que está na
 * tela é literalmente o que é testado.
 */

/* 0,78 e não 0,86 — e o motivo é a QUEBRA RETA que aparecia na esquerda.
   A auréola alcança 1,22R; com R = 0,86·(W/2), ela chegava a 1,05·(W/2) e
   estourava a borda do canvas, onde era CORTADA numa linha vertical seca.
   Brilho desenhado até a beira do elemento sempre denuncia o retângulo.
   Com 0,78, o alcance máximo (1,22R ≈ 0,95·W/2) morre DENTRO do canvas. */
const RAIO = 0.78;
const TILT = 0.36;
const ALCANCE = 22; // raio de acerto do cursor, em px de tela

export default function Globe({
  corAtiva,
  corRota,
  ativo,
  aoApontar,
}: {
  /** carmim — só a INTERAÇÃO: o país apontado e o anel dele */
  corAtiva: string;
  /** mint — a ROTA: arcos, pulsos viajantes e o anel de origem no Brasil.
      Separar as duas cores mantém o carmim significando "você está aqui" em
      vez de virar a cor de tudo que se mexe. */
  corRota: string;
  ativo: string | null;
  aoApontar: (cc: string | null) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  /* o alvo vive num ref também: o laço de desenho precisa dele sem virar
     dependência do efeito, senão o canvas remonta a cada hover */
  const ativoRef = useRef(ativo);
  ativoRef.current = ativo;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    /* ── graticule ──
       Meridianos e paralelos de 30 em 30 graus, bem apagados. Ele substituiu
       a nuvem de pontos uniforme que estava aqui: com os continentes
       desenhados, a nuvem virava ruído por cima do desenho que importa. A
       grade dá a curvatura e o eixo sem competir com a costa. */
    const grade: [number, number][][] = [];
    for (let lon = -180; lon < 180; lon += 30) {
      const l: [number, number][] = [];
      for (let lat = -90; lat <= 90; lat += 5) l.push([lon, lat]);
      grade.push(l);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const l: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 5) l.push([lon, lat]);
      grade.push(l);
    }

    const fit = () => {
      const r = cv.getBoundingClientRect();
      W = cv.width = Math.max(1, r.width * DPR);
      H = cv.height = Math.max(1, r.height * DPR);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(cv);
    fit();

    const reduz =
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let rodando = false;

    /* estado do gesto */
    let giroExtra = 0;
    let giroAuto = 0;
    let ultimo = 0;
    let parado = false;
    let arrastando = false;
    let xAnterior = 0;
    let moveu = false;

    /* posições projetadas do último quadro — a base do acerto do cursor */
    const marcas: { cc: string; px: number; py: number; z: number }[] = [];
    const maior = Math.max(...PAISES.map((p) => p.n));

    /* ── OS ARCOS, e por que eles saem do Brasil ──────────────────────────
       É aqui que o carmim ganha o papel principal da seção. Ele estava só em
       texto e em hover — invisível com a página parada — e a regra dele na
       página inteira é ser a cor do MOVIMENTO que importa. Nada se move mais
       nesta seção do que a biblioteca viajando.

       Cada arco é um círculo máximo da origem do projeto (o Brasil — é de lá
       que a spanix é desenvolvida e publicada) até um país que a instalou,
       levantado da superfície como rota de voo, com um pulso carmim
       percorrendo o caminho. A leitura é imediata e é a tese da seção:
       feito num lugar, puxado no mundo.

       A matemática: interpolação esférica (slerp) entre os dois vetores
       unitários, com o raio multiplicado por 1+0,16·sin(πt) pra dar altura
       de rota. Slerp mantém o ponto na esfera; o multiplicador o levanta. */
    const vecDe = (lat: number, lon: number): [number, number, number] => {
      const a = (lat * Math.PI) / 180;
      const b = (lon * Math.PI) / 180;
      return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
    };
    const vOrigem = vecDe(-14.2, -51.9); // Brasil
    const ARCOS = PAISES.filter((p) => p.cc !== "BR").map((p, i) => ({
      v: vecDe(p.lat, p.lon),
      fase: i / Math.max(1, PAISES.length - 1),
    }));

    const slerp = (
      v1: [number, number, number],
      v2: [number, number, number],
      t2: number,
    ): [number, number, number] => {
      const dot = Math.min(1, Math.max(-1, v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2]));
      const om = Math.acos(dot);
      if (om < 1e-4) return v1;
      const s = Math.sin(om);
      const c1 = Math.sin((1 - t2) * om) / s;
      const c2 = Math.sin(t2 * om) / s;
      return [c1 * v1[0] + c2 * v2[0], c1 * v1[1] + c2 * v2[1], c1 * v1[2] + c2 * v2[2]];
    };

    /* projeta um vetor já em coordenadas de esfera, com fator de altura `m` */
    const projVec = (
      v: [number, number, number],
      m: number,
      giro: number,
      R: number,
      cx: number,
      cy: number,
    ) => {
      const g = (giro * Math.PI) / 180;
      const X = v[0] * Math.cos(g) + v[2] * Math.sin(g);
      const Y = v[1];
      const Z = v[2] * Math.cos(g) - v[0] * Math.sin(g);
      const Y2 = Y * Math.cos(TILT) - Z * Math.sin(TILT);
      const Z2 = Y * Math.sin(TILT) + Z * Math.cos(TILT);
      return { px: cx + X * R * m, py: cy - Y2 * R * m, z: Z2 };
    };

    /* ── projeção ortográfica ──────────────────────────────────────────────
       ESTE BLOCO TINHA UM BUG QUE DOBRAVA O PLANETA AO MEIO, e vale registrar
       porque ele é silencioso: eu usava `cos(lat)·cos(lon)` como eixo
       HORIZONTAL da tela. Cosseno é uma função PAR — `cos(+45°) = cos(−45°)` —
       então cada longitude caía no mesmo pixel que a sua simétrica. O globo
       era um espelho de si mesmo e nenhum continente tinha a forma certa.
       Rodando, ainda parecia um planeta girando, o que é justamente o que faz
       o erro passar despercebido.

       O correto: quem vira eixo horizontal é o SENO da longitude, e o cosseno
       vira a profundidade.

         X = cos(lat)·sin(lon)   horizontal na tela
         Y = sin(lat)            vertical, antes da inclinação
         Z = cos(lat)·cos(lon)   profundidade — visível quando > 0

       Conferido renderizando o dado em ASCII e checando três pontos conhecidos
       (Brasil, EUA, Singapura) contra a silhueta desenhada. */
    const proj = (lat: number, lon: number, giro: number, R: number, cx: number, cy: number) => {
      const a = (lat * Math.PI) / 180;
      const b = ((lon + giro) * Math.PI) / 180;
      const X = Math.cos(a) * Math.sin(b);
      const Y = Math.sin(a);
      const Z = Math.cos(a) * Math.cos(b);
      /* inclinação em torno do eixo horizontal da tela */
      const Y2 = Y * Math.cos(TILT) - Z * Math.sin(TILT);
      const Z2 = Y * Math.sin(TILT) + Z * Math.cos(TILT);
      return { px: cx + X * R, py: cy - Y2 * R, z: Z2 };
    };

    const desenha = (t: number) => {
      if (!rodando) return;
      if (!W) {
        raf = requestAnimationFrame(desenha);
        return;
      }
      const dt = ultimo ? Math.min(60, t - ultimo) : 16;
      ultimo = t;
      if (!reduz && !parado && !arrastando) giroAuto += dt * 0.0055;

      const giro = (reduz ? 28 : giroAuto) + giroExtra;
      const cx = W / 2;
      const cy = H / 2;
      const R = (Math.min(W, H) / 2) * RAIO;

      ctx.clearRect(0, 0, W, H);

      /* ── a aurora do planeta ───────────────────────────────────────────
         ULTRAVIOLETA — o mesmo da hero. O halo que abraça a esfera nasce
         transparente dentro do disco, atinge o pico logo depois da borda
         (~1,08R) e some a 1,22R. Com o corpo violeta e a atmosfera violeta,
         o planeta fecha com a identidade da página em vez de introduzir um
         segundo clima; o mint fica inteiro no número grande. */
      const auréola = ctx.createRadialGradient(cx, cy, R * 0.72, cx, cy, R * 1.22);
      auréola.addColorStop(0, "rgba(255,255,255,0)");
      auréola.addColorStop(0.72, "rgba(138,110,255,.14)");
      auréola.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = auréola;
      ctx.fillRect(0, 0, W, H);

      /* ── o corpo do planeta ────────────────────────────────────────────
         ULTRAVIOLETA, preenchendo o disco. Quando o anel de luz saiu (era a
         "margem branca"), saiu junto o único preenchimento que a esfera
         tinha, e o globo virou um aramado transparente — quase invisível
         sobre o fundo escuro. Um corpo precisa de corpo.

         A diferença pro anel de antes: isto é um PREENCHIMENTO RECORTADO NO
         DISCO, mais claro no ponto onde a luz bate (alto-esquerda, o mesmo
         da sombra volumétrica do fim) e caindo pra quase nada na borda.
         Nada é desenhado fora do círculo, então não existe aro. E é violeta
         porque atmosfera é o papel do violeta na página inteira. */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 7);
      ctx.clip();
      const corpo = ctx.createRadialGradient(
        cx - R * 0.22,
        cy - R * 0.28,
        R * 0.08,
        cx,
        cy,
        R * 1.02,
      );
      corpo.addColorStop(0, "rgba(138,110,255,.22)");
      corpo.addColorStop(0.55, "rgba(138,110,255,.11)");
      corpo.addColorStop(1, "rgba(138,110,255,.03)");
      ctx.fillStyle = corpo;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      /* ── traçado de linhas na esfera ──
         Um segmento só é desenhado quando os DOIS extremos estão no
         hemisfério da frente. Sem esse teste, uma costa que passa pela borda
         é ligada por uma reta atravessando o planeta inteiro — o artefato
         clássico de globo em canvas. */
      const traca = (
        linhas: [number, number][][],
        estilo: string,
        larg: number,
        alphaBase: number,
      ) => {
        ctx.strokeStyle = estilo;
        ctx.lineWidth = larg * DPR;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        for (const linha of linhas) {
          let ant: { px: number; py: number; z: number } | null = null;
          ctx.beginPath();
          let aberto = false;
          for (const [lon, lat] of linha) {
            const p = proj(lat, lon, giro, R, cx, cy);
            if (ant && ant.z > 0 && p.z > 0) {
              if (!aberto) {
                ctx.moveTo(ant.px, ant.py);
                aberto = true;
              }
              ctx.lineTo(p.px, p.py);
            } else {
              aberto = false;
            }
            ant = p;
          }
          ctx.globalAlpha = alphaBase;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      };

      traca(grade, "rgba(198,198,212,.5)", 0.6, 0.08);

      /* ── a terra, em pontos ────────────────────────────────────────────
         O contorno branco saiu — traço de costa lia como clipart, e foi a
         crítica certa. A terra agora é PREENCHIDA por uma matriz de pontos
         (gerada offline em `terra.ts`, com teste ponto-em-polígono): o
         continente vira textura em vez de desenho, os países são massas e
         não linhas, e a profundidade escurece o hemisfério que vira. */
      for (const [lon, lat] of TERRA) {
        const p = proj(lat, lon, giro, R, cx, cy);
        if (p.z <= 0) continue;
        ctx.fillStyle = `rgba(216,216,230,${0.1 + p.z * 0.42})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, (0.55 + p.z * 0.75) * DPR, 0, 7);
        ctx.fill();
      }

      /* ── os feixes: arcos mint saindo do Brasil ── */
      const NA = 42;
      for (const arc of ARCOS) {
        let ant2: { px: number; py: number; z: number } | null = null;
        ctx.strokeStyle = corRota;
        ctx.lineWidth = 1 * DPR;
        ctx.beginPath();
        let aberto2 = false;
        for (let k = 0; k <= NA; k++) {
          const t2 = k / NA;
          const m = 1 + 0.16 * Math.sin(Math.PI * t2);
          const p = projVec(slerp(vOrigem, arc.v, t2), m, giro, R, cx, cy);
          if (ant2 && ant2.z > 0 && p.z > 0) {
            if (!aberto2) {
              ctx.moveTo(ant2.px, ant2.py);
              aberto2 = true;
            }
            ctx.lineTo(p.px, p.py);
          } else {
            aberto2 = false;
          }
          ant2 = p;
        }
        ctx.globalAlpha = 0.22;
        ctx.stroke();
        ctx.globalAlpha = 1;

        /* o pulso: um ponto mint viajando do Brasil ao destino, cada arco
           com a sua fase pra nunca chegarem todos juntos */
        if (!reduz) {
          const tp = (t * 0.00009 + arc.fase) % 1;
          const m = 1 + 0.16 * Math.sin(Math.PI * tp);
          const p = projVec(slerp(vOrigem, arc.v, tp), m, giro, R, cx, cy);
          if (p.z > 0) {
            ctx.shadowBlur = 12 * DPR;
            ctx.shadowColor = corRota;
            ctx.fillStyle = corRota;
            ctx.globalAlpha = 0.95;
            ctx.beginPath();
            ctx.arc(p.px, p.py, 1.7 * DPR, 0, 7);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          }
        }
      }

      /* a origem: um anel CARMIM respirando sobre o Brasil. Os feixes são
         mint porque são alcance; a origem não é alcance, é de onde saiu — e
         é o único país que faz os dois papéis. O anel pulsa, então é o
         carmim que sobrevive com a página parada. */
      const po = projVec(vOrigem, 1, giro, R, cx, cy);
      if (po.z > 0) {
        const resp = reduz ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.0028);
        ctx.strokeStyle = corAtiva;
        ctx.lineWidth = 1 * DPR;
        ctx.globalAlpha = 0.4 + 0.4 * resp;
        ctx.beginPath();
        ctx.arc(po.px, po.py, (4 + 2.6 * resp) * DPR, 0, 7);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      marcas.length = 0;
      const sel = ativoRef.current;
      let rotulo: { p: Pais; px: number; py: number } | null = null;

      for (const p of PAISES as Pais[]) {
        const { px, py, z } = proj(p.lat, p.lon, giro, R, cx, cy);
        marcas.push({ cc: p.cc, px, py, z });
        if (z <= 0.02) continue;

        const on = sel === p.cc;
        const peso = 0.35 + 0.65 * Math.sqrt(p.n / maior);
        const r = (1.8 + peso * 3.2) * DPR;
        /* Ponto em repouso é BRANCO, não mint. O mint ficou só no número
           grande da seção: com treze marcas verdes girando mais as barras da
           lista, a única cor exclusiva da página virava a cor de tudo ali e
           perdia o efeito de aparecer uma vez só. */
        const corPonto = on ? corAtiva : "rgba(236,236,244,.92)";

        if (on) {
          ctx.strokeStyle = corAtiva;
          ctx.lineWidth = 1.2 * DPR;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(px, py, r + 6 * DPR, 0, 7);
          ctx.stroke();
          ctx.globalAlpha = 1;
          rotulo = { p, px, py };
        }

        ctx.shadowBlur = (on ? 26 : 10) * DPR * z;
        ctx.shadowColor = on ? corAtiva : "rgba(236,236,244,.8)";
        ctx.globalAlpha = on ? 1 : 0.35 + z * 0.65;
        ctx.fillStyle = corPonto;
        ctx.beginPath();
        ctx.arc(px, py, on ? r * 1.3 : r, 0, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      /* o rótulo sai por último pra não ficar sob nenhuma marca */
      if (rotulo) {
        const { p, px, py } = rotulo;
        const txt = `${p.nome} · ${p.pct}%`;
        ctx.font = `${11 * DPR}px ui-monospace, monospace`;
        const w = ctx.measureText(txt).width + 16 * DPR;
        const h = 21 * DPR;
        /* vira pro outro lado quando encosta na borda direita */
        const bx = px + w + 14 * DPR > W ? px - w - 12 * DPR : px + 12 * DPR;
        const by = Math.min(Math.max(py - h / 2, 2 * DPR), H - h - 2 * DPR);
        ctx.fillStyle = "rgba(8,7,13,.92)";
        ctx.beginPath();
        ctx.roundRect(bx, by, w, h, 5 * DPR);
        ctx.fill();
        ctx.strokeStyle = `${corAtiva}66`;
        ctx.lineWidth = 1 * DPR;
        ctx.stroke();
        ctx.fillStyle = "#F7F7F9";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, bx + 8 * DPR, by + h / 2);
      }

      /* ── volumetria, por último ────────────────────────────────────────
         Recortado no disco do planeta e escurecendo do centro-alto pras
         bordas. É o que substitui o anel de luz que estava aqui antes: um
         corpo esférico iluminado fica MAIS ESCURO na borda, porque ali a
         superfície foge do observador. Acender a borda produz aquele aro
         de adesivo; escurecer produz volume.

         Vem depois de tudo pra afundar junto a costa e os pontos do
         hemisfério que está virando — o que dá a sensação de que eles
         entram e saem da luz em vez de piscar. */
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, 7);
      ctx.clip();
      const sombra = ctx.createRadialGradient(
        cx - R * 0.22,
        cy - R * 0.28,
        R * 0.1,
        cx,
        cy,
        R * 1.02,
      );
      sombra.addColorStop(0, "rgba(4,3,10,0)");
      sombra.addColorStop(0.6, "rgba(4,3,10,.14)");
      sombra.addColorStop(1, "rgba(4,3,10,.62)");
      ctx.fillStyle = sombra;
      ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.restore();

      raf = requestAnimationFrame(desenha);
    };

    /* ── gestos ── */
    const emCanvas = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * DPR, y: (e.clientY - r.top) * DPR };
    };

    const mover = (e: PointerEvent) => {
      const { x, y } = emCanvas(e);

      if (arrastando) {
        moveu = true;
        giroExtra += ((e.clientX - xAnterior) * 180) / (cv.clientWidth || 1);
        xAnterior = e.clientX;
        return;
      }

      let perto: string | null = null;
      let melhor = ALCANCE * DPR;
      for (const m of marcas) {
        if (m.z <= 0.02) continue;
        const d = Math.hypot(m.px - x, m.py - y);
        if (d < melhor) {
          melhor = d;
          perto = m.cc;
        }
      }
      cv.style.cursor = perto ? "pointer" : "grab";
      if (perto !== ativoRef.current) aoApontar(perto);
    };

    const entrar = () => {
      parado = true;
    };
    const sair = () => {
      parado = false;
      arrastando = false;
      aoApontar(null);
    };
    const descer = (e: PointerEvent) => {
      arrastando = true;
      moveu = false;
      xAnterior = e.clientX;
      cv.setPointerCapture(e.pointerId);
      cv.style.cursor = "grabbing";
    };
    const subir = (e: PointerEvent) => {
      arrastando = false;
      cv.releasePointerCapture?.(e.pointerId);
      cv.style.cursor = "grab";
      /* clique sem arrasto = seleção; com arrasto, foi só giro */
      if (!moveu) mover(e);
    };

    cv.addEventListener("pointermove", mover);
    cv.addEventListener("pointerenter", entrar);
    cv.addEventListener("pointerleave", sair);
    cv.addEventListener("pointerdown", descer);
    cv.addEventListener("pointerup", subir);
    cv.style.cursor = "grab";
    cv.style.touchAction = "pan-y";

    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          if (!rodando) {
            rodando = true;
            ultimo = 0;
            raf = requestAnimationFrame(desenha);
          }
        } else {
          rodando = false;
          cancelAnimationFrame(raf);
        }
      },
      { threshold: 0.05 },
    );
    io.observe(cv);

    return () => {
      rodando = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      cv.removeEventListener("pointermove", mover);
      cv.removeEventListener("pointerenter", entrar);
      cv.removeEventListener("pointerleave", sair);
      cv.removeEventListener("pointerdown", descer);
      cv.removeEventListener("pointerup", subir);
    };
  }, [corAtiva, corRota, aoApontar]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" />;
}

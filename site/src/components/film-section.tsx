"use client";

import { Player, type PlayerRef } from "@remotion/player";
import { useEffect, useRef, useState } from "react";
import { DEMO_FPS, DEMO_FRAMES, DEMO_H, DEMO_W, SpanixDemo } from "./demo/spanix-demo";
import { useTxt } from "./i18n";
import Reveal from "./reveal";

/**
 * Seção 03 · o filme.
 *
 * ── POR QUE ENTRE `the library` E `the panel` ─────────────────────────────
 * Porque é exatamente a costura que faltava. A seção anterior mostra a linha
 * que se escreve; a seguinte mostra o painel aberto. O salto entre as duas
 * sempre exigiu um ato de fé do leitor — "acredite que uma coisa leva à
 * outra". O filme fecha isso mostrando o caminho inteiro, do `pip install` até
 * a URL, sem cortar nada no meio.
 *
 * E ele termina no painel. Então a seção logo abaixo não é uma tela nova: é o
 * último quadro do filme, parado, pra você olhar com calma.
 *
 * ── PLAYER AO VIVO, NÃO MP4 ───────────────────────────────────────────────
 * A decisão mais importante deste arquivo, e ela é sobre tipografia.
 *
 * O filme é 90% texto monoespaçado fino sobre fundo escuro — que é o pior caso
 * possível pra H.264. O codec gasta bits onde há movimento e economiza em
 * detalhe fino estático, então traço de 1px em mono vira papa: a serifa suja,
 * o `·` some, o `$0.6500` fica ilegível num zoom de retina. Um MP4 legível
 * disso passaria fácil de 8 MB.
 *
 * O `<Player />` roda a mesma composição em React, então o texto é texto:
 * nítido em qualquer DPR, selecionável, e o peso é o do bundle, não de um
 * asset. O custo é CPU — pago com as três travas abaixo.
 *
 * ── AS TRÊS TRAVAS ────────────────────────────────────────────────────────
 *   1. só monta quando entra na tela (IntersectionObserver)
 *   2. só toca quando está visível, e pausa quando sai
 *   3. `prefers-reduced-motion` congela no último quadro, que é o painel
 *      pronto — quem pediu menos movimento recebe a conclusão, não o começo
 */

/* Os marcos apontam o INÍCIO de cada beat de produto, não das cartelas —
   quem chega no meio quer saber qual etapa está rodando, e a etapa é o beat. */
const CARTOES = [
  { f: 112 / 1196, id: "install" },
  { f: 358 / 1196, id: "code" },
  { f: 624 / 1196, id: "run" },
  { f: 986 / 1196, id: "panel" },
];

const T = {
  en: {
    olho: "the film",
    h2: "Install to panel, uncut.",
    sub: "Four acts, no cut. Nothing is hidden between steps, and every number on screen is the same one this page uses everywhere else.",
    marcos: {
      install: "pip install · 6.1 kB, nothing else",
      code: "one import, one wrapper",
      run: "the agent runs · the receipt prints",
      panel: "localhost:7788",
    } as Record<string, string>,
    aviso: "The panel arrives in 0.1. Everything before it ships today.",
  },
  pt: {
    olho: "o filme",
    h2: "Da instalação ao painel, sem corte.",
    sub: "Quatro atos, sem corte. Nada fica escondido entre um passo e outro, e todo número na tela é o mesmo que esta página usa em toda parte.",
    marcos: {
      install: "pip install · 6,1 kB, mais nada",
      code: "um import, um envelope",
      run: "o agente roda · o recibo imprime",
      panel: "localhost:7788",
    } as Record<string, string>,
    aviso: "O painel chega na 0.1. Tudo antes dele já está publicado.",
  },
};

export function FilmSection() {
  const t = useTxt(T);
  const caixa = useRef<HTMLDivElement>(null);
  /* O `<Player />` não aceita prop `playing` — ele é imperativo, controlado por
     ref. Então o observador não guarda "está tocando" pra passar adiante: ele
     manda tocar ou pausar direto no player. */
  const player = useRef<PlayerRef>(null);
  const [montado, setMontado] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [reduz, setReduz] = useState(false);

  useEffect(() => {
    setReduz(
      typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  /* Um observador só resolve montagem e play/pause: entra em cena, monta e
     toca; sai, pausa. Deixar 780 quadros de React rodando atrás de quem já
     rolou pra outra seção é queimar bateria de graça. */
  useEffect(() => {
    const el = caixa.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setMontado(true);
      setTocando(true);
      return;
    }
    const io = new IntersectionObserver(
      (e) => {
        const dentro = !!e[0]?.isIntersecting;
        if (dentro) setMontado(true);
        setTocando(dentro);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* Play/pause por ref, reagindo ao observador. `prefers-reduced-motion`
     nunca toca: fica parado no último quadro. */
  useEffect(() => {
    const p = player.current;
    if (!p || reduz) return;
    if (tocando) p.play();
    else p.pause();
  }, [tocando, reduz, montado]);

  return (
    <section id="film" className="relative">
      <span
        aria-hidden="true"
        className="absolute top-0 right-[14%] left-[14%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.45),transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-[clamp(76px,10vh,116px)] lg:px-10">
        <Reveal>
          <span className="olho">
            <i aria-hidden="true" />
            {t.olho}
          </span>
          <h2 className="h-secao mt-3.5 max-w-[22ch]">{t.h2}</h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-[1.7] font-[450] text-ink-2">
            {t.sub}
          </p>
        </Reveal>

        <Reveal className="mt-[clamp(34px,5vh,52px)]">
          {/* A moldura é da PÁGINA, e a composição não pinta nenhuma: duas
              bordas encaixadas sempre aparecem como duas. O halo violeta
              atrás é o mesmo recurso do globo — descola o retângulo do fundo
              sem desenhar contorno. */}
          {/* ── A PROFUNDIDADE DO BLOCO NA PÁGINA ─────────────────────────
              Três camadas, pela mesma razão que o fundo do filme tem três: uma
              só não descola nada.

                halo   luz violeta larga e desfocada, ATRÁS e acima — é o que
                       faz a aresta de cima da moldura aparecer
                poço   sombra escura e larga logo ABAIXO, que apoia o bloco na
                       página em vez de deixá-lo boiando
                caixa  sombra própria em três raios: contato, projeção e a
                       mancha de chão

              O `-z-10` mantém tudo atrás do vídeo sem criar contexto de
              empilhamento novo. */}
          <div ref={caixa} className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-16 -top-14 -bottom-4 -z-10 rounded-[56px]"
              style={{
                background:
                  "radial-gradient(58% 52% at 50% 28%, rgba(var(--viol-rgb),.24), transparent 74%)",
                filter: "blur(46px)",
              }}
            />
            {/* ── O PÉ ERA UM BREU, E A CAUSA ERA SOMAR SOMBRA COM SOMBRA ──
                Aqui havia um poço PRETO a 90% logo abaixo do bloco. Somado à
                vinheta interna do filme, à sombra própria da moldura e ao
                fundo já escuro da página, o rodapé da seção virava um poço sem
                fundo — o topo funcionava justamente porque lá em cima só havia
                o halo violeta, que ACRESCENTA luz.

                A troca é de natureza, não de dose: em vez de escurecer por
                baixo, ACENDE por baixo. Um brilho violeta fraco e muito
                espalhado apoia o bloco pela luz, e a página respira até o fim
                da seção em vez de desabar nela. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-x-28 -bottom-10 -z-10 h-[220px] rounded-[999px]"
              style={{
                background:
                  "radial-gradient(46% 100% at 50% 100%, rgba(var(--viol-rgb),.16), transparent 74%)",
                filter: "blur(52px)",
              }}
            />
            <div
              className="overflow-hidden rounded-[16px] border border-(--hair) bg-[#0A0910]"
              style={{
                /* A terceira sombra caiu de 1.0 pra .78 e encurtou: ela era
                   quem depositava a mancha preta no rodapé da seção. */
                boxShadow:
                  "0 2px 8px rgba(0,0,0,.45), 0 22px 54px -22px rgba(0,0,0,.7), 0 56px 110px -56px rgba(0,0,0,.78)",
              }}
            >
              {montado ? (
                <Player
                  ref={player}
                  component={SpanixDemo}
                  durationInFrames={DEMO_FRAMES}
                  fps={DEMO_FPS}
                  compositionWidth={DEMO_W}
                  compositionHeight={DEMO_H}
                  style={{ width: "100%", display: "block" }}
                  /* Sem controles e sem clique: é uma vitrine, não um vídeo
                     pra assistir. Controle transformaria em tarefa o que
                     deveria simplesmente acontecer enquanto se lê. */
                  controls={false}
                  clickToPlay={false}
                  doubleClickToFullscreen={false}
                  loop
                  autoPlay={!reduz}
                  /* Quem pediu menos movimento recebe o ÚLTIMO quadro, não o
                     primeiro: o painel pronto, que é a conclusão do filme. */
                  initialFrame={reduz ? DEMO_FRAMES - 1 : 0}
                  showVolumeControls={false}
                  spaceKeyToPlayOrPause={false}
                  numberOfSharedAudioTags={0}
                />
              ) : (
                /* Reserva a altura exata antes de montar: 16:10 travado em
                   `aspect-ratio` não deixa a página pular quando o Player
                   entra. */
                <div style={{ aspectRatio: `${DEMO_W} / ${DEMO_H}` }} />
              )}
            </div>
          </div>
        </Reveal>

        {/* Os quatro marcos, como legenda de tempo. Eles não controlam nada —
            são índice, pra quem chegou no meio saber o que já passou. */}
        <Reveal className="mt-6">
          <div className="grid gap-px overflow-hidden rounded-[12px] border border-(--hair) bg-(--hair) sm:grid-cols-4">
            {CARTOES.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-1.5 bg-[#0A0910] px-4 py-3.5">
                <span className="font-jet text-[10px] text-ink-3 tabular-nums">
                  {String(Math.round((c.f * DEMO_FRAMES) / DEMO_FPS)).padStart(2, "0")}s
                </span>
                <span className="flex items-baseline gap-2 text-[12.5px] leading-[1.45] text-ink-2">
                  <i
                    aria-hidden="true"
                    className="mt-[6px] block size-[5px] shrink-0 rounded-full"
                    style={{
                      background:
                        i === 3 ? "var(--color-viol)" : i === 2 ? "var(--color-mint)" : "rgba(255,255,255,.28)",
                    }}
                  />
                  {t.marcos[c.id]}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3.5 font-mono text-[10.5px] tracking-[.06em] lowercase text-ink-3">
            {t.aviso}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

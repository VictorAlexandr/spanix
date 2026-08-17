"use client";

import { useMemo, useState } from "react";
import {
  chamadasPorTool,
  custoPorAgente,
  eixoDe,
  EXECUCOES,
  QUENTE,
  RESUMO,
  RUN_NOME,
  tokensDe,
  type Execucao,
  type Span,
} from "./run-nightly";
import { useTxt } from "./i18n";
import Reveal from "./reveal";

/**
 * Seção 03 · o painel.
 *
 * O EIXO É TEMPO. Um agente não é um bolo fatiado: é uma coisa que ACONTECE,
 * em ordem, ao longo de segundos. Cada span começa onde começou e dura o que
 * durou — a forma da aba Network, do Jaeger, de qualquer APM. E o vazamento
 * deixa de precisar de explicação: os `WebFetch` do `research` são barras de
 * largura idêntica, encostadas.
 *
 * A LATERAL VIROU NAVEGAÇÃO DE VERDADE. Ela era decorativa — cinco linhas
 * bonitas que não faziam nada. Agora cada execução é clicável e traz o próprio
 * traçado, e o que muda entre elas é justamente o argumento do produto: o laço
 * não apareceu pronto, ele CRESCEU. A #478 repete o fetch uma vez, a #480 duas,
 * a #482 três. Clicando de baixo pra cima a pessoa vê a mesma tarefa ganhando
 * uma volta a mais por semana — a deriva deixa de ser um número num cartão e
 * vira algo que ela descobre com a própria mão.
 *
 * AGENTES TÊM ROSTO. Antes eram barras coloridas com um selo de texto, e ler
 * "quem é quem" exigia decodificar. Agora cada linha abre com um AVATAR: o
 * agente leva um núcleo (círculo com miolo, quem decide), a ferramenta leva
 * uma seta de saída (I/O, quem alcança o mundo fora). Forma diferente, não só
 * cor diferente — quem não distingue matiz continua distinguindo os dois.
 *
 * ALTURA. A janela fica em ~510px: linha de 22px, gráficos em faixa baixa e
 * respiros curtos. Tela de produto que só funciona em monitor grande não é
 * demonstração, é maquete.
 */

/* ── DOIS matizes, não quatro ──────────────────────────────────────────────
   Depois de esbarrar em azul (vizinho do violeta), verde (vizinho do mint),
   laranja, cinza e rosa, a saída não era achar um quarto matiz — era perceber
   que ele não devia existir.

   O laço NÃO é uma categoria à parte: ele É uma ferramenta, só que repetida.
   Dar a ele um matiz próprio dizia ao leitor que `WebFetch` do laço e
   `WebFetch` comum são coisas de naturezas diferentes, e não são. São a mesma
   chamada, uma vez e três vezes.

   Então ferramenta e laço dividem o carmim, e o que os separa é ÊNFASE:
   ferramenta comum entra a 50%, o laço entra cheio e com brilho. Isso é
   exatamente o princípio que a seção já usava desde o começo — tudo recua,
   só o caminho quente acende — agora aplicado dentro de uma categoria em vez
   de entre categorias.

   Sobram dois matizes, e o resultado é o melhor de todas as tentativas:
   ΔE 23,4 sob daltonismo (todos os pares) e 31,5 em visão normal. Menos cor,
   mais separação e menos coisa pra memorizar. */
const LINHA = 22;
const AGENTE_COR = "#8A6EFF";
const TOOL_COR = QUENTE;

function corDe(s: Span) {
  return s.tipo === "agent" ? AGENTE_COR : TOOL_COR;
}

/** Ferramenta comum recua; agente e laço ficam cheios. */
function opacidadeDe(s: Span) {
  return s.quente || s.tipo === "agent" ? 1 : 0.5;
}

/** O span que o inspetor mostra em repouso: a última volta do laço. */
function alvoPadrao(e: Execucao): Span {
  const quentes = e.spans.filter((s) => s.quente && s.tipo === "tool");
  return quentes.at(-1) ?? e.spans.find((s) => s.nome === "research") ?? e.spans[0];
}

/* ── avatar ────────────────────────────────────────────────────────────────
   Duas formas, e a forma carrega o mesmo dado que a cor. Núcleo = agente:
   um anel com miolo, algo que tem interior próprio (contexto, conta, decisão).
   Seta = ferramenta: algo que sai daqui pra fora. Redundância deliberada —
   quem não separa matiz separa silhueta. */
function Avatar({ s }: { s: Span }) {
  const cor = corDe(s);
  const agente = s.tipo === "agent";
  return (
    <span
      aria-hidden="true"
      className="grid size-[15px] shrink-0 place-items-center rounded-[4px]"
      style={{ background: `color-mix(in oklab, ${cor} 20%, transparent)` }}
    >
      <svg viewBox="0 0 12 12" className="size-[9px]" fill="none" stroke={cor}>
        {agente ? (
          <>
            <circle cx="6" cy="6" r="4.2" strokeWidth="1.3" />
            <circle cx="6" cy="6" r="1.5" fill={cor} stroke="none" />
          </>
        ) : (
          <>
            <path d="M2.2 6h6.4" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M6.2 3.4 9 6l-2.8 2.6" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>
    </span>
  );
}

function Barra({
  s,
  dur,
  ativo,
  aoEntrar,
}: {
  s: Span;
  dur: number;
  ativo: Span;
  aoEntrar: (s: Span) => void;
}) {
  const sel = ativo === s;
  const cor = corDe(s);

  return (
    <button
      type="button"
      onMouseEnter={() => aoEntrar(s)}
      onFocus={() => aoEntrar(s)}
      aria-label={`${s.nome}, ${s.tipo}, starts at ${s.ini.toFixed(1)}s, lasts ${s.dur.toFixed(1)}s, $${s.custo.toFixed(4)}`}
      className="grid w-full grid-cols-[132px_minmax(0,1fr)_50px] items-center gap-3 rounded-[3px] px-2 text-left transition-colors duration-150 hover:bg-white/[.045]"
      style={{ height: LINHA, background: sel ? "rgba(255,255,255,.06)" : undefined }}
    >
      <span className="flex min-w-0 items-center gap-1.5" style={{ paddingLeft: s.nivel * 10 }}>
        <Avatar s={s} />
        <span
          className="truncate font-jet text-[10.5px]"
          style={{ color: s.quente || s.tipo === "agent" ? "var(--pn-ink)" : "var(--pn-ink-2)" }}
        >
          {s.nome}
        </span>
      </span>

      <span className="relative block h-full">
        <span
          className="absolute top-1/2 -translate-y-1/2 rounded-[3px]"
          style={{
            left: `${(s.ini / dur) * 100}%`,
            width: `max(3px, ${(s.dur / dur) * 100}%)`,
            height: s.tipo === "agent" ? 10 : 7,
            background: cor,
            opacity: opacidadeDe(s),
            /* o brilho é o que separa o laço da ferramenta comum, já que as
               duas dividem o mesmo matiz */
            boxShadow: s.quente ? `0 0 16px -3px ${QUENTE}` : undefined,
          }}
        />
      </span>

      <span
        className="text-right font-jet text-[9.5px] tabular-nums"
        style={{ color: s.quente ? "var(--pn-dinheiro)" : "var(--pn-ink-3)" }}
      >
        ${s.custo.toFixed(2)}
      </span>
    </button>
  );
}

function Mini({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 px-4 py-3">
      <span className="mb-2.5 block font-mono text-[8px] tracking-[.22em] uppercase text-(--pn-ink-3)">
        {titulo}
      </span>
      {children}
    </div>
  );
}

function BarraMini({
  nome,
  valor,
  fracao,
  cor,
  quente,
}: {
  nome: string;
  valor: string;
  fracao: number;
  /** o matiz da categoria — violeta para agente, carmim para ferramenta */
  cor: string;
  quente?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 py-[3px]">
      <span
        className="w-[54px] shrink-0 truncate font-jet text-[9.5px]"
        style={{ color: quente ? "var(--pn-ink)" : "var(--pn-ink-3)" }}
      >
        {nome}
      </span>
      <span className="relative h-[6px] flex-1 overflow-hidden rounded-full bg-white/[.06]">
        <span
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${fracao * 100}%`,
            background: cor,
            opacity: quente ? 1 : 0.5,
          }}
        />
      </span>
      <span
        className="w-[38px] shrink-0 text-right font-jet text-[9.5px] tabular-nums"
        style={{ color: quente ? "var(--pn-dinheiro)" : "var(--pn-ink-3)" }}
      >
        {valor}
      </span>
    </div>
  );
}

function Chip({ k, v, cor }: { k: string; v: string; cor?: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[8px] tracking-[.18em] uppercase text-(--pn-ink-3)">{k}</span>
      <span
        className="font-jet text-[12px] font-medium tabular-nums"
        style={{ color: cor ?? "var(--pn-ink)" }}
      >
        {v}
      </span>
    </span>
  );
}

/* O QUE NÃO TRADUZ AQUI: tudo que está DENTRO da janela do painel — `cost`,
   `time`, `turns`, `agent`, `tool`, `loop`, os nomes de agente e ferramenta.
   Aquilo é a interface do produto, e a interface é em inglês. Traduzir só o
   texto da moldura, e deixar o mockup em inglês, é o comportamento honesto:
   é o que a pessoa vai ver quando rodar. Só a PROSA da seção muda. */
const T = {
  en: {
    olho: "the panel",
    h2b: "of agent, laid out.",
    sub: "Every subagent and every tool call on the clock, at the width it cost. That fetch runs three times here. Five runs back, on the left, it ran once.",
    atras: (n: number) => `${n} run${n > 1 ? "s" : ""} ago`,
  },
  pt: {
    olho: "o painel",
    h2b: "de agente, na linha do tempo.",
    sub: "Cada subagente e cada chamada de ferramenta no relógio, na largura que custaram. Esse fetch roda três vezes aqui. Cinco execuções atrás, à esquerda, rodava uma.",
    atras: (n: number) => `há ${n} execuç${n > 1 ? "ões" : "ão"}`,
  },
};

export function PanelSection() {
  const t = useTxt(T);
  const [i, setI] = useState(0);
  const run = EXECUCOES[i];
  const [ativo, setAtivo] = useState<Span>(() => alvoPadrao(EXECUCOES[0]));

  const eixo = useMemo(() => eixoDe(run.duracao), [run.duracao]);
  const agentes = useMemo(() => custoPorAgente(run), [run]);
  const tools = useMemo(() => chamadasPorTool(run), [run]);
  const tokens = useMemo(() => tokensDe(run), [run]);
  const teto = Math.max(...EXECUCOES.map((e) => e.custo));
  const maxAg = Math.max(...agentes.map((a) => a.v));
  const maxTool = Math.max(...tools.map((t) => t.v));
  const totalTok = tokens.reduce((a, t) => a + t.v, 0);

  function escolher(k: number) {
    setI(k);
    setAtivo(alvoPadrao(EXECUCOES[k]));
  }

  return (
    <section id="panel" className="papel relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[120px]"
        style={{ background: "linear-gradient(180deg, #0A0910 0%, rgba(10,9,16,.55) 34%, transparent 100%)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[120px]"
        style={{ background: "linear-gradient(0deg, #0A0910 0%, rgba(10,9,16,.5) 36%, transparent 100%)" }}
      />

      <div className="relative z-20 mx-auto w-full max-w-[1080px] px-6 py-[clamp(78px,9vh,110px)] lg:px-10">
        <Reveal>
          <span className="olho">
            <i aria-hidden="true" />
            {t.olho}
          </span>
          <h2 className="h-secao mt-3.5 max-w-[20ch]">
            {RESUMO.duracao} {t.h2b}
          </h2>
          <p className="mt-3.5 max-w-[62ch] text-[15px] leading-[1.7] font-[450] text-(--tinta-2)">
            {t.sub}
          </p>
        </Reveal>

        <Reveal className="mt-[clamp(28px,4vh,44px)]">
          <div className="painel overflow-hidden rounded-[12px] border border-black/15 bg-(--pn) shadow-[0_1px_3px_rgba(20,18,28,.14),0_44px_100px_-34px_rgba(20,18,28,.62)]">
            {/* cromo do navegador */}
            <div className="flex items-center gap-3 border-b border-(--pn-fio) bg-[#141418] px-3.5 py-2">
              <span aria-hidden="true" className="flex shrink-0 gap-[6px]">
                <i className="block size-[10px] rounded-full bg-[#FF5F57] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.22)]" />
                <i className="block size-[10px] rounded-full bg-[#FEBC2E] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.22)]" />
                <i className="block size-[10px] rounded-full bg-[#28C840] shadow-[inset_0_0_0_.5px_rgba(0,0,0,.22)]" />
              </span>
              <span aria-hidden="true" className="ml-1 hidden shrink-0 items-center gap-3 text-(--pn-ink-3) sm:flex">
                <svg viewBox="0 0 16 16" className="size-[12px]" fill="none" stroke="currentColor">
                  <path d="M10 3.5 5.5 8l4.5 4.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <svg viewBox="0 0 16 16" className="size-[12px] opacity-40" fill="none" stroke="currentColor">
                  <path d="M6 3.5 10.5 8 6 12.5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="mx-auto flex min-w-0 max-w-[280px] flex-1 items-center justify-center gap-2 rounded-[6px] bg-black/40 px-3 py-[3px] font-jet text-[10px] text-(--pn-ink-3)">
                <i aria-hidden="true" className="pulse-dot block size-[5px] shrink-0 rounded-full bg-ok" />
                <span className="truncate">localhost:7788/runs/{run.id}</span>
              </span>
              {/* ── SELO DE VERSÃO NA MOLDURA ──────────────────────────────
                  Esta janela inteira é um mockup: o painel chega na 0.1. Sem o
                  selo, ela é lida como captura de tela — e a página cuja tese é
                  "cheque você mesmo" estaria mostrando uma tela que não existe.

                  Ele vai AQUI, na barra de endereço, e não numa nota abaixo da
                  seção: quem olha uma janela de navegador olha a barra antes de
                  olhar o conteúdo, e é lá que a data pega a pessoa antes de ela
                  acreditar no que vê.

                  Ultravioleta, não âmbar: âmbar era da paleta antiga; hoje "o
                  que vem" é violeta em toda a página (a coluna `v0.1.0 · next`
                  da seção `the road`, o selo do terminal da seção 02).

                  MAS O TEXTO VAI NO `--color-viol-txt`, não no `--color-viol`.
                  Em mono de 8,5px com tracking, violeta cheio some — sobra
                  tinta de menos por glifo pra cor cromática competir. O violeta
                  fica na borda e no fundo, que é onde ele tem área. */}
              <span className="ml-auto shrink-0 rounded-full border border-[rgba(var(--viol-rgb),.5)] bg-[rgba(var(--viol-rgb),.2)] px-[9px] py-[2px] font-mono text-[9px] font-medium tracking-[.14em] text-ink uppercase">
                0.1 preview
              </span>
            </div>

            <div className="flex">
              {/* ── lateral navegável ── */}
              <aside className="hidden w-[168px] shrink-0 flex-col border-r border-(--pn-fio) bg-black/25 lg:flex">
                <div className="border-b border-(--pn-fio) px-4 py-[11px]">
                  <span className="font-sora text-[13px] font-semibold tracking-[-.03em] text-(--pn-ink)">
                    spanix<i className="not-italic" style={{ color: "var(--color-viol)" }}>.</i>
                  </span>
                </div>
                <div className="px-4 pt-3 pb-1">
                  <span className="font-mono text-[8px] tracking-[.22em] uppercase text-(--pn-ink-3)">
                    {RUN_NOME}
                  </span>
                </div>
                <ul className="px-2 pb-2">
                  {EXECUCOES.slice(0, 5).map((e, k) => {
                    const sel = k === i;
                    return (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => escolher(k)}
                          aria-current={sel || undefined}
                          className={`flex w-full flex-col gap-1 rounded-[5px] px-2.5 py-[6px] text-left transition-colors ${
                            sel ? "bg-white/[.08]" : "hover:bg-white/[.04]"
                          }`}
                        >
                          <span className="flex items-baseline justify-between gap-2">
                            <span
                              className={`font-jet text-[10px] tabular-nums ${sel ? "text-(--pn-ink)" : "text-(--pn-ink-3)"}`}
                            >
                              #{e.id}
                            </span>
                            <span
                              className="font-jet text-[10px] tabular-nums"
                              style={{ color: sel ? "var(--pn-dinheiro)" : "var(--pn-ink-3)" }}
                            >
                              ${e.custo.toFixed(2)}
                            </span>
                          </span>
                          <span className="block h-[3px] w-full overflow-hidden rounded-full bg-white/8">
                            <span
                              className="block h-full rounded-full transition-[width]"
                              style={{
                                width: `${(e.custo / teto) * 100}%`,
                                background: sel ? "var(--color-viol)" : "rgba(255,255,255,.22)",
                              }}
                            />
                          </span>
                          {/* quantas voltas o laço deu — o dado que muda entre
                              as execuções, visível antes de clicar */}
                          <span className="flex items-center gap-[3px] pt-[2px]">
                            {Array.from({ length: 3 }, (_, r) => (
                              <i
                                key={r}
                                aria-hidden="true"
                                className="block h-[3px] flex-1 rounded-full"
                                style={{
                                  background:
                                    r < e.repeticoes
                                      ? e.repeticoes > 1
                                        ? QUENTE
                                        : "rgba(255,255,255,.3)"
                                      : "rgba(255,255,255,.07)",
                                  opacity: sel ? 1 : 0.5,
                                }}
                              />
                            ))}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-auto flex items-center gap-2 border-t border-(--pn-fio) px-4 py-2">
                  <i aria-hidden="true" className="pulse-dot block size-[5px] shrink-0 rounded-full bg-ok" />
                  <span className="font-jet text-[9px] text-(--pn-ink-3)">local · no account</span>
                </div>
              </aside>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 border-b border-(--pn-fio) px-5 py-3">
                  <span className="font-sora text-[14.5px] font-semibold tracking-[-.02em] text-(--pn-ink)">
                    {RUN_NOME}
                  </span>
                  <span className="font-jet text-[10px] text-(--pn-ink-3)">
                    #{run.id}
                    {i === 0 ? ` · ${RESUMO.quando}` : ` · ${t.atras(i)}`}
                  </span>
                  <span className="ml-auto flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <Chip k="cost" v={`$${run.custo.toFixed(4)}`} cor="var(--pn-dinheiro)" />
                    <Chip k="time" v={`${run.duracao.toFixed(1)}s`} />
                    <Chip k="turns" v={String(run.turns)} />
                  </span>
                </div>

                <div className="grid grid-cols-[132px_minmax(0,1fr)_50px] items-center gap-3 border-b border-(--pn-fio) px-7 py-1.5">
                  {/* A legenda espelha a regra: `tool` e `loop` mostram o MESMO
                      matiz, e o que muda entre eles é a intensidade. Se ela
                      pintasse os dois iguais, esconderia a distinção; se
                      pintasse com matizes diferentes, mentiria sobre ela. */}
                  <span className="flex items-center gap-2.5">
                    {(
                      [
                        ["agent", AGENTE_COR, 1],
                        ["tool", TOOL_COR, 0.5],
                        ["loop", QUENTE, 1],
                      ] as const
                    ).map(([n, c, o]) => (
                      <span key={n} className="inline-flex items-center gap-1">
                        <i
                          aria-hidden="true"
                          className="block h-[7px] w-[3px] rounded-full"
                          style={{ background: c, opacity: o }}
                        />
                        <span className="font-mono text-[7.5px] tracking-[.1em] uppercase text-(--pn-ink-3)">
                          {n}
                        </span>
                      </span>
                    ))}
                  </span>
                  <span className="relative block h-[11px]">
                    {eixo.map((s) => (
                      <span
                        key={s}
                        className="absolute top-0 font-jet text-[8.5px] text-(--pn-ink-3) tabular-nums"
                        style={{ left: `${(s / run.duracao) * 100}%` }}
                      >
                        {s}s
                      </span>
                    ))}
                  </span>
                  <span />
                </div>

                <div className="relative px-5 py-2" onMouseLeave={() => setAtivo(alvoPadrao(run))}>
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-2 left-5 right-5">
                    <span className="absolute inset-y-0 block" style={{ left: 132 + 12 + 8, right: 50 + 12 + 8 }}>
                      {eixo.map((s) => (
                        <span
                          key={s}
                          className="absolute inset-y-0 w-px bg-white/[.05]"
                          style={{ left: `${(s / run.duracao) * 100}%` }}
                        />
                      ))}
                    </span>
                  </span>
                  <div className="relative">
                    {run.spans.map((s, k) => (
                      <Barra key={k} s={s} dur={run.duracao} ativo={ativo} aoEntrar={setAtivo} />
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-y border-(--pn-fio) bg-(--pn-2) px-5 py-2.5">
                  <span className="inline-flex items-center gap-2">
                    <Avatar s={ativo} />
                    <span className="font-jet text-[11.5px] font-medium text-(--pn-ink)">{ativo.nome}</span>
                    <span className="font-mono text-[7.5px] tracking-[.1em] uppercase text-(--pn-ink-3)">
                      {ativo.tipo}
                    </span>
                  </span>
                  <span className="font-jet text-[11px] text-(--pn-ink-2) tabular-nums">
                    {ativo.ini.toFixed(1)}s → {(ativo.ini + ativo.dur).toFixed(1)}s
                  </span>
                  <span
                    className="font-jet text-[11px] font-medium tabular-nums"
                    style={{ color: "var(--pn-dinheiro)" }}
                  >
                    ${ativo.custo.toFixed(4)}
                  </span>
                  <span className="text-[11px] text-(--pn-ink-3)">{ativo.nota}</span>
                </div>

                <div className="grid divide-y divide-(--pn-fio) sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                  <Mini titulo="cost by agent">
                    {agentes.map((c) => (
                      <BarraMini
                        key={c.nome}
                        nome={c.nome}
                        valor={`$${c.v.toFixed(2)}`}
                        fracao={c.v / maxAg}
                        cor={AGENTE_COR}
                        quente={c.quente}
                      />
                    ))}
                  </Mini>

                  <Mini titulo="tool calls">
                    {tools.map((t) => (
                      <BarraMini
                        key={t.nome}
                        nome={t.nome}
                        valor={`×${t.v}`}
                        fracao={t.v / maxTool}
                        cor={TOOL_COR}
                        quente={t.quente}
                      />
                    ))}
                  </Mini>

                  <Mini titulo="tokens">
                    <div className="flex h-[6px] gap-[2px] overflow-hidden rounded-full">
                      {tokens.map((t) => (
                        <span
                          key={t.nome}
                          className="rounded-full"
                          style={{ width: `${(t.v / totalTok) * 100}%`, background: t.cor }}
                        />
                      ))}
                    </div>
                    <div className="mt-2.5 flex flex-col gap-[3px]">
                      {tokens.map((t) => (
                        <span key={t.nome} className="flex items-center gap-2">
                          <i
                            aria-hidden="true"
                            className="block size-[5px] shrink-0 rounded-full"
                            style={{ background: t.cor }}
                          />
                          <span className="font-jet text-[9.5px] text-(--pn-ink-3)">{t.nome}</span>
                          <span className="ml-auto font-jet text-[9.5px] text-(--pn-ink-2) tabular-nums">
                            {t.v.toLocaleString("en-US")}
                          </span>
                        </span>
                      ))}
                    </div>
                  </Mini>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

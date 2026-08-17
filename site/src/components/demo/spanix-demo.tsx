import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import {
  ATUAL,
  EXECUCOES,
  QUENTE,
  RESUMO,
  RUN_NOME,
  chamadasPorTool,
  custoPorAgente,
  eixoDe,
  tokensDe,
} from "../run-nightly";

/**
 * SpanixDemo · do `pip install` ao painel.
 *
 * ── É UM FILME, NÃO UMA TELA ──────────────────────────────────────────────
 * A versão anterior era uma janela só ocupando o quadro inteiro, com trilho
 * lateral. Ficou nítida e coerente, e ainda assim parecia captura de app: sem
 * respiro, sem voz, sem ritmo. Faltava a metade do vocabulário de vídeo de
 * produto — a TIPOGRAFIA.
 *
 * Filme de produto alterna dois registros. CARTELA: uma frase grande sobre o
 * preto, sem interface nenhuma, que diz o que a próxima cena significa. BEAT:
 * a interface, flutuando com margem em volta, provando a frase. A cartela dá
 * o argumento; o beat dá a evidência. Nenhuma das duas funciona sozinha —
 * frase sem prova é slogan, prova sem frase é screenshot.
 *
 *     000–062  "Four agents running. Zero visibility."
 *     078–186  pip install · 6,1 kB, mais nada
 *     186–224  "One line."
 *     224–330  o código
 *     330–368  "One command."
 *     368–506  spanix · o recibo e a URL
 *     506–544  "The whole run, priced."
 *     544–700  o painel
 *     700–756  spanix. · pip install spanix
 *
 * ── A TIPOGRAFIA É CINÉTICA ───────────────────────────────────────────────
 * Cada palavra sobe de dentro de uma máscara, escalonada em 4 quadros. É o
 * gesto mais antigo do motion design e continua sendo o mais eficaz: o texto
 * não "aparece", ele CHEGA, e a defasagem entre as palavras cria leitura na
 * ordem certa. A máscara é `overflow: hidden` com `translateY` dentro —
 * nunca `scale`, pelo motivo abaixo.
 *
 * ── POR QUE NÃO EXISTE UM ÚNICO `scale` NESTE ARQUIVO ─────────────────────
 * `perspective` + `preserve-3d` + `scale` promovem o elemento a camada
 * composta na GPU. Camada composta é rasterizada UMA VEZ no tamanho natural e
 * depois ampliada como bitmap — foi o que borrou a versão com câmera. Tudo
 * aqui se move só por `opacity` e `translate`, que compõem sem rasterizar
 * antes. Nitidez é a razão de o filme ser um `<Player />` e não um MP4;
 * gastar isso com efeito seria trocar o motivo pelo enfeite.
 *
 * ── OS NÚMEROS ────────────────────────────────────────────────────────────
 * Todos vêm de `run-nightly.ts`, a mesma fonte da página. O painel do último
 * beat é a réplica da seção 03, não uma versão simplificada.
 */


export const DEMO_FPS = 30;
export const DEMO_FRAMES = 1196; // 39,9s
export const DEMO_W = 1600;
export const DEMO_H = 900;

/* Sem azul. A paleta é a mesma da página: quase-preto, branco, mint pro que é
   fato, carmim pro que está quente, violeta pra marca e pras barras. */
const C = {
  fundo: "#0A0910",
  painel: "#100E18",
  fio: "rgba(255,255,255,.09)",
  fio2: "rgba(255,255,255,.06)",
  ink: "#F7F7F9",
  ink2: "#C6C6D0",
  ink3: "#8B8797",
  viol: "#8a6eff",
  violClaro: "#CBBCFF",
  mint: "#3dffc4",
  carmim: QUENTE,
  kw: "#C099FF",
} as const;

const MONO = 'var(--font-jet), "JetBrains Mono", ui-monospace, SFMono-Regular, monospace';
const SANS = "var(--font-sora), Inter, system-ui, sans-serif";

const TOK = tokensDe(ATUAL);
const AGENTES = custoPorAgente(ATUAL);
const TOOLS = chamadasPorTool(ATUAL);
const EIXO = eixoDe(ATUAL.duracao);
const N = (v: number) => v.toLocaleString("en-US");
const TETO = Math.max(...EXECUCOES.slice(0, 5).map((e) => e.custo));
const SPAN_QUENTE = ATUAL.spans.find((s) => s.quente) ?? ATUAL.spans[0];
const MAX_AG = Math.max(...AGENTES.map((a) => a.v));
const MAX_TOOL = Math.max(...TOOLS.map((t) => t.v));
const TOTAL_TOK = TOK.reduce((a, t) => a + t.v, 0);

const CHROME = 46;

type Beat = { ini: number; fim: number };

/* ── O ALTERNADO ──────────────────────────────────────────────────────────
   Cartela curta, beat longo, cartela curta, beat longo. A cartela nunca
   passa de 34 quadros porque frase grande na tela por mais de um segundo e
   pouco vira leitura obrigatória; ela é pra ser absorvida de relance e sair.
   O beat fica com o tempo todo, porque é ele que prova. */
/* ── AS DURAÇÕES SAÍRAM DE CONTA, NÃO DE PALPITE ──────────────────────────
   Uma cartela de W palavras leva `6 + (W-1)*PASSO + SUBIDA` quadros pra
   terminar de entrar, e gasta os últimos SAIDA quadros indo embora. O que
   sobra no meio é o único tempo em que a frase existe PARADA — e era isso que
   estava faltando: com 54 quadros, três das quatro cartelas começavam a sair
   ANTES de a última palavra terminar de subir. Saldo de −0,33s de leitura.
   Elas literalmente nunca ficavam quietas, e é daí que vinha a sensação de 2x.

   Agora cada uma é dimensionada pela própria contagem de palavras:
     5 palavras → 48 de entrada + 50 parada + 14 saída = 112 quadros
     4 palavras → 43 de entrada + 39 parada + 14 saída =  96 quadros */
/* ── TODA CENA TERMINA DEPOIS DO SEU CONTEÚDO, NÃO ANTES ──────────────────
   Os três beats saíam de cena antes de o próprio conteúdo terminar de
   aparecer, e a última linha de cada um nunca era vista parada:

     beat1   a linha "1 package · 6.1 kB · 0 dependencies"   −8 quadros
     beat2   a linha "+2 lines · the loop is unchanged"       −6 quadros
     beat3   a linha da deriva e a URL                       −16 quadros

   A moldura começa a sair 18 quadros antes do fim da cena, então o fim de
   cada beat passou a ser: último conteúdo + parada + 18. Vale conferir esta
   conta sempre que qualquer sub-beat mudar — foi a terceira vez que ela
   quebrou em silêncio. */
const CENAS = {
  cartela1: { ini: 0, fim: 112 },
  beat1: { ini: 112, fim: 266 },
  cartela2: { ini: 266, fim: 358 },
  beat2: { ini: 358, fim: 532 },
  cartela3: { ini: 532, fim: 624 },
  beat3: { ini: 624, fim: 894 },
  cartela4: { ini: 894, fim: 986 },
  beat4: { ini: 986, fim: 1132 },
  fecho: { ini: 1132, fim: DEMO_FRAMES },
} satisfies Record<string, Beat>;

/* ── A DATILOGRAFIA, EM CARACTERES POR SEGUNDO ────────────────────────────
   Eu tinha corrigido "lento demais" empurrando pro extremo oposto: o arquivo
   inteiro saía a 90 ch/s, que é metralhadora e não datilografia — o bloco
   praticamente aparecia pronto.

   As velocidades agora são deliberadas, e diferentes de propósito:

     $ pip install spanix      20 ch / 1,47s  =  14 ch/s   comando: cadência
     $ python research_...     26 ch / 1,53s  =  17 ch/s   humana, dá pra ler
     $ spanix                   8 ch / 0,80s  =  10 ch/s   junto com quem digita
     o arquivo .py            168 ch / 3,67s  =  46 ch/s   acelerado, porque
                                                           nenhum demo digita
                                                           168 caracteres em
                                                           tempo real

   Os comandos são o momento humano do filme; o arquivo é montagem, e todo
   mundo entende que é. Tratar os dois com a mesma velocidade é que estava
   errado. */
const B = {
  cmdInstall: { ini: 128, fim: 172 },
  saidaInstall: { ini: 180, fim: 214 },
  codigo: { ini: 380, fim: 490 },
  cmdRun: { ini: 640, fim: 686 },
  stream: { ini: 690, fim: 728 },
  cmdSpanix: { ini: 742, fim: 766 },
  recibo: { ini: 774, fim: 818 },
  urlAcende: { ini: 822, fim: 840 },
  painel: { ini: 1000, fim: DEMO_FRAMES },
} satisfies Record<string, Beat>;

const SUAVE = Easing.bezier(0.32, 0.08, 0.16, 1);

function digitado(txt: string, f: number, b: Beat) {
  const p = interpolate(f, [b.ini, b.fim], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return txt.slice(0, Math.round(p * txt.length));
}

function reveladas(total: number, f: number, b: Beat) {
  return Math.round(
    interpolate(f, [b.ini, b.fim], [0, total], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
}

/** Cross-fade curto com deslocamento vertical. SEM escala — é o que mantém o
 *  texto rasterizado no tamanho final e portanto nítido. */
function troca(f: number, ini: number, fim: number, dur = 20) {
  const entra = interpolate(f, [ini, ini + dur], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });
  const sai = interpolate(f, [fim - dur, fim], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });
  const o = entra * (1 - sai);
  return { opacity: o, transform: `translateY(${(1 - entra) * 16 - sai * 16}px)` };
}

function Cursor({ f }: { f: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 20,
        marginLeft: 2,
        transform: "translateY(3px)",
        background: C.ink,
        opacity: Math.floor(f / 15) % 2 === 0 ? 0.85 : 0,
      }}
    />
  );
}

function Rotulo({ children, cor }: { children: React.ReactNode; cor?: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 9,
        letterSpacing: ".2em",
        textTransform: "uppercase",
        color: cor ?? C.ink3,
      }}
    >
      {children}
    </div>
  );
}

/* ── ato 01 e 03 · o terminal ────────────────────────────────────────────── */

const INSTALL = [
  { t: "Collecting spanix", c: C.ink2 },
  { t: "  Downloading spanix-0.0.2-py3-none-any.whl (6.1 kB)", c: C.ink3 },
  { t: "Installing collected packages: spanix", c: C.ink2 },
  { t: "Successfully installed spanix-0.0.2", c: C.mint },
];

const STREAM = [
  "AssistantMessage  thinking",
  "ToolUseBlock      Read(pyproject.toml)",
  "ToolUseBlock      WebFetch(docs.anthropic.com)",
  "ToolResultBlock   38.2 kB",
  "ToolUseBlock      WebFetch(docs.anthropic.com)",
  "ToolUseBlock      Task(research)",
  "ResultMessage     total_cost_usd=0.65",
];

type Peca = { t: string; c?: string; peso?: number };
const RECIBO: Peca[][] = [
  [
    { t: "spanix", c: C.mint, peso: 600 },
    { t: ` · 5 runs · ${RUN_NOME}` },
    { t: `  ${RESUMO.duracao}`, c: C.ink3 },
  ],
  [{ t: "  cost      ", c: C.ink3 }, { t: RESUMO.custoFmt, c: C.mint, peso: 600 }],
  [
    { t: "  tokens    ", c: C.ink3 },
    { t: N(ATUAL.tokens), c: C.violClaro },
    { t: ` (in ${N(TOK[0].v)} · cache ${N(TOK[1].v)})`, c: C.ink3 },
  ],
  [{ t: "  turns     ", c: C.ink3 }, { t: String(RESUMO.turns) }],
  [{ t: "  tools     ", c: C.ink3 }, { t: "Read ×3, Task ×2, WebFetch ×5", c: C.ink2 }],
  [],
  [{ t: "  ↑ 24% vs last week · WebFetch ×5, 3 same arg", c: C.carmim }],
];

const Linha = ({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ minHeight: 30, whiteSpace: "pre", ...style }}>{children ?? " "}</div>
);

function AtoInstall({ f }: { f: number }) {
  const cmd = digitado("$ pip install spanix", f, B.cmdInstall);
  const n = reveladas(INSTALL.length, f, B.saidaInstall);
  return (
    <div style={{ fontFamily: MONO, fontSize: 18, lineHeight: "30px", color: C.ink }}>
      <Linha>
        {cmd}
        {f < B.saidaInstall.ini && <Cursor f={f} />}
      </Linha>
      {INSTALL.slice(0, n).map((l, i) => (
        <Linha key={i} style={{ color: l.c }}>
          {l.t}
        </Linha>
      ))}
      {n >= INSTALL.length && (
        <>
          <Linha style={{ height: 18, minHeight: 18 }} />
          {/* O ARGUMENTO, dito por dado e não por adjetivo: o pacote inteiro
              tem 6,1 kB e nenhuma outra linha de "Collecting". */}
          <Linha style={{ color: C.ink3, fontSize: 15 }}>
            {"  "}1 package · 6.1 kB · 0 dependencies
          </Linha>
        </>
      )}
    </div>
  );
}

function AtoRun({ f }: { f: number }) {
  const cmd2 = digitado("$ python research_agent.py", f, B.cmdRun);
  const nS = reveladas(STREAM.length, f, B.stream);
  const cmd3 = digitado("$ spanix", f, B.cmdSpanix);
  const nR = reveladas(RECIBO.length, f, B.recibo);
  const acesa = interpolate(f, [B.urlAcende.ini, B.urlAcende.fim], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ fontFamily: MONO, fontSize: 18, lineHeight: "30px", color: C.ink }}>
      <Linha>
        {cmd2}
        {f < B.stream.ini && <Cursor f={f} />}
      </Linha>
      {STREAM.slice(0, nS).map((l, i) => (
        <Linha
          key={i}
          style={{
            color: C.ink3,
            fontSize: 16,
            opacity: interpolate(i, [0, STREAM.length - 1], [0.95, 0.7]),
          }}
        >
          {"  "}
          {l}
        </Linha>
      ))}

      {f > B.cmdSpanix.ini - 8 && (
        <>
          <Linha style={{ height: 16, minHeight: 16 }} />
          <Linha>
            {cmd3}
            {f < B.recibo.ini && <Cursor f={f} />}
          </Linha>
          <Linha style={{ height: 10, minHeight: 10 }} />
        </>
      )}

      {RECIBO.slice(0, nR).map((linha, i) => (
        <Linha key={i}>
          {linha.map((tk, j) => (
            <span key={j} style={{ color: tk.c ?? C.ink, fontWeight: tk.peso }}>
              {tk.t}
            </span>
          ))}
        </Linha>
      ))}

      {nR >= RECIBO.length && (
        <>
          <Linha style={{ height: 10, minHeight: 10 }} />
          <Linha
            style={{
              color: C.mint,
              textShadow: `0 0 ${24 * acesa}px rgba(61,255,196,${0.8 * acesa})`,
            }}
          >
            <span style={{ color: C.ink3 }}>→ </span>
            http://localhost:7788
          </Linha>
        </>
      )}
    </div>
  );
}

/* ── ato 02 · o editor ───────────────────────────────────────────────────── */

const COD: Peca[] = [
  { t: "from ", c: C.kw },
  { t: "claude_agent_sdk ", c: C.ink2 },
  { t: "import ", c: C.kw },
  { t: "query\n", c: C.violClaro },
  { t: "from ", c: C.kw },
  { t: "spanix ", c: C.ink2 },
  { t: "import ", c: C.kw },
  { t: "watch", c: C.mint, peso: 600 },
  { t: "\n\nstream = " },
  { t: "query", c: C.violClaro },
  { t: "(", c: C.ink3 },
  { t: "prompt", c: C.ink2 },
  { t: "=p, " },
  { t: "options", c: C.ink2 },
  { t: "=opts" },
  { t: ")", c: C.ink3 },
  { t: "\n\n" },
  { t: "async for ", c: C.kw },
  { t: "msg " },
  { t: "in ", c: C.kw },
  { t: "watch", c: C.mint, peso: 600 },
  { t: "(", c: C.ink3 },
  { t: "stream, " },
  { t: "run", c: C.ink2 },
  { t: "=" },
  { t: `"${RUN_NOME}"`, c: C.carmim },
  { t: "):", c: C.ink3 },
  { t: "\n    " },
  { t: "handle", c: C.violClaro },
  { t: "(msg)" },
];
const COD_TXT = COD.map((t) => t.t).join("");

function AtoWrap({ f }: { f: number }) {
  const n = digitado(COD_TXT, f, B.codigo).length;
  let resta = n;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <Rotulo>research_agent.py</Rotulo>
        <span style={{ flex: 1, height: 1, background: C.fio2 }} />
      </div>
      <pre
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: 19,
          lineHeight: "36px",
          color: C.ink,
          whiteSpace: "pre-wrap",
        }}
      >
        {COD.map((tk, i) => {
          const p = tk.t.slice(0, Math.max(0, resta));
          resta -= p.length;
          return (
            <span key={i} style={{ color: tk.c ?? C.ink, fontWeight: tk.peso }}>
              {p}
            </span>
          );
        })}
        {n < COD_TXT.length && <Cursor f={f} />}
      </pre>
      {n >= COD_TXT.length && (
        <div style={{ marginTop: 26, fontFamily: MONO, fontSize: 15, color: C.ink3 }}>
          <span style={{ color: C.mint }}>+2</span> lines · the loop around it is unchanged
        </div>
      )}
    </div>
  );
}

/* ── ato 04 · o painel, réplica da seção 03 ──────────────────────────────── */

const AGENTE_COR = "#8A6EFF";
const GRADE = "168px minmax(0,1fr) 64px";

function MiniBarras({
  titulo,
  linhas,
  borda,
}: {
  titulo: string;
  linhas: { n: string; v: string; fr: number; c: string; q?: boolean }[];
  borda?: boolean;
}) {
  return (
    <div style={{ padding: "16px 22px", borderRight: borda ? `1px solid ${C.fio2}` : undefined }}>
      <Rotulo>{titulo}</Rotulo>
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 9 }}>
        {linhas.map((l) => (
          <div key={l.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 72, fontFamily: MONO, fontSize: 12, color: C.ink2 }}>{l.n}</span>
            <span
              style={{
                flex: 1,
                height: 5,
                borderRadius: 99,
                background: "rgba(255,255,255,.07)",
                overflow: "hidden",
              }}
            >
              <span
                style={{
                  display: "block",
                  height: "100%",
                  width: `${l.fr * 100}%`,
                  borderRadius: 99,
                  background: l.c,
                  opacity: l.q ? 1 : 0.55,
                }}
              />
            </span>
            <span
              style={{
                width: 48,
                textAlign: "right",
                fontFamily: MONO,
                fontSize: 12,
                color: C.ink3,
              }}
            >
              {l.v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AtoPainel({ f }: { f: number }) {
  const ap = (d: number, dur = 16) =>
    interpolate(f, [B.painel.ini + d, B.painel.ini + d + dur], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: MONO }}>
      {/* cabeçalho */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 20,
          borderBottom: `1px solid ${C.fio2}`,
          padding: "0 0 16px",
          opacity: ap(0),
        }}
      >
        <span style={{ fontFamily: SANS, fontSize: 19, fontWeight: 600, color: C.ink }}>
          {RUN_NOME}
        </span>
        <span style={{ fontSize: 13, color: C.ink3 }}>
          #{ATUAL.id} · {RESUMO.quando}
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 24 }}>
          {(
            [
              ["cost", RESUMO.custoFmt, C.mint],
              ["time", RESUMO.duracao, C.ink],
              ["turns", String(RESUMO.turns), C.ink],
            ] as const
          ).map(([k, v, cor]) => (
            <span key={k} style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: ".18em",
                  textTransform: "uppercase",
                  color: C.ink3,
                }}
              >
                {k}
              </span>
              <span style={{ fontSize: 16, color: cor }}>{v}</span>
            </span>
          ))}
        </span>
      </div>

      {/* legenda + eixo */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: GRADE,
          gap: 14,
          alignItems: "center",
          padding: "10px 0",
          opacity: ap(8),
        }}
      >
        <span style={{ display: "flex", gap: 14 }}>
          {(
            [
              ["agent", AGENTE_COR, 1],
              ["tool", C.carmim, 0.5],
              ["loop", C.carmim, 1],
            ] as const
          ).map(([n, c, o]) => (
            <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <i
                style={{
                  display: "block",
                  height: 9,
                  width: 3,
                  borderRadius: 99,
                  background: c,
                  opacity: o,
                }}
              />
              <span
                style={{
                  fontSize: 8.5,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  color: C.ink3,
                }}
              >
                {n}
              </span>
            </span>
          ))}
        </span>
        <span style={{ position: "relative", height: 14 }}>
          {EIXO.map((s) => (
            <span
              key={s}
              style={{
                position: "absolute",
                top: 0,
                left: `${(s / ATUAL.duracao) * 100}%`,
                fontSize: 10.5,
                color: C.ink3,
              }}
            >
              {s}s
            </span>
          ))}
        </span>
        <span />
      </div>

      {/* waterfall */}
      <div style={{ position: "relative", paddingTop: 4 }}>
        <span style={{ position: "absolute", top: 0, bottom: 0, left: 168 + 14, right: 64 + 14 }}>
          {EIXO.map((s) => (
            <span
              key={s}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 1,
                left: `${(s / ATUAL.duracao) * 100}%`,
                background: "rgba(255,255,255,.05)",
              }}
            />
          ))}
        </span>
        {ATUAL.spans.map((s, i) => {
          const a = ap(14 + i * 4, 14);
          const cor = s.tipo === "agent" ? AGENTE_COR : C.carmim;
          const op = s.quente || s.tipo === "agent" ? 1 : 0.5;
          const pulso = s.quente ? 0.72 + 0.28 * Math.sin(((f - B.painel.ini) / DEMO_FPS) * 2.6) : 1;
          return (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: GRADE,
                gap: 14,
                alignItems: "center",
                height: 29,
                opacity: a,
              }}
            >
              <span
                style={{
                  paddingLeft: s.nivel * 15,
                  fontSize: 12.5,
                  color: s.quente ? C.carmim : s.tipo === "agent" ? C.ink : C.ink2,
                  whiteSpace: "nowrap",
                }}
              >
                {s.nome}
              </span>
              <span style={{ position: "relative", display: "block", height: 12 }}>
                <span
                  style={{
                    position: "absolute",
                    left: `${(s.ini / ATUAL.duracao) * 100}%`,
                    width: `${Math.max(1.2, (s.dur / ATUAL.duracao) * 100) * a}%`,
                    height: "100%",
                    borderRadius: 3,
                    background: cor,
                    opacity: op * pulso,
                    boxShadow: s.quente ? `0 0 18px -3px ${C.carmim}` : undefined,
                  }}
                />
              </span>
              <span style={{ fontSize: 12, textAlign: "right", color: C.ink3 }}>
                ${s.custo.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* detalhe do span quente */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          marginTop: 10,
          borderTop: `1px solid ${C.fio2}`,
          borderBottom: `1px solid ${C.fio2}`,
          background: "rgba(0,0,0,.2)",
          padding: "11px 0",
          opacity: ap(66),
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{SPAN_QUENTE.nome}</span>
        <span
          style={{ fontSize: 8.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.ink3 }}
        >
          {SPAN_QUENTE.tipo}
        </span>
        <span style={{ fontSize: 12.5, color: C.ink2 }}>
          {SPAN_QUENTE.ini.toFixed(1)}s → {(SPAN_QUENTE.ini + SPAN_QUENTE.dur).toFixed(1)}s
        </span>
        <span style={{ fontSize: 12.5, color: C.mint }}>${SPAN_QUENTE.custo.toFixed(4)}</span>
        <span style={{ fontSize: 12.5, color: C.carmim }}>{SPAN_QUENTE.nota}</span>
      </div>

      {/* três mini-gráficos */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", opacity: ap(76) }}
      >
        <MiniBarras
          titulo="cost by agent"
          borda
          linhas={AGENTES.map((a) => ({
            n: a.nome,
            v: `$${a.v.toFixed(2)}`,
            fr: a.v / MAX_AG,
            c: AGENTE_COR,
            q: a.quente,
          }))}
        />
        <MiniBarras
          titulo="tool calls"
          borda
          linhas={TOOLS.map((x) => ({
            n: x.nome,
            v: `×${x.v}`,
            fr: x.v / MAX_TOOL,
            c: C.carmim,
            q: x.quente,
          }))}
        />
        <div style={{ padding: "16px 22px" }}>
          <Rotulo>tokens</Rotulo>
          <div
            style={{
              marginTop: 12,
              display: "flex",
              height: 7,
              gap: 2,
              borderRadius: 99,
              overflow: "hidden",
            }}
          >
            {TOK.map((t) => (
              <span
                key={t.nome}
                style={{ width: `${(t.v / TOTAL_TOK) * 100}%`, background: t.cor, borderRadius: 99 }}
              />
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {TOK.map((t) => (
              <div key={t.nome} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.ink3 }}>
                  <i
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 7,
                      borderRadius: 2,
                      background: t.cor,
                      marginRight: 7,
                    }}
                  />
                  {t.nome}
                </span>
                <span style={{ fontSize: 12, color: C.ink2 }}>{N(t.v)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── cartela · a tipografia cinética ─────────────────────────────────────── */

/**
 * Cada palavra sobe de dentro de uma máscara, escalonada em 4 quadros.
 *
 * A máscara é `overflow: hidden` no wrapper e `translateY` no span de dentro —
 * nunca `scale`, que promoveria camada e borraria o glifo. É o gesto mais
 * velho do motion design e continua sendo o melhor: o texto não aparece, ele
 * CHEGA, e a defasagem entre as palavras força a leitura na ordem certa em vez
 * de deixar o olho pousar no meio da frase.
 */
function Frase({
  f,
  cena,
  linhas,
  corpo = 74,
}: {
  f: number;
  cena: Beat;
  linhas: { txt: string; cor?: string }[][];
  corpo?: number;
}) {
  const sai = interpolate(f, [cena.fim - 14, cena.fim], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });
  let k = 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        opacity: 1 - sai,
        transform: `translateY(${Math.round(-sai * 26)}px)`,
      }}
    >
      {linhas.map((linha, li) => (
        <div key={li} style={{ display: "flex", gap: Math.round(corpo * 0.22) }}>
          {linha.map((p, pi) => {
            /* 6 quadros de defasagem entre palavras (era 4) e 26 pra cada
               uma subir (era 20). Com a cartela durando 54 quadros em vez de
               34, a frase agora fica PARADA por quase um segundo depois de
               montada — que é o tempo de ler, e era o que faltava. */
            const atraso = cena.ini + 6 + k * 5;
            k += 1;
            const sobe = interpolate(f, [atraso, atraso + 22], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            });
            return (
              <span
                key={pi}
                style={{ display: "block", overflow: "hidden", paddingBottom: Math.round(corpo * 0.14) }}
              >
                <span
                  style={{
                    display: "block",
                    fontFamily: SANS,
                    fontSize: corpo,
                    fontWeight: 600,
                    letterSpacing: "-.035em",
                    lineHeight: 1.06,
                    color: p.cor ?? C.ink,
                    /* ── POR QUE O TEXTO TREMIA ──────────────────────────
                       O deslocamento era `translateY(112%)` — percentual da
                       própria altura, que dá um número FRACIONÁRIO de pixels
                       diferente a cada quadro. O navegador re-antialiasa o
                       glifo em cada posição subpixel, e o resultado é a borda
                       das letras cintilando enquanto sobem.

                       Em PIXEL INTEIRO o raster é idêntico quadro a quadro,
                       só transladado. A subida fica levemente mais "em
                       degraus" e absolutamente estável — que é a troca certa
                       para texto. */
                    transform: `translateY(${Math.round(sobe * corpo * 1.16)}px)`,
                  }}
                >
                  {p.txt}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── a moldura · a janela FLUTUA, com preto em volta ─────────────────────── */

function Moldura({
  f,
  cena,
  titulo,
  selo,
  w,
  h,
  children,
}: {
  f: number;
  cena: Beat;
  titulo: string;
  selo?: boolean;
  w: number;
  h: number;
  children: React.ReactNode;
}) {
  const entra = interpolate(f, [cena.ini, cena.ini + 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });
  const sai = interpolate(f, [cena.fim - 18, cena.fim], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: (DEMO_W - w) / 2,
        top: (DEMO_H - h) / 2,
        width: w,
        height: h,
        opacity: entra * (1 - sai),
        transform: `translateY(${Math.round((1 - entra) * 30 - sai * 24)}px)`,
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
        background: C.painel,
        border: `1px solid ${C.fio}`,
        /* Três sombras: contato curto que desenha a aresta, projeção média
           que separa do fundo, e uma muito larga e escura que é a "mancha no
           chão". A terceira é a que faz a janela parecer pesada. */
        boxShadow:
          "0 2px 6px rgba(0,0,0,.6), 0 18px 48px -12px rgba(0,0,0,.8), 0 90px 170px -50px rgba(0,0,0,1)",
      }}
    >
      <div
        style={{
          height: CHROME,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 13,
          padding: "0 18px",
          borderBottom: `1px solid ${C.fio2}`,
          position: "relative",
        }}
      >
        <span style={{ display: "flex", gap: 7 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <i
              key={c}
              style={{
                display: "block",
                width: 10,
                height: 10,
                borderRadius: 99,
                background: c,
                opacity: 0.8,
              }}
            />
          ))}
        </span>
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: 12.5,
            color: C.ink3,
          }}
        >
          {titulo}
        </span>
        {selo && (
          <span
            style={{
              marginLeft: "auto",
              zIndex: 1,
              fontSize: 10,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: C.ink,
              border: "1px solid rgba(138,110,255,.5)",
              background: "rgba(138,110,255,.2)",
              borderRadius: 99,
              padding: "3px 11px",
            }}
          >
            0.1 preview
          </span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
}

/* ── o fundo ──────────────────────────────────────────────────────────────
   Declarado FORA do componente, então o elemento é criado uma vez e o React
   nunca reconcilia estas três camadas. São nós estáticos que estavam sendo
   reconstruídos 30 vezes por segundo junto com todo o resto — e gradiente com
   quatro paradas é justamente o tipo de estilo caro de reaplicar. */
const FUNDO = (
  <>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(96% 62% at 50% -14%, rgba(138,110,255,.26), transparent 64%)",
      }}
    />
    <AbsoluteFill
      style={{
        background: "radial-gradient(52% 26% at 50% 112%, rgba(4,3,10,.55), transparent 72%)",
      }}
    />
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(104% 88% at 50% 42%, transparent 54%, rgba(5,3,12,.40) 100%)",
      }}
    />
  </>
);

/* ── o filme ─────────────────────────────────────────────────────────────── */

export const SpanixDemo: React.FC = () => {
  const f = useCurrentFrame();
  /* Folga de 12 e não 24: durante uma cartela, dois beats vizinhos ficavam
     montados ao mesmo tempo, e cada um deles é uma árvore grande. Metade da
     folga é metade do trabalho por quadro nas transições. */
  const dentro = (c: Beat, folga = 12) => f > c.ini - folga && f < c.fim + folga;

  const fechoEntra = interpolate(f, [CENAS.fecho.ini, CENAS.fecho.ini + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: SUAVE,
  });

  return (
    <AbsoluteFill style={{ background: C.fundo, fontFamily: MONO, overflow: "hidden" }}>
      {/* ── O FUNDO EM TRÊS CAMADAS ────────────────────────────────────────
          Uma mancha só não dá profundidade: fundo iluminado por igual lê como
          papel de parede. O que cria volume é a diferença de luminância entre
          o meio e as bordas, e é preciso as três camadas juntas.

            1. LUZ ALTA, atrás e acima. É a fonte, e é ela que faz a aresta
               superior das janelas existir.
            2. POÇO DE SOMBRA no chão, logo abaixo do centro. Sem ele a janela
               flutua no vácuo; com ele ela está POUSADA em alguma coisa, e é
               esse contato que o olho lê como profundidade.
            3. VINHETA fechando as quatro quinas. Canto fechado é o que
               transforma mancha em volume — é o mesmo princípio de um softbox
               apontado pro meio do cenário. */}
{FUNDO}

      {/* ── cartela 1 · o problema ─────────────────────────────────────── */}
      {dentro(CENAS.cartela1, 4) && (
        <Frase
          f={f}
          cena={CENAS.cartela1}
          corpo={84}
          linhas={[
            [{ txt: "Four" }, { txt: "agents" }, { txt: "running." }],
            [{ txt: "Zero" }, { txt: "visibility.", cor: C.carmim }],
          ]}
        />
      )}

      {/* ── beat 1 · a instalação ──────────────────────────────────────── */}
      {dentro(CENAS.beat1) && (
        <Moldura f={f} cena={CENAS.beat1} titulo="zsh · ~/research" w={1160} h={452}>
          <div style={{ padding: "32px 40px" }}>
            <AtoInstall f={f} />
          </div>
        </Moldura>
      )}

      {dentro(CENAS.cartela2, 4) && (
        <Frase
          f={f}
          cena={CENAS.cartela2}
          linhas={[[{ txt: "One" }, { txt: "line", cor: C.mint }, { txt: "around" }, { txt: "it." }]]}
        />
      )}

      {/* ── beat 2 · o código ──────────────────────────────────────────── */}
      {dentro(CENAS.beat2) && (
        <Moldura f={f} cena={CENAS.beat2} titulo="research_agent.py" w={1060} h={468}>
          <div style={{ padding: "30px 40px" }}>
            <AtoWrap f={f} />
          </div>
        </Moldura>
      )}

      {dentro(CENAS.cartela3, 4) && (
        <Frase
          f={f}
          cena={CENAS.cartela3}
          linhas={[[{ txt: "One" }, { txt: "command." }, { txt: "The" }, { txt: "bill.", cor: C.mint }]]}
        />
      )}

      {/* ── beat 3 · roda, imprime, aponta ─────────────────────────────── */}
      {dentro(CENAS.beat3) && (
        <Moldura f={f} cena={CENAS.beat3} titulo="zsh · ~/research" w={1180} h={634}>
          <div style={{ padding: "30px 40px" }}>
            <AtoRun f={f} />
          </div>
        </Moldura>
      )}

      {dentro(CENAS.cartela4, 4) && (
        <Frase
          f={f}
          cena={CENAS.cartela4}
          corpo={68}
          linhas={[
            [{ txt: "The" }, { txt: "whole" }, { txt: "run," }, { txt: "priced.", cor: C.violClaro }],
          ]}
        />
      )}

      {/* ── beat 4 · o painel ──────────────────────────────────────────── */}
      {dentro(CENAS.beat4) && (
        <Moldura f={f} cena={CENAS.beat4} titulo="localhost:7788/runs/482" selo w={1448} h={716}>
          <div style={{ padding: "22px 28px", height: "100%" }}>
            <AtoPainel f={f} />
          </div>
        </Moldura>
      )}

      {/* ── fecho ──────────────────────────────────────────────────────── */}
      {f > CENAS.fecho.ini - 4 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 28,
            opacity: fechoEntra,
            transform: `translateY(${(1 - fechoEntra) * 22}px)`,
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: "-.04em",
              color: C.ink,
            }}
          >
            spanix<span style={{ color: C.viol }}>.</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: `1px solid ${C.fio}`,
              background: "rgba(255,255,255,.04)",
              borderRadius: 12,
              padding: "16px 28px",
              fontSize: 23,
              color: C.ink,
            }}
          >
            <span style={{ color: C.ink3 }}>$</span>
            pip install spanix
          </div>
          <div style={{ fontSize: 15, letterSpacing: ".07em", color: C.ink3 }}>
            open source · apache-2.0 · nothing leaves your machine
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

"use client";

import { useCallback, useState } from "react";
import { ATUALIZADO, INSTALACOES, PAISES, PLATAFORMAS, REQUISICOES } from "./downloads";
import Globe from "./globe";
import { useTxt } from "./i18n";
import { COR, Marca } from "./marca";
import Reveal from "./reveal";

/**
 * Seção 06 · alcance.
 *
 * O QUE ELA MOSTRA, em uma frase: os downloads da biblioteca, no mundo.
 *
 * ── O PARADOXO DA TELEMETRIA, e a blindagem ───────────────────────────────
 * A página inteira jura "nothing leaves your machine" — e esta seção mostra
 * países, sistemas operacionais e AWS. Para um leitor de segurança, o alarme
 * é imediato: "eles estão rastreando minha máquina?". A nota de rodapé
 * explicava a fonte, mas nota pequena no fim da tela não desarma percepção —
 * e percepção, em segurança, é realidade: bastaria UM dev entender errado
 * pra virar thread de spyware no HackerNews.
 *
 * A blindagem é um selo GRANDE, logo sob a manchete, dito na ordem certa:
 * "Spanix is blind. PyPI is not." — o pacote não tem um byte de telemetria;
 * estes números são os logs públicos de download da PyPI, lidos DE FORA.
 * Bem feito, o que era objeção vira reforço da tese: um projeto que avisa
 * até de onde vem o dado da própria página é um projeto obcecado com isso.
 *
 * A VERSÃO ANTERIOR ERRAVA POR EXCESSO. Ela trazia três números disputando o
 * topo — 221 downloads, 6 países, 50 instalações atribuídas — e um parágrafo
 * de rodapé explicando por que os dois primeiros não fechavam com o terceiro.
 * Tudo verdade, e tudo junto virava uma aula de metodologia no lugar de um
 * fato. Quem chega aqui quer saber se a coisa é usada, não como a PyPI conta.
 *
 * A CAUSA DA CONFUSÃO ERA ARITMÉTICA, e a solução foi trocar a unidade. O
 * total é 221; a soma dos países é 50, porque a consulta filtra `pip` com país
 * conhecido. Com CONTAGEM em cada país, a conta não fecha na cara do leitor e
 * exige explicação. Com PERCENTUAL, não existe conta pra fechar: o mapa passa
 * a responder "de onde vêm", que é a única pergunta que um mapa faz. O
 * parágrafo virou uma linha de fonte.
 *
 * AS CORES desta seção:
 *   mint      o número grande e a sombra verde atrás do globo — a cor
 *             exclusiva daqui, aparecendo no fato e na atmosfera dele.
 *   carmim     o movimento: arcos, pulsos, origem, barras, país apontado.
 *   violeta   o corpo do planeta, a aurora ao redor dele (a mesma da hero)
 *             e a costura no topo.
 *   branco    a costa, os pontos, o texto.
 */

/* Valor literal porque o canvas não resolve variável de CSS. */
const CARMIM = "#FF2D55";
/* mesmo literal do `--color-mint`: os feixes do globo e o contador de países
   usam a cor do alcance; o carmim fica reservado pra interação. */
const MINT = "#3dffc4";

/* Nomes de plataforma (macOS, Ubuntu, Windows, AWS) e códigos de país não
   traduzem: são marcas e padrões. Os NOMES DOS PAÍSES traduzem, porque são
   prosa e ficariam estranhos em inglês numa página em português. */
const T = {
  en: {
    olho: "the reach",
    h2: "Installed, worldwide.",
    seloForte: "Spanix is blind. PyPI is not.",
    selo: "The package contains zero telemetry. These numbers are PyPI’s own public download logs, read from the outside. Nothing on this page came from your machine, or ever will.",
    sub: "Two releases, live since August 11, nothing posted anywhere yet. Half of it on developer laptops, and part of it already inside AWS datacenters.",
    installs: "installs",
    paises: "countries",
    rodando: "running on",
    fonteA: "PyPI logged",
    fonteB: "requests for the package in this window;",
    fonteC: "of them came from",
    fonteD: "or",
    fonteE: ". The rest are mirrors, scanners and browsers. That is the traffic every new package gets for free, and the reason this section counts installs instead of downloads.",
    dica: "6 countries · 50 attributed installs",
    nomes: {
      US: "United States", SG: "Singapore", BR: "Brazil",
      JP: "Japan", FR: "France", GB: "United Kingdom",
    } as Record<string, string>,
  },
  pt: {
    olho: "o alcance",
    h2: "Instalado, mundo afora.",
    seloForte: "O spanix é cego. O PyPI não.",
    selo: "O pacote não tem um byte de telemetria. Estes números são os logs públicos de download do próprio PyPI, lidos de fora. Nada nesta página veio da sua máquina, nem vai vir.",
    sub: "Duas versões, no ar desde 11 de agosto, sem divulgação em lugar nenhum. Metade em laptop de desenvolvedor, e parte já dentro de datacenter da AWS.",
    installs: "instalações",
    paises: "países",
    rodando: "rodando em",
    fonteA: "O PyPI registrou",
    fonteB: "requisições do pacote nesta janela;",
    fonteC: "delas vieram de",
    fonteD: "ou",
    fonteE: ". O resto são espelhos, robôs e navegadores. É o tráfego que todo pacote novo ganha de graça, e o motivo de esta seção contar instalações em vez de downloads.",
    dica: "6 países · 50 instalações atribuídas",
    nomes: {
      US: "Estados Unidos", SG: "Singapura", BR: "Brasil",
      JP: "Japão", FR: "França", GB: "Reino Unido",
    } as Record<string, string>,
  },
};

export function ReachSection() {
  const t = useTxt(T);
  const [ativo, setAtivo] = useState<string | null>(null);
  /* estável: o globo tem isto como dependência do efeito, e uma função nova a
     cada render remontaria o canvas a cada movimento do mouse */
  const apontar = useCallback((cc: string | null) => setAtivo(cc), []);
  const maior = PAISES[0]?.pct ?? 1;

  return (
    <section id="reach" className="relative">
      <span
        aria-hidden="true"
        className="absolute top-0 right-[14%] left-[14%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.45),transparent)",
        }}
      />

      <div className="relative mx-auto w-full max-w-[1240px] px-6 py-[clamp(76px,10vh,116px)] lg:px-10">
        <div className="grid items-center gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)]">
          <Reveal>
            <span className="olho">
              <i aria-hidden="true" />
              {t.olho}
            </span>
            <h2 className="h-secao mt-3.5 max-w-[16ch]">{t.h2}</h2>

            {/* o selo anti-spyware — mint porque é uma GARANTIA, a mesma
                família do "open source · apache-2.0" da hero */}
            <div className="mt-4 flex max-w-[52ch] items-start gap-3 rounded-[10px] border border-[rgba(var(--mint-rgb),.32)] bg-[rgba(var(--mint-rgb),.07)] px-4 py-3">
              <svg
                viewBox="0 0 16 16"
                aria-hidden="true"
                className="mt-[2px] size-[15px] shrink-0"
                fill="none"
                stroke="var(--color-mint)"
                strokeWidth="1.4"
                strokeLinecap="round"
              >
                {/* olho cortado: nós não vemos você */}
                <path d="M1.8 8s2.3-4 6.2-4c1 0 1.9.26 2.7.65M14.2 8s-2.3 4-6.2 4c-1 0-1.9-.26-2.7-.65" />
                <circle cx="8" cy="8" r="1.7" />
                <path d="M2.5 13.5 13.5 2.5" />
              </svg>
              <p className="text-[13px] leading-[1.62] text-ink-2">
                <span className="font-semibold text-ink">{t.seloForte}</span> {t.selo}
              </p>
            </div>
            {/* A frase diz o que a consulta por sistema mediu: metade em
                macOS (laptop de dev, `details.ci` nulo em tudo) e o Amazon
                Linux entregando a AWS com nome — o destaque de datacenter
                fica com o fecho. */}
            <p className="mt-3.5 max-w-[46ch] text-[15px] leading-[1.7] font-[450] text-ink-2">
              {t.sub}
            </p>

            {/* UM número grande, e ele é o que você pediu: downloads. Sai da
                constante pra não envelhecer escrito à mão. */}
            <div className="mt-8 flex items-end gap-10">
              <span className="flex flex-col">
                <span
                  className="font-jet text-[clamp(40px,5.2vw,60px)] leading-none font-bold tracking-[-.02em]"
                  /* ── POR QUE ELE ESTAVA AMADOR ──────────────────────────
                     Três coisas somadas, e a fonte era a maior delas.

                     1. ERA O ÚNICO NÚMERO EM SORA. A página inteira fala uma
                        língua numérica só: JetBrains Mono. $0.65, 22.6s,
                        118,195, #482, 56%, os contadores dos chips — tudo
                        mono. O 66 era o único algarismo em display sans, o
                        que o fazia parecer colado de outro site.

                     2. DEGRADÊ DENTRO DO GLIFO + BRILHO. Número lustroso com
                        halo é assinatura de template dos anos 2010. Nenhuma
                        página que a gente admira faz isso: elas confiam em
                        tipografia e param.

                     3. TRACKING DE -.04em EM DOIS SEISES. Sora já tem
                        sidebearing curto nos algarismos; a essa medida os
                        dois glifos quase encostavam e o par lia como borrão.

                     A CORREÇÃO NÃO É MAIS EFEITO, É OUTRA COR. Violeta legível
                     sobre preto é um violeta MÉDIO, e foi por isso que ele
                     parecia escuro desde o começo — eu vinha tentando acender
                     um tom que já nascia apagado. Um violeta CLARO e chapado
                     resolve por luminância, sem nada por cima. Sobra um único
                     drop-shadow largo e fraco, que não lê como brilho: lê
                     como o ar do fundo continuando atrás do número. */
                  style={{
                    color: "#C1AEFF",
                    filter: "drop-shadow(0 0 44px rgba(138,110,255,.45))",
                  }}
                >
                  {INSTALACOES}
                </span>
                <span className="mt-2.5 font-mono text-[9.5px] tracking-[.2em] uppercase text-ink-3">
                  {t.installs} · {ATUALIZADO}
                </span>
              </span>
              {/* mint, a mesma cor dos feixes: o contador de países e as
                  rotas que os ligam são o mesmo fato dito duas vezes */}
              <span className="flex flex-col">
                {/* IRMÃO DO 66, não primo distante: mesma família, mesmo
                    peso, mesmo tratamento. Só o corpo e o matiz mudam — que é
                    exatamente a hierarquia que a gente quer que seja lida. */}
                <span
                  className="font-jet text-[clamp(24px,3vw,32px)] leading-none font-bold tracking-[-.02em]"
                  style={{ color: MINT }}
                >
                  {PAISES.length}
                </span>
                <span className="mt-2.5 font-mono text-[9.5px] tracking-[.2em] uppercase text-ink-3">
                  {t.paises}
                </span>
              </span>
            </div>

            {/* ── onde ele roda ──
                Cada chip leva o GLIFO OFICIAL da plataforma (simple-icons,
                mesmo critério da faixa works-with da hero): a marca é
                reconhecida antes de o nome ser lido, e é isso que faz a
                fileira contar a história num relance — Apple e Ubuntu
                grandes, a AWS no meio, um Raspberry Pi no fim. */}
            {/* O rótulo existe porque os chips sozinhos não se explicavam —
                nem pro dono do site. Se o dono pergunta "por que tem AWS
                aqui?", o visitante também pergunta. */}
            <span className="mt-7 block font-mono text-[9px] tracking-[.22em] uppercase text-ink-3">
              {t.rodando}
            </span>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {PLATAFORMAS.map((pl) => (
                <span
                  key={pl.nome}
                  /* O chip da AWS acende no laranja oficial — e APONTA: passar
                     o mouse nele seleciona os EUA no globo e na lista, porque
                     a query cruzada confirmou que os 8 installs de Amazon
                     Linux vieram todos de lá. O chip deixa de ser rótulo e
                     vira a terceira ponta da mesma interação. */
                  onMouseEnter={pl.destaque ? () => setAtivo("US") : undefined}
                  onMouseLeave={pl.destaque ? () => setAtivo(null) : undefined}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-[5px]"
                  style={
                    pl.destaque
                      ? {
                          borderColor: "rgba(255,45,85,.5)",
                          background: "rgba(255,45,85,.1)",
                          boxShadow: "0 0 14px -4px rgba(255,45,85,.55)",
                        }
                      : { borderColor: "rgba(255,255,255,.1)", background: "rgba(255,255,255,.04)" }
                  }
                >
                  {pl.marca && (
                    <Marca
                      nome={pl.marca}
                      className="size-[12px] shrink-0"
                      style={{ color: COR[pl.marca] }}
                    />
                  )}
                  <span className={`text-[11.5px] ${pl.destaque ? "text-ink" : "text-ink-2"}`}>
                    {pl.nome}
                  </span>
                  <span className="font-jet text-[10.5px] text-ink-3 tabular-nums">{pl.n}</span>
                </span>
              ))}
            </div>

            <ul className="mt-7 flex max-w-[420px] flex-col" onMouseLeave={() => setAtivo(null)}>
              {PAISES.map((p, i) => {
                const on = ativo === p.cc;
                return (
                  <li key={p.cc}>
                    <button
                      type="button"
                      onMouseEnter={() => setAtivo(p.cc)}
                      onFocus={() => setAtivo(p.cc)}
                      aria-current={on || undefined}
                      className={`flex w-full items-center gap-3 rounded-md px-2 py-[7px] text-left transition-colors ${
                        i ? "border-t border-white/8" : ""
                      } ${on ? "bg-white/[.05]" : "hover:bg-white/[.03]"}`}
                    >
                      <span
                        className="w-[26px] shrink-0 font-jet text-[10.5px] transition-colors"
                        style={{ color: on || p.cc === "BR" ? CARMIM : "var(--color-ink-3)" }}
                      >
                        {p.cc}
                      </span>
                      <span
                        className={`flex min-w-0 flex-1 items-center gap-2 truncate text-[12.5px] transition-colors ${on ? "text-ink" : "text-ink-2"}`}
                      >
                        {t.nomes[p.cc] ?? p.nome}
                        {/* a marca da AWS mora na linha do país onde os
                            installs dela de fato estão — medido, não suposto */}
                        {p.aws && (
                          <Marca
                            nome="aws"
                            className="size-[11px] shrink-0"
                            style={{ color: COR.aws, opacity: on ? 1 : 0.75 }}
                          />
                        )}
                      </span>
                      {/* +1px de altura: numa barra de 4px o violeta não tem
                          área pra acender. O `overflow-hidden` saiu do trilho
                          porque ele ceifava o brilho no próprio contorno. */}
                      <span className="relative h-[5px] w-[92px] shrink-0 rounded-full bg-white/8">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full transition-all"
                          /* ULTRAVIOLETA ACESO. O #8A6EFF puro é escuro demais
                             pra uma faixa de 5px: some no fundo. A barra vira
                             um degradê que sobe pro lilás claro na ponta, com
                             halo próprio — o mesmo truque do 66, em escala de
                             barra. Repouso a 0.85, não 0.6, porque a página
                             passa a maior parte do tempo parada. */
                          style={{
                            width: `${(p.pct / maior) * 100}%`,
                            background: "linear-gradient(90deg,#7B5CFF,#A488FF 62%,#C3B0FF)",
                            boxShadow: on
                              ? "0 0 10px rgba(var(--viol-rgb),.85), 0 0 3px rgba(195,176,255,.9)"
                              : "0 0 7px rgba(var(--viol-rgb),.6)",
                            opacity: on ? 1 : 0.85,
                          }}
                        />
                      </span>
                      <span
                        className={`w-[34px] shrink-0 text-right font-jet text-[10.5px] tabular-nums ${on ? "text-ink" : "text-ink-3"}`}
                      >
                        {p.pct}%
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Uma linha, no lugar do parágrafo. Diz de onde vem cada metade
                do dado e para. */}
            <p className="mt-6 max-w-[52ch] text-[12px] leading-[1.6] text-ink-3">
              {t.fonteA} {REQUISICOES} {t.fonteB} {INSTALACOES} {t.fonteC}{" "}
              <span className="font-jet text-[11.5px] text-ink-2">pip</span> {t.fonteD}{" "}
              <span className="font-jet text-[11.5px] text-ink-2">uv</span>
              {t.fonteE}
            </p>
          </Reveal>

          <Reveal delay={90}>
            <div className="relative isolate aspect-square w-full">
              {/* ── a sombra atrás do globo ─────────────────────────────────
                  Duas camadas, porque "sombra" aqui são duas coisas:

                  1. um poço ESCURO logo atrás do disco — é ele que descola a
                     esfera do fundo da página; sem escuro atrás, corpo escuro
                     não tem contra o quê existir;
                  2. o brilho violeta por fora dele, mais largo e mais vivo
                     que antes (o .14 antigo era fraco demais pra se ver) — a
                     atmosfera que faz o planeta parecer aceso na cena.

                  A ordem importa: escuro por dentro, luz por fora. Invertido,
                  vira um eclipse. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10"
                style={{
                  background:
                    "radial-gradient(46% 46% at 50% 50%, rgba(3,2,8,.75), rgba(3,2,8,.35) 58%, transparent 70%)," +
                    "radial-gradient(72% 72% at 50% 52%, rgba(var(--viol-rgb),.24), transparent 74%)",
                }}
              />
              <Globe corAtiva={CARMIM} corRota={MINT} ativo={ativo} aoApontar={apontar} />
              {!ativo && (
                <span className="pointer-events-none absolute inset-x-0 bottom-1 text-center font-mono text-[9px] tracking-[.2em] lowercase text-ink-3">
                  {t.dica}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

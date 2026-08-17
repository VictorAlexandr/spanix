"use client";

import Aurora from "./aurora";
import { useLang, useTxt } from "./i18n";
import { LangToggle } from "./lang-toggle";
import { Install } from "./install";
import { COR, Marca } from "./marca";

/**
 * Hero · layout portado da lattis.
 *
 * Mesma anatomia: aurora em canvas, véu radial pra manter o texto legível,
 * nav em pílula flutuante, conteúdo centralizado, faixa de integrações e
 * pista de rolagem. O que muda é o conteúdo, porque o público aqui é dev:
 * o comando de instalação entra no lugar do botão de carteira, e a faixa
 * lista os orquestradores suportados em vez de fontes de dados.
 */

/* Um lugar só pra trocar quando o repo existir. */
const REPO = "https://github.com/VictorAlexandr/spanix";

/* Marca oficial do GitHub (octocat). Inline porque a lucide tirou os ícones
   de marca — e porque logo de terceiro tem que ser o path oficial, não uma
   aproximação desenhada à mão. */
function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

/* Dois destes apontavam pro vazio desde o começo: `#pricing` (a seção existe
   no repo mas não está no `page.tsx`) e `#docs` (nunca existiu). Link morto na
   nav é o tipo de coisa que custa mais confiança do que o item ganha.

   `The API` toma o lugar de Pricing enquanto ela estiver fora, e `Docs` passa
   a apontar pro README do repo — documentação de biblioteca mora no repo, e
   link externo honesto vale mais que âncora vazia. Devolver Pricing é uma
   linha aqui e uma no `page.tsx`. */
const LINKS = [
  { href: "#library", en: "The library", pt: "A biblioteca" },
  { href: "#panel", en: "The panel", pt: "O painel" },
  { href: "#guarantee", en: "The guarantee", pt: "A garantia" },
  { href: "#api", en: "The API", pt: "A API" },
];

/* Texto da hero nos dois idiomas, colado no arquivo que o desenha. O PT não é
   tradução literal: "Zero visibility" vira "Zero visibilidade" porque a
   manchete precisa da mesma batida curta, e frase publicitária traduzida ao pé
   da letra perde o ritmo antes de perder o sentido. */
const T = {
  en: {
    olho: "local profiler for ai agents",
    aberto: "open source",
    h1a: "Four agents running.",
    h1b: "Zero visibility.",
    sub: "One line around your agent. `spanix` prints the bill and opens the whole call tree on localhost, priced per node. Next week the same run costs three times as much, and the panel says which node moved.",
    subForte: "Nothing leaves your machine.",
    verPainel: "See the panel",
    docs: "Docs",
    funciona: "works with",
    pe: ["free forever, local", "no signup", "your prompts never leave"],
    rolar: "scroll",
  },
  pt: {
    olho: "profiler local para agentes de ia",
    aberto: "código aberto",
    h1a: "Quatro agentes rodando.",
    h1b: "Zero visibilidade.",
    sub: "Uma linha em volta do seu agente. `spanix` imprime a conta e abre a árvore de chamadas inteira no localhost, com preço em cada nó. Semana que vem a mesma execução custa três vezes mais, e o painel diz qual nó mudou.",
    subForte: "Nada sai da sua máquina.",
    verPainel: "Ver o painel",
    docs: "Docs",
    funciona: "funciona com",
    pe: ["grátis pra sempre, local", "sem cadastro", "seus prompts nunca saem"],
    rolar: "role",
  },
};

/* Lista de compatibilidade, não de providers: o que aparece aqui é quem
   decide a ordem dos nós. Cliente de API solto (openai, anthropic) não entra
   — o profiler não tem grafo pra desenhar em cima de uma chamada única. */
/* O SDK leva a marca da ANTHROPIC e o Claude Code leva a do CLAUDE: são
   glifos diferentes no simple-icons, e a distinção é factual — um é a
   biblioteca da empresa, o outro é o produto. Com a mesma marca nos dois,
   eles ficariam indistinguíveis lado a lado. */
const RUNTIMES = [
  { name: "Claude Agent SDK", marca: "anthropic" },
  { name: "Claude Code", marca: "claude" },
  { name: "CrewAI", marca: "crewai" },
  { name: "LangGraph", marca: "langchain" },
] as const;

export default function Hero() {
  const t = useTxt(T);
  const { lang } = useLang();

  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Céu, estrelas e cortinas vêm todos deste canvas — as estrelas ficam
          ENTRE o céu e a luz, que é o único jeito de a boreal passar por cima
          delas. O <Starfield /> separado saiu por isso. */}
      <Aurora />

      {/* VINHETA — é ela que dá profundidade, e ela mudou junto com a aurora.
          Antes estava centrada em 88% da altura e ainda por cima mascarada
          para valer só na faixa de 30–66%: sobrava uma sombra parcial que não
          fechava canto nenhum, e sem canto fechado não existe volume — luz
          espalhada uniformemente lê como papel de parede.

          Agora o centro claro acompanha o novo centro da aurora (50% 46%), o
          escuro vai até 0,94 nas quinas e não há máscara. Fechar as quatro
          quinas é o que transforma a mancha violeta em VOLUME: o olho lê
          profundidade por diferença de luminosidade entre centro e borda, e é
          o mesmo truque de um softbox apontado pro meio do cenário. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          /* VÉU CENTRAL — e aqui estava o meu erro de fundo, não de ajuste.
             Eu vinha construindo VINHETA: claro no meio, escuro nas bordas. A
             referência faz o OPOSTO — escurece o CENTRO, atrás do texto, e
             deixa a luz chegar acesa nas quatro bordas.

             A lógica é outra: vinheta serve pra dirigir o olho numa foto; aqui
             a boreal já é a imagem, e o que precisa de tratamento é a
             LEGIBILIDADE da manchete por cima dela. Escurecer o miolo devolve
             contraste ao texto sem apagar a atmosfera — e é exatamente por
             isso que na referência as laterais ficam violeta vivo enquanto o
             meio é mais fundo. Eu estava apagando a única parte que deveria
             brilhar. */
          background: "radial-gradient(58% 46% at 50% 50%, rgba(3,2,6,.5), transparent 72%)",
        }}
      />

      {/* ── A GRADE SAIU ──────────────────────────────────────────────
          Era um quadriculado de 72px a 3% de branco, mascarado num radial.
          O argumento era "peso de ferramenta vem de estrutura, não de cor" —
          e ele não se sustenta aqui por dois motivos.

          O primeiro é que a MESMA textura já foi rejeitada nesta página, na
          seção 2 ("os fundos da direita dos terminais estão com um efeito
          quadriculado, tire"). Manter na hero era aplicar dois critérios ao
          mesmo elemento.

          O segundo é que ela briga com o que está atrás. A aurora é feita de
          curvas e borrão de 68px; grade é a geometria mais dura que existe.
          Sobrepostas, a régua reta corta as cortinas e o olho lê retângulo em
          vez de céu — que é exatamente o oposto do que a boreal está tentando
          fazer. O "peso de instrumento" desta página vem do mono, da janela do
          painel e dos números, não de papel milimetrado no fundo. */}

      {/* Teto: bem mais leve que antes. A referência não tem nenhum — a nav
          dela se sustenta no próprio vidro (borda + blur). O nosso sobrou só
          como um respiro de 12vh a 55%, porque a nossa nav é mais larga e
          carrega um botão branco sólido. Mais que isso apagaria a banda fria
          que mora justo ali em cima. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[12vh]"
        style={{
          background: "linear-gradient(180deg, rgba(2,1,5,.55) 0%, transparent 100%)",
        }}
      />

      {/* nav pílula */}
      <div className="relative z-20 px-5 pt-[22px] lg:px-7">
        <nav className="mx-auto flex w-fit max-w-full items-center gap-1 rounded-full border border-(--hair) bg-(--glass) p-[5px] shadow-[0_12px_44px_rgba(0,0,0,.5)] backdrop-blur-xl">
          <a
            href="/"
            className="px-[21px] py-[5px] font-sora text-[17px] font-semibold tracking-[-.03em]"
          >
            spanix<i className="not-italic text-viol">.</i>
          </a>
          <div className="ml-16 hidden gap-[12px] min-[880px]:flex">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-[19px] py-[7px] text-[13.5px] text-ink-2 transition-colors hover:bg-white/7 hover:text-ink"
              >
                {lang === "pt" ? l.pt : l.en}
              </a>
            ))}
          </div>
          {/* O `Log in` saiu. Ele apontava pra `#pricing`, que não existe, e
              apontava pra um lugar que o produto não tem: a página inteira
              promete `no signup` três vezes, e um botão de entrar ao lado
              disso é a contradição mais visível que a nav podia carregar.
              No lugar entrou o link pra documentação, que é o que alguém
              procuraria ali de verdade. */}
          <a
            href={`${REPO}#readme`}
            target="_blank"
            rel="noreferrer"
            className="mr-1 hidden rounded-full px-[15px] py-[7px] text-[13.5px] text-ink-3 transition-colors hover:text-ink min-[880px]:block"
          >
            {t.docs}
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-[9px] rounded-full bg-white px-[23px] py-[7px] text-[13px] font-semibold text-[#0A0714] transition-all hover:bg-viol hover:text-[#06120E] hover:shadow-[0_6px_24px_rgba(var(--viol-rgb),.45)]"
          >
            <GithubMark className="size-[15px]" />
            GitHub
          </a>
          {/* A chave de idioma fica DEPOIS do GitHub, na ponta: é ajuste de
              preferência, não navegação, e ferramenta de ajuste mora na borda
              pra não disputar com o caminho principal. */}
          <LangToggle />
        </nav>
      </div>

      {/* conteúdo centralizado */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center justify-center px-5 pt-[clamp(36px,9vh,80px)] pb-[clamp(20px,3vh,48px)] text-center lg:px-7">
        <div className="flex flex-wrap items-center justify-center gap-[10px]">
          <span className="inline-flex items-center gap-[9px] rounded-[8px] border border-(--hair) bg-white/5 px-[15px] py-2 font-mono text-[10.5px] tracking-[.14em] lowercase text-ink-2">
            <span className="text-ink-3">◇</span> {t.olho}
          </span>
          {/* "open source" é a alegação, a licença é a prova — os dois, nessa
              ordem. Quando o repo abrir, a contagem de estrelas toma o lugar
              da licença aqui e ela desce pro rodapé. */}
          {/* Violeta fica no LED, na borda e no fundo — não no texto. Em mono
              de 10,5px com tracking, cor cromática perde contra branco quase
              puro: 15,7:1 contra os 7,2:1 do violeta cheio. */}
          {/* ── ERAM DOIS SELOS, VIRARAM UM ──────────────────────────────
              A fileira tinha três chips: categoria, licença e PyPI. Os dois
              últimos diziam a MESMA categoria de coisa — "isto é real e está
              publicado" — em duas caixas, com dois tratamentos de cor
              diferentes. Somando a nav, eram dez elementos antes da manchete,
              e três chips lado a lado leem como badge de README.

              Fundidos, sobram duas caixas com papéis distintos: uma diz O QUE
              É, a outra diz QUE EXISTE. E a credencial vira um link só, com a
              versão no fim, que é a parte que de fato compra confiança. */}
          <a
            href="https://pypi.org/project/spanix/"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-[8px] border border-[rgba(var(--ok-rgb),.42)] bg-[rgba(var(--ok-rgb),.13)] px-[15px] py-2 font-mono text-[10.5px] leading-none font-medium tracking-[.1em] text-ink transition-colors hover:border-[rgba(var(--ok-rgb),.7)]">
            <span className="pulse-dot h-[6px] w-[6px] shrink-0 rounded-full bg-ok shadow-[0_0_12px_var(--color-ok)]" />
            {t.aberto}
            <i className="not-italic text-[rgba(var(--ok-rgb),.55)]">·</i>
            <span className="text-ok">apache-2.0</span>
            <i className="not-italic text-[rgba(var(--ok-rgb),.55)]">·</i>
            <Marca nome="pypi" className="size-[12px] shrink-0" style={{ color: COR.pypi }} />
            <span className="sr-only">pypi</span>
            <span className="tabular-nums">v0.0.2</span>
            <svg
              viewBox="0 0 12 12"
              aria-hidden="true"
              className="size-[9px] shrink-0 text-ink-3 transition-transform duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px] motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3.4 8.6 8.6 3.4" />
              <path d="M4.4 3.4h4.2v4.2" />
            </svg>
          </a>
        </div>

        <h1
          className="mx-auto mt-[clamp(18px,3.4vh,34px)] max-w-[16ch] font-sora text-[clamp(40px,min(6.4vw,8.2vh),82px)] leading-[1.08] font-semibold tracking-[-.032em] text-white"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,.45), 0 5px 30px rgba(0,0,0,.55)",
            textWrap: "balance",
          }}
        >
          {t.h1a}{" "}
          <span
            /* MESMO DIAGNÓSTICO DO 66 DA SEÇÃO 06, e eu repeti o erro aqui.
               O `0 0 26px` era um halo CONCÊNTRICO: ele nasce na aresta do
               glifo e sangra pra fora, então a própria borda que deveria ficar
               nítida se dissolve no brilho. Em corpo de 82px isso lê como
               vidro embaçado.

               E o `#FF5C7A` era escuro demais pro vizinho. Ele senta ao lado
               de branco puro, e por contraste simultâneo qualquer meio-tom ao
               lado de branco parece apagado. Não adianta acender — tem que
               subir a luminância da cor.

               CLAREAR FOI O REMÉDIO ERRADO, e eu tentei duas vezes. `#FF5C7A`
               e depois `#FF8098` são o carmim com luminância alta — e subir
               luminância em vermelho DESSATURA: o tom escorrega pro salmão e
               perde exatamente a vivacidade que se queria. Foi o que aconteceu.

               O que faz uma cor parecer VIVA sobre fundo escuro é saturação,
               não claridade. Então a cor volta a ser o carmim de verdade da
               paleta, `#FF2D55`, o mesmo dos arcos do globo e das ferramentas
               no painel — e o problema de nitidez se resolve só com as sombras:

                 1. contato preto curto, o mesmo do texto branco ao lado, que
                    é o que descola a letra da aurora;
                 2. véu escuro largo, também igual ao do branco;
                 3. bloom carmim DESLOCADO 12px pra baixo — dá o brilho sem
                    encostar na aresta, que era o defeito do halo concêntrico. */
            style={{
              color: "#FF2D55",
              textShadow:
                "0 1px 2px rgba(0,0,0,.55), 0 2px 18px rgba(3,2,6,.7), 0 12px 34px rgba(255,45,85,.5)",
            }}
          >
            {t.h1b}
          </span>
        </h1>

        <p
          className="mx-auto mt-[clamp(14px,2.6vh,28px)] max-w-[58ch] text-[17px] leading-[1.8] font-[450] text-ink-2"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,.4), 0 2px 20px rgba(3,2,6,.85)",
          }}
        >
          {t.sub}{" "}
          <b className="font-semibold whitespace-nowrap text-white">{t.subForte}</b>
        </p>

        {/* items-start, não center: o chip da PyPI pendura embaixo do comando e
            os dois botões continuam alinhados pelo topo. Com items-center o
            "See the panel" centralizaria contra a coluna inteira e desceria. */}
        <div className="mt-[clamp(20px,4vh,40px)] flex flex-wrap items-start justify-center gap-[13px]">
          <Install cmd="pip install spanix" />
          <a
            href="#panel"
            className="group flex items-center gap-[10px] rounded-[10px] border border-white/18 px-7 py-[15px] text-[14.5px] font-semibold text-ink transition-all hover:-translate-y-[2px] hover:border-viol hover:text-viol motion-reduce:hover:translate-y-0"
          >
            {t.verPainel}
            {/* ── A TAG DE PROTEÇÃO ──────────────────────────────────────────
                A hero afirma que o spanix imprime a conta E abre a árvore no
                localhost. A primeira metade é 0.0.2; a segunda chega na 0.1.
                Quem instalar hoje esperando interface gráfica e não achar nada
                desinstala e não volta — dev tem tolerância zero com promessa
                não entregue, e não existe segunda chance de primeira impressão.

                A tag vai DENTRO do botão, não ao lado: é o botão que carrega a
                promessa do painel, então é ele que tem que carregar a data. E
                quem clicar chega numa janela que repete `0.1 preview` na barra
                de endereço — a expectativa é ajustada duas vezes antes de
                qualquer decisão de instalar.

                Texto branco, violeta na borda e no fundo: mesma construção dos
                outros dois selos, pela regra de que violeta em texto pequeno
                desaparece. */}
            <span className="shrink-0 rounded-full border border-[rgba(var(--viol-rgb),.5)] bg-[rgba(var(--viol-rgb),.2)] px-[8px] py-[2px] font-mono text-[9px] font-medium tracking-[.12em] text-ink uppercase">
              0.1
            </span>
            <span aria-hidden="true" className="font-mono">
              &rarr;
            </span>
          </a>
        </div>

        {/* faixa de compatibilidade: o que o dev checa antes de instalar */}
        <div className="relative mt-[clamp(20px,4.4vh,44px)] flex max-w-[720px] flex-col items-start gap-[10px] rounded-[12px] border border-(--hair) bg-[rgba(12,10,20,.62)] px-5 py-[13px] shadow-[0_18px_50px_rgba(0,0,0,.5)] backdrop-blur-lg min-[821px]:flex-row min-[821px]:items-center min-[821px]:gap-[14px]">
          <span
            aria-hidden="true"
            className="absolute top-0 right-[10%] left-[10%] h-px"
            style={{
              background:
                "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.45),transparent)",
            }}
          />
          <span className="shrink-0 font-mono text-[9.5px] tracking-[.18em] uppercase text-ink-3 min-[821px]:border-r min-[821px]:border-white/9 min-[821px]:pr-[14px]">
            {t.funciona}
          </span>
          <div className="flex flex-wrap items-center gap-[6px]">
            {RUNTIMES.map((s) => (
              <span
                key={s.name}
                className="inline-flex cursor-default items-center gap-[7px] rounded-[7px] border border-transparent px-[11px] py-[7px] font-mono text-[11.5px] text-ink-2 transition-all hover:border-white/14 hover:bg-white/4 hover:text-white"
              >
                <Marca nome={s.marca} className="size-[13px] shrink-0" style={{ color: COR[s.marca] }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-[clamp(14px,2.6vh,26px)] flex flex-wrap items-center justify-center gap-[14px] font-mono text-[10.5px] tracking-[.1em] lowercase text-ink [text-shadow:0_1px_3px_rgba(3,2,6,.95)]">
          {t.pe.map((p, i) => (
            <span key={p} className="contents">
              {i > 0 && <i className="text-[rgba(var(--viol-rgb),.55)] not-italic">·</i>}
              <span>{p}</span>
            </span>
          ))}
        </div>
      </div>

      {/* pista de rolagem */}
      <div className="relative z-10 pb-6 text-center font-mono text-[10.5px] tracking-[.2em] lowercase text-ink [text-shadow:0_1px_3px_rgba(3,2,6,.95)]">
        {t.rolar}
        <i
          className="mx-auto mt-2 block h-6 w-px"
          style={{ background: "linear-gradient(var(--color-viol),transparent)" }}
        />
      </div>

    </section>
  );
}

"use client";

import { useTxt } from "./i18n";

/**
 * Rodapé.
 *
 * Numa landing de open source o rodapé não é navegação — é PROCEDÊNCIA. Quem
 * chega no fim já decidiu se quer ou não; o que falta é conferir que a coisa
 * existe e que dá pra auditar. Por isso os cinco links são todos para fora e
 * todos verificáveis: código, histórico, pacote publicado, licença e o canal
 * onde se reclama. Nenhum link interno, nenhum menu.
 *
 * Sem coluna de "Produto / Empresa / Recursos": um projeto de uma pessoa com
 * uma 0.0.2 no ar que finge ter organograma perde mais confiança do que ganha.
 *
 * Escuro, como o resto da página. A única zona clara é a seção 03, e ela é
 * clara pra ser a quebra — se o rodapé também virasse, deixaria de ser quebra
 * e viraria alternância.
 */

const REPO = "https://github.com/VictorAlexandr/spanix";

const LINKS = [
  { href: REPO, label: "repo" },
  { href: `${REPO}/blob/main/CHANGELOG.md`, label: "changelog" },
  { href: "https://pypi.org/project/spanix/", label: "pypi" },
  { href: `${REPO}/blob/main/LICENSE`, label: "apache-2.0" },
  { href: `${REPO}/issues`, label: "issues" },
];

/* Os rótulos do rodapé são nomes de destino (repo, changelog, pypi, issues) e
   já são a mesma palavra nos dois idiomas — só `licença` muda. */
const T = {
  en: { promessa: "nothing leaves your machine", licenca: "apache-2.0" },
  pt: { promessa: "nada sai da sua máquina", licenca: "apache-2.0" },
};

export function Footer() {
  const t = useTxt(T);
  return (
    /* Sem fundo próprio: a vinheta da página atravessa até aqui embaixo. Cada
       seção pintando o seu preto era o que criava aquelas emendas de tom entre
       elas — duas superfícies encostadas sempre mostram a junta. */
    <footer className="relative border-t border-(--hair)">
      {/* Mesmo fio violeta que abre a faixa corrida, agora fechando a página.
          Primeira e última aresta iguais é o que faz a coisa ler como uma peça
          só, em vez de seções empilhadas. */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-[12%] left-[12%] h-px"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(var(--viol-rgb),.45),transparent)",
        }}
      />

      <div className="mx-auto w-full max-w-[1240px] px-6 py-[clamp(38px,6vh,60px)] lg:px-10">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <a href="/" className="font-sora text-[17px] font-semibold tracking-[-.03em] text-white">
            spanix<i className="not-italic text-viol">.</i>
          </a>

          <nav className="flex flex-wrap items-center gap-x-[18px] gap-y-2.5">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11.5px] lowercase text-ink-3 transition-colors hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <i aria-hidden="true" className="mt-7 block h-px bg-(--hair)" />

        <div className="mt-5 flex flex-col gap-2.5 font-mono text-[10.5px] tracking-[.1em] lowercase text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 victor fernandes · apache-2.0</span>
          {/* A última linha da página é a mesma promessa da hero: ela abre e
              fecha com a única coisa que o produto garante. */}
          <span className="inline-flex items-center gap-2 text-ink-2">
            <span className="pulse-dot h-[5px] w-[5px] rounded-full bg-ok shadow-[0_0_10px_var(--color-ok)]" />
            {t.promessa}
          </span>
        </div>
      </div>
    </footer>
  );
}

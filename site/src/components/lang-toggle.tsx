"use client";

import { useLang, type Lang } from "./i18n";

/**
 * Chave EN/PT da navbar.
 *
 * FORMA: dois rótulos, sem caixa. Começou como controle segmentado com pílula
 * e quadro deslizante — e ficou pesado demais no lugar onde mora: colado no
 * botão branco do GitHub, virava uma segunda cápsula competindo com ele, e o
 * topo já tinha elemento demais.
 *
 * A distinção que importa é estado + ação na mesma leitura, e isso não precisa
 * de moldura: o idioma ativo em BRANCO e o outro apagado dizem as duas coisas.
 * Um botão escrito só "PT" não diria — não dá pra saber se você ESTÁ em
 * português ou se aquilo te LEVA pro português.
 *
 * O separador é o mesmo `·` que a página usa em toda parte.
 */

const OPCOES: { id: Lang; rotulo: string; nome: string }[] = [
  { id: "en", rotulo: "EN", nome: "English" },
  { id: "pt", rotulo: "PT", nome: "Português" },
];

export function LangToggle() {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex shrink-0 items-center gap-[5px] pl-1 font-mono text-[10.5px] tracking-[.08em]"
    >
      {OPCOES.map((o, i) => (
        <span key={o.id} className="contents">
          {i > 0 && (
            <i aria-hidden="true" className="not-italic text-white/20">
              ·
            </i>
          )}
          <button
            type="button"
            onClick={() => setLang(o.id)}
            aria-pressed={lang === o.id}
            aria-label={o.nome}
            className={`transition-colors ${
              lang === o.id ? "text-white" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {o.rotulo}
          </button>
        </span>
      ))}
    </div>
  );
}

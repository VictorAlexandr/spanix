"use client";

import { createContext, useContext, useEffect, useState } from "react";

/**
 * Idioma da página · EN e PT.
 *
 * ── POR QUE CONTEXTO DE CLIENTE, E NÃO ROTA `/pt` ─────────────────────────
 * Rota separada é o caminho correto quando o objetivo é SEO: o Google indexa
 * duas URLs e serve cada uma pro seu público. Mas ela custa duplicar a árvore
 * de páginas e obriga um recarregamento a cada troca.
 *
 * Aqui o botão é conveniência, não canal de aquisição: 88% dos installs
 * medidos são de fora do Brasil (US 56%, SG 16%), então o inglês é e continua
 * sendo a página principal. O PT existe pra quem o autor manda o link
 * diretamente. Pra esse uso, troca instantânea sem recarregar vale mais que
 * indexação de uma segunda URL.
 *
 * Se um dia o PT virar canal de verdade, o caminho é `app/[lang]/page.tsx` —
 * e os dicionários já estarão prontos, porque eles vivem colados em cada
 * seção e não dependem deste arquivo.
 *
 * ── ONDE FICA O TEXTO ─────────────────────────────────────────────────────
 * NÃO existe dicionário central. Cada seção declara o próprio bloco:
 *
 *     const T = {
 *       en: { titulo: "Four names." },
 *       pt: { titulo: "Quatro nomes." },
 *     };
 *     const t = useTxt(T);
 *
 * Dicionário central obriga a saltar entre dois arquivos pra mexer numa
 * frase, e é assim que tradução envelhece: alguém edita o inglês no JSX e o
 * português fica pra trás sem ninguém notar. Colado, as duas versões estão à
 * vista uma da outra na mesma tela.
 *
 * ── O PISCA NA PRIMEIRA PINTURA ───────────────────────────────────────────
 * O servidor não sabe a preferência de quem está chegando, então ele sempre
 * manda EN. Quem escolheu PT antes vê um quadro em inglês antes da troca.
 * Aceitar isso é deliberado: a alternativa é ler cookie no servidor, o que
 * tira a página do cache estático inteiro por causa de um botão.
 */

export type Lang = "en" | "pt";

const CHAVE = "spanix-lang";

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, definir] = useState<Lang>("en");

  /* Uma leitura só, depois da hidratação. Preferência salva ganha do idioma
     do navegador; sem nenhuma das duas, fica em inglês. */
  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === "en" || salvo === "pt") {
      definir(salvo);
      return;
    }
    if (navigator.language?.toLowerCase().startsWith("pt")) definir("pt");
  }, []);

  /* `<html lang>` é o que faz leitor de tela trocar de voz e o que o
     navegador usa pra oferecer tradução. Sem isto, a página em português
     continua se declarando inglesa. */
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const setLang = (l: Lang) => {
    definir(l);
    localStorage.setItem(CHAVE, l);
  };

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/** Escolhe o bloco do idioma corrente. `const t = useTxt({ en: {...}, pt: {...} })` */
export function useTxt<T>(dicionario: Record<Lang, T>): T {
  return dicionario[useContext(LangCtx).lang];
}

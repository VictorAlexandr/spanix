"use client";

import { useEffect, useRef, useState } from "react";

/**
 * O comando do card Local, copiável.
 *
 * É o "tchan" do lado grátis, e é funcional: a primeira coisa que um dev faz
 * numa página dessas é selecionar o `pip install` e copiar. Dar o botão
 * elimina o passo, e de quebra dá ao card uma interação que o lado pago não
 * tem — reforça que o Local é o estado que você já pode usar agora.
 *
 * O verde só aparece na confirmação. Cor como RECOMPENSA de uma ação vale
 * mais que cor de enfeite parada na borda.
 */
export default function CopyCommand({ cmd }: { cmd: string }) {
  const [copiado, setCopiado] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      /* sem permissão de área de transferência: o texto continua selecionável */
      return;
    }
    setCopiado(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={copiar}
      aria-label={copiado ? "Command copied" : `Copy ${cmd}`}
      className="group mt-4 flex w-full items-center gap-2.5 rounded-lg border border-white/[.07] bg-black/50 px-3.5 py-[9px] text-left font-jet text-[11.5px] transition-colors hover:border-white/15 hover:bg-black/70"
    >
      <span className="text-ink-3">$</span>
      <span className="truncate text-ink-2">{cmd}</span>

      <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-3">
        {copiado ? (
          <>
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-[12px]">
              <path
                d="M3.4 8.5 6.3 11.4 12.6 5"
                fill="none"
                stroke="#3de3a0"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[10px] text-ok">copied</span>
          </>
        ) : (
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="size-[12px] text-ink-3 transition-colors group-hover:text-ink-2"
          >
            <rect x="5.5" y="5.5" width="8" height="8" rx="1.6" fill="none" stroke="currentColor" strokeWidth={1.4} />
            <path d="M10.5 3.5H3.9a1.4 1.4 0 0 0-1.4 1.4v6.6" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
          </svg>
        )}
      </span>
    </button>
  );
}

"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Comando de instalação com botão de copiar.
 *
 * É o elemento mais clicado de uma landing de ferramenta, então ele tem
 * peso de botão primário: moldura própria, mono legível e retorno visual
 * imediato ao copiar. Sem isso o dev seleciona com o mouse e erra o final.
 */
export function Install({ cmd }: { cmd: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      /* clipboard bloqueado: o texto continua selecionável */
    }
  }

  return (
    <div className="group inline-flex items-center gap-4 rounded-lg border border-edge bg-panel py-3 pr-3 pl-5 transition-colors duration-300 hover:border-edge-hi">
      <span className="font-mono text-[14px] whitespace-nowrap text-ink-3 select-none">
        $
      </span>
      <code className="font-mono text-[14px] whitespace-nowrap text-ink">
        {cmd}
      </code>
      <button
        onClick={copiar}
        aria-label="Copiar comando"
        className="ml-1 grid size-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors duration-200 hover:bg-raised hover:text-ink"
      >
        {copiado ? (
          <Check size={15} strokeWidth={2.2} className="text-ok" />
        ) : (
          <Copy size={15} strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
}

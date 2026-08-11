"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Comando de instalação — ocupa o lugar do botão primário na hero.
 *
 * Numa landing de ferramenta o CTA não é "criar conta", é a linha que o dev
 * cola no terminal. Então ela veste o peso do primário do design system
 * (pílula branca, mesma altura dos botões) e devolve retorno visual imediato
 * ao copiar, senão o dev seleciona com o mouse e erra o final.
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
    <button
      onClick={copiar}
      aria-label={`Copy: ${cmd}`}
      className="group inline-flex items-center gap-3 rounded-[10px] bg-white py-[13px] pr-[13px] pl-7 text-[#0A0714] shadow-[0_10px_32px_rgba(255,255,255,.14)] transition-all hover:-translate-y-[2px] hover:shadow-[0_16px_44px_rgba(var(--viol-rgb),.35)] motion-reduce:hover:translate-y-0"
    >
      <span className="font-mono text-[14.5px] whitespace-nowrap text-[#0A0714]/45 select-none">
        $
      </span>
      <code className="font-mono text-[14.5px] font-medium whitespace-nowrap">
        {cmd}
      </code>
      <span className="grid size-8 shrink-0 place-items-center rounded-[7px] bg-[#0A0714]/8 transition-colors group-hover:bg-[#0A0714]/14">
        {copiado ? (
          <Check size={15} strokeWidth={2.4} className="text-[#127a4e]" />
        ) : (
          <Copy size={14.5} strokeWidth={1.9} className="text-[#0A0714]/70" />
        )}
      </span>
    </button>
  );
}

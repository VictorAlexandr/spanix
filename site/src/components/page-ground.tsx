/**
 * O chão da página inteira — uma camada só, fixa atrás de tudo.
 *
 * Cada seção pintar o próprio fundo é o que criava a linha visível entre elas:
 * são duas superfícies encostadas, e junta entre superfícies sempre aparece.
 * Com um chão único as seções ficam transparentes e a fronteira deixa de
 * existir — não por ajuste de gradiente, mas porque não há o que emendar.
 *
 * O CAMPO DE ESTRELAS SAIU. Ele custava um canvas animado atrás da página
 * inteira pra entregar exatamente aquilo que faz uma landing escura parecer
 * gerada por IA: partícula brilhando no vazio, sem função nenhuma. E como
 * ruído de baixa amplitude espalhado por trás de texto e de gráfico, ele
 * competia com as duas coisas que a página precisa que sejam lidas.
 *
 * O escuro aqui não precisa de atmosfera pra não ficar morto — a hero tem a
 * aurora, os palcos têm grade e luz de aresta, e o painel tem o próprio halo.
 * Estrutura sustenta o vazio melhor que partícula.
 */
export function PageGround() {
  return (
    /* VINHETA INVERTIDA: claro no alto e ao centro, fundo nas bordas — luz de
       estúdio em vez de céu noturno. Um gradiente radial só faz as duas
       coisas: levanta o miolo e escurece as quinas.

       Ela empurra o olho pro centro sem gastar cor nenhuma, o que é
       exatamente o que faltava — o peso que incomodava vinha de o fundo ser
       uniforme, não de ser escuro. Superfície sem variação não tem distância,
       e sem distância cada elemento por cima precisa de borda forte só pra
       existir.

       `fixed`: a luz fica presa à janela, não à página. Toda seção passa por
       baixo da mesma luminária em vez de cada uma inventar a sua — é o que
       mantém as emendas invisíveis enquanto se rola. */
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(122% 96% at 50% 16%," +
          " rgba(255,255,255,.085) 0%," +
          " rgba(255,255,255,.022) 45%," +
          " rgba(0,0,0,.72) 100%)," +
          " #0a0910",
      }}
    />
  );
}

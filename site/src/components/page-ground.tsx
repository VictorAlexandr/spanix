import Starfield from "./starfield";

/**
 * O chão da página inteira — uma camada só, fixa atrás de tudo.
 *
 * Cada seção pintar o próprio fundo é o que criava a linha visível entre elas:
 * são duas superfícies encostadas, e junta entre superfícies sempre aparece.
 * Com um chão único as seções ficam transparentes e a fronteira deixa de
 * existir — não por ajuste de gradiente, mas porque não há o que emendar.
 */
export function PageGround() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 bg-base">
      <Starfield density={130} />
    </div>
  );
}

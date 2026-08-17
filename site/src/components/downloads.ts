/**
 * Downloads da spanix na PyPI — medição, últimos 30 dias.
 *
 * TUDO AQUI VEM DE DUAS CONSULTAS AO BIGQUERY sobre
 * `bigquery-public-data.pypi.file_downloads`, filtrando `file.project =
 * 'spanix'`. Uma agrupa por instalador, outra por país. O SQL está em
 * `consulta-paises.sql`, na raiz do repo.
 *
 * ── O QUE A DIVISÃO POR INSTALADOR REVELOU ────────────────────────────────
 * De 799 requisições, só 66 vieram de um gerenciador de pacotes:
 *
 *     unknown       464   scanners, indexadores, supply-chain
 *     Browser       133   gente clicando no arquivo pela web
 *     bandersnatch   76   espelho oficial — clona TODO pacote publicado
 *     requests       60   script solto
 *     pip            50   instalação de verdade
 *     uv             16   instalação de verdade
 *
 * Isso não é anomalia: é como a PyPI funciona. Todo pacote novo leva uma
 * enxurrada de tráfego automático só por existir, e é exatamente por isso que
 * o guia oficial do Python Packaging chama as contagens de "highly
 * inaccurate".
 *
 * ── POR QUE A PÁGINA MOSTRA 66, E NÃO 799 ─────────────────────────────────
 * Porque 66 é o número que sobrevive a um dev cético. Quem conhece a PyPI
 * desconta o total na hora, e uma landing que lidera com o número inflado
 * perde a credibilidade da seção inteira na primeira linha.
 *
 * `pip` + `uv` é a definição mais estreita e mais defensável de "alguém
 * instalou": exige um gerenciador de pacotes rodando em algum ambiente. E o
 * `uv` ali é um sinal por si — é o instalador da turma que acompanha
 * ferramenta nova.
 *
 * Para atualizar: rode as duas consultas de novo e troque os números abaixo.
 */

export type Instalador = { nome: string; n: number; real: boolean };

/* Resultado da consulta por instalador, sem edição. `real` marca o que exige
   um gerenciador de pacotes — o resto é espelho, robô ou navegador. */
export const INSTALADORES: Instalador[] = [
  { nome: "unknown", n: 464, real: false },
  { nome: "Browser", n: 133, real: false },
  { nome: "bandersnatch", n: 76, real: false },
  { nome: "requests", n: 60, real: false },
  { nome: "pip", n: 50, real: true },
  { nome: "uv", n: 16, real: true },
];

/** Instalações de verdade: pip + uv. É o número que a seção lidera. */
export const INSTALACOES = INSTALADORES.filter((i) => i.real).reduce((a, i) => a + i.n, 0);

/** Tudo que a PyPI registrou, inclusive espelho e robô. */
export const REQUISICOES = INSTALADORES.reduce((a, i) => a + i.n, 0);

/* A JANELA CERTA. A consulta cobre 30 dias, mas o pacote existe desde 11 de
   agosto — então tudo que ela pegou aconteceu nos PRIMEIROS DIAS de vida.
   Rotular de "last 30 days" diluía o melhor argumento do número: 66 installs
   em 4 dias sem anúncio é história; em 30 dias é média. A data absoluta
   também envelhece melhor que "3 days old" escrito à mão. */
export const ATUALIZADO = "since launch · aug 11";

/* ── onde ele roda ─────────────────────────────────────────────────────────
   Consulta por sistema/distro/ci sobre os mesmos installs de pip+uv. Ela
   DERRUBOU a suposição de que isso era tudo CI: `details.ci` veio nulo em
   todas as linhas, e 26 dos 66 são macOS — datacenter não roda macOS, laptop
   de dev roda. O Amazon Linux é a AWS com nome e sobrenome, e o Raspbian é
   alguém rodando um profiler de agentes num Raspberry Pi, que é o tipo de
   detalhe que nenhuma landing inventaria. */
export type Plataforma = {
  nome: string;
  n: number;
  /** chave do glifo em `marca.tsx`; sem glifo, o chip sai só com texto */
  marca?: "apple" | "ubuntu" | "aws" | "windows" | "raspberrypi";
  /** o chip que a seção quer que salte — datacenter com nome */
  destaque?: boolean;
};
export const PLATAFORMAS: Plataforma[] = [
  { nome: "macOS", n: 26, marca: "apple" },
  { nome: "Ubuntu", n: 26, marca: "ubuntu" },
  /* O DESTAQUE DE DATACENTER: Amazon Linux é distro que só roda em máquina
     da AWS, então este chip é nuvem com nome e sobrenome — medido, não
     inferido. */
  { nome: "AWS · datacenter", n: 8, marca: "aws", destaque: true },
  { nome: "Windows", n: 4, marca: "windows" },
  /* Era "Raspberry Pi" (a query viu Raspbian), mas o rótulo pressupunha que
     o leitor conhece a placa — nem o dono do site conhecia. "Linux · other"
     conta o mesmo fato sem exigir repertório; o detalhe curioso continua
     vivo na frase da seção. */
  { nome: "Linux · other", n: 2 },
];

/* Centroides aproximados: tabela estática, o que muda é só a contagem. País é
   o máximo de granularidade que existe — o `linehaul` grava `country_code` de
   duas letras, e não latitude. */
export type Pais = {
  cc: string;
  nome: string;
  lat: number;
  lon: number;
  n: number;
  pct: number;
  /** quantos destes installs vieram de Amazon Linux — cruzamento confirmado
      por query própria (country × distro). Hoje só os EUA têm. */
  aws?: number;
};

/* Resultado da consulta por país (`pip`, com país conhecido), sem edição. */
const CRU: Omit<Pais, "pct">[] = [
  /* Os 8 installs de Amazon Linux são TODOS daqui — cruzado numa query
     separada (distro='Amazon Linux' GROUP BY country). É o que liga o chip
     "AWS · datacenter" a um lugar no mapa. */
  { cc: "US", nome: "United States", lat: 39.8, lon: -98.6, n: 28, aws: 8 },
  { cc: "SG", nome: "Singapore", lat: 1.4, lon: 103.8, n: 8 },
  { cc: "BR", nome: "Brazil", lat: -14.2, lon: -51.9, n: 6 },
  { cc: "JP", nome: "Japan", lat: 36.2, lon: 138.3, n: 4 },
  { cc: "FR", nome: "France", lat: 46.2, lon: 2.2, n: 2 },
  { cc: "GB", nome: "United Kingdom", lat: 55.4, lon: -3.4, n: 2 },
];

const SOMA = CRU.reduce((a, p) => a + p.n, 0);

/* A SEÇÃO MOSTRA PERCENTUAL, NÃO CONTAGEM. Percentual é uma DISTRIBUIÇÃO:
   responde "de onde vêm", que é a pergunta que o mapa faz, e não tem
   obrigação de somar com nenhum outro número da tela. Com contagem, a soma
   dos países não fechava com o número grande e a seção precisava de um
   parágrafo inteiro explicando a diferença. */
export const PAISES: Pais[] = CRU.map((p) => ({
  ...p,
  pct: Math.round((p.n / SOMA) * 100),
}));

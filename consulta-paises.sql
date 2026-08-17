-- Downloads da spanix por país, últimos 30 dias.
--
-- ONDE RODAR: console.cloud.google.com/bigquery — free tier de 1 TB/mês, sem
-- cartão de crédito. O guia oficial do Python Packaging mostra uma consulta
-- de exemplo custando US$ 0,04 processando 6,87 GiB; esta aqui é menor porque
-- filtra por partição de data E por projeto.
--
-- POR QUE PRECISA DE VOCÊ: a tabela é pública, mas o BigQuery cobra de quem
-- consulta, então exige um projeto Google autenticado. Não há como rodar isso
-- sem a sua conta.
--
-- O CAMPO `country_code` É REAL: confirmado no `pypa/linehaul-cloud-function`,
-- que é o serviço que grava estas linhas. Ele é opcional (pode vir nulo) e é
-- código de país de duas letras — não existe cidade nem coordenada.
--
-- O FILTRO DE INSTALADOR IMPORTA. Sem ele a contagem entra inflada por
-- espelhos e robôs; o próprio guia oficial avisa que os números são
-- "highly inaccurate" por causa disso. `pip` sozinho não elimina CI, mas
-- corta a maior parte do lixo.

SELECT
  country_code,
  COUNT(*) AS downloads
FROM `bigquery-public-data.pypi.file_downloads`
WHERE
  file.project = 'spanix'
  -- filtro de partição: é ele que mantém o custo em centavos
  AND DATE(timestamp) BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY) AND CURRENT_DATE()
  AND details.installer.name = 'pip'
  AND country_code IS NOT NULL
GROUP BY country_code
ORDER BY downloads DESC;

-- Depois de rodar:
--   1. cole o resultado em `site/src/components/downloads.ts` → PAISES
--      (o `lat`/`lon` de cada país já está lá, é só ajustar o `n`)
--   2. atualize TOTAL com a soma, e ATUALIZADO com o período
--   3. mude `paisesSaoAmostra` para false
--
-- Enquanto a bandeira estiver true, a seção do globo desenha um selo dizendo
-- que os países são amostra. É proposital: dado inventado não pode ir ao ar
-- em silêncio.

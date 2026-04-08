CREATE OR REPLACE TABLE `{project}.derived.tax_year_assessment_bins` AS

SELECT
    CAST(tax_year AS INT64) AS tax_year,
    CAST(FLOOR(SAFE_CAST(market_value AS FLOAT64) / 25000) * 25000 AS INT64) AS lower_bound,
    CAST((FLOOR(SAFE_CAST(market_value AS FLOAT64) / 25000) + 1) * 25000 AS INT64) AS upper_bound,
    COUNT(*) AS property_count
FROM `{project}.source.opa_assessments`
WHERE market_value IS NOT NULL
    AND SAFE_CAST(market_value AS FLOAT64) > 0
GROUP BY
    tax_year,
    lower_bound,
    upper_bound
ORDER BY
    tax_year,
    lower_bound

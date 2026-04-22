CREATE OR REPLACE TABLE `{project}.derived.current_assessment_bins` AS

SELECT
    CAST(FLOOR(SAFE_CAST(market_value AS FLOAT64) / 25000) * 25000 AS INT64) AS lower_bound,
    CAST((FLOOR(SAFE_CAST(market_value AS FLOAT64) / 25000) + 1) * 25000 AS INT64) AS upper_bound,
    COUNT(*) AS property_count
FROM `{project}.core.core_phl_opa_assessments`
WHERE
    market_value IS NOT NULL
    AND SAFE_CAST(market_value AS FLOAT64) > 0
    AND year = (SELECT MAX(year) FROM `{project}.core.core_phl_opa_assessments`)
GROUP BY
    lower_bound,
    upper_bound
ORDER BY
    lower_bound
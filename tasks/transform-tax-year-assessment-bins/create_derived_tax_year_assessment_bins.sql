CREATE OR REPLACE TABLE `musa5090s26-team3.derived.tax_year_assessment_bins` AS

WITH residential_parcels AS (
    SELECT DISTINCT parcel_number
    FROM `musa5090s26-team3.source.source_phl_opa_properties`
    WHERE category_code_description IN (
        'SINGLE FAMILY',
        'MULTI FAMILY',
        'APARTMENTS  > 4 UNITS',
        'GARAGE - RESIDENTIAL',
        'VACANT LAND - RESIDENTIAL'
    )
)

SELECT
    CAST(a.`year` AS INT64) AS tax_year,
    CAST(FLOOR(SAFE_CAST(a.market_value AS FLOAT64) / 25000) * 25000 AS INT64) AS lower_bound,
    CAST((FLOOR(SAFE_CAST(a.market_value AS FLOAT64) / 25000) + 1) * 25000 AS INT64) AS upper_bound,
    COUNT(*) AS property_count
FROM `musa5090s26-team3.source.source_phl_opa_assessments` AS a
INNER JOIN residential_parcels AS r USING (parcel_number)
WHERE
    a.market_value IS NOT NULL
    AND SAFE_CAST(a.market_value AS FLOAT64) > 0
GROUP BY tax_year, lower_bound, upper_bound
ORDER BY tax_year, lower_bound;
CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_opa_properties AS
WITH base AS (
    SELECT
        src.parcel_number AS parcel_id,
        src.market_value,
        src.total_livable_area,
        src.year_built,
        src.number_of_bedrooms,
        src.number_of_bathrooms,
        src.zip_code,
        src.zoning,
        src.category_code_description,
        src.quality_grade,
        src.census_tract,
        src.geographic_ward,
        DATE(TIMESTAMP(src.sale_date), "America/New_York") AS est_date,
        SAFE_CAST(src.sale_price AS INT64) AS sale_price_int
    FROM ${dataset_name_source}.source_phl_opa_properties AS src
    WHERE
        src.parcel_number IS NOT NULL
        AND src.market_value IS NOT NULL
        AND src.total_livable_area IS NOT NULL
        AND src.year_built IS NOT NULL
        AND src.number_of_bedrooms IS NOT NULL
        AND src.number_of_bathrooms IS NOT NULL
        AND src.zip_code IS NOT NULL
        AND src.zoning IS NOT NULL
        AND src.category_code_description IS NOT NULL
        AND src.quality_grade IS NOT NULL
        AND src.census_tract IS NOT NULL
        AND src.geographic_ward IS NOT NULL
        AND src.sale_price > 1000
),

dedupe_keys AS (
    SELECT
        est_date,
        sale_price_int,
        COUNT(*) AS cnt
    FROM base
    GROUP BY est_date, sale_price_int
    HAVING COUNT(*) = 1
)

SELECT
    b.* EXCEPT (est_date),
    b.est_date AS sale_date,
    EXTRACT(YEAR FROM b.est_date) AS sale_year,
    EXTRACT(MONTH FROM b.est_date) AS sale_month,
    EXTRACT(DAY FROM b.est_date) AS sale_day
FROM base b
JOIN dedupe_keys
    USING (est_date, sale_price_int);

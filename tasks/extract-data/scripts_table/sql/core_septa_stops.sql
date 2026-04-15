CREATE OR REPLACE TABLE ${dataset_name_core}.core_phl_septa_stops AS
SELECT
    stopid,
    `geometry`
FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (
            PARTITION BY stopname
            ORDER BY stopname
        ) AS rn
    FROM ${dataset_name_source}.source_phl_septa_stops
)
WHERE rn = 1;

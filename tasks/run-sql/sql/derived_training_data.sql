CREATE OR REPLACE TABLE ${dataset_name_derived}.derived_training_data AS
SELECT
    * EXCEPT (parcel_id, sale_date)
FROM ${dataset_name_derived}.derived_opa_properties
WHERE sale_date >= DATE('2024-01-01')

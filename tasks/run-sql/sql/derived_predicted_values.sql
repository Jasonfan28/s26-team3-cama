CREATE OR REPLACE TABLE ${dataset_name_derived}.derived_predicted_values AS
SELECT
    parcel_id,
    CAST(ROUND(predicted_sale_price, -2) AS INT64) AS pred_value
FROM
    ML.predict (
        MODEL ${dataset_name_derived}.model_lin_reg_tuned,
        (
            SELECT
                * EXCEPT (sale_date)
            FROM
                ${dataset_name_derived}.derived_opa_properties
        )
    );

# Deploy 

gcloud run jobs deploy generate-property-map-tiles \
--project musa5090s26-team3 \
--region us-east4 \
--source . \
--cpu 4 \
--memory 8Gi 

# Execute

gcloud run jobs execute generate-property-map-tiles
#!/usr/bin/env bash
set -ex

gcloud storage cp \
  gs://musa5090s26-team3-temp_data/property_tile_info.geojson \
  ./property_tile_info.geojson

ogr2ogr \
  -f MVT \
  -dsco MINZOOM=12 \
  -dsco MAXZOOM=18 \
  -dsco COMPRESS=NO \
  ./properties \
  ./property_tile_info.geojson

gcloud storage cp \
  --recursive \
  ./properties \
  gs://musa5090s26-team3-public/tiles
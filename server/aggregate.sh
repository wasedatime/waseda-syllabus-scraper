#!/bin/bash

source variables.sh

mongo "localhost:27017/${DB_NAME}" "${PROJECT_PATH}js/dropAggregatedCollections.js" \
&& mongo "localhost:27017/${DB_NAME}" "${PROJECT_PATH}js/aggregate.js"
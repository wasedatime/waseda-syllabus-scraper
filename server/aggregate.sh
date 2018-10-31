#!/bin/bash

source variables.sh

academics_to_scrape_json=( $(jq '.' ${DATA_PATH}academics_to_scrape.json ) )
academics_to_scrape_js="var academicsToScrape = ${academics_to_scrape_json[@]};"
echo ${academics_to_scrape_js} > "${JS_PATH}academicsToScrape.js"

academics_to_scrape=( $(jq -r '.[]' ${DATA_PATH}academics_to_scrape.json ) )

for e in "${academics_to_scrape[@]}"
do
    entire_year_courses_school_name=entire_year_courses_${e}
    echo "Dropping aggregated collection ${!entire_year_courses_school_name} in database ${DB_NAME}"
    mongo ${DB_NAME} --eval "printjson(db.${!entire_year_courses_school_name}.drop())"
done



# && mongo "localhost:27017/${DB_NAME}" "${PROJECT_PATH}js/aggregate.js"

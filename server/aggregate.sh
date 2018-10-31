#!/bin/bash

source variables.sh

academics_to_scrape=( $(jq -r '.[]' ${DATA_PATH}academics_to_scrape.json ) )

# Generate academicCollections.js dynamically from academics_to_scrape.json
raw_entire_year_courses_academics=()
entire_year_courses_academics=()

for e in "${academics_to_scrape[@]}"
do
    raw_entire_year_courses_academic=raw_entire_year_courses_${e}
    raw_entire_year_courses_academics+=(${!raw_entire_year_courses_academic})
    entire_year_courses_academic=entire_year_courses_${e}
    entire_year_courses_academics+=(${!entire_year_courses_academic})
done

raw_entire_year_courses_academics_json=$(printf '%s\n' "${raw_entire_year_courses_academics[@]}" | jq -R . | jq -s .)
raw_entire_year_courses_academics_js="var academicCollectionsToAggregate = ${raw_entire_year_courses_academics_json};"
entire_year_courses_academics_json=$(printf '%s\n' "${entire_year_courses_academics[@]}" | jq -R . | jq -s .)
entire_year_courses_academics_js="var academicCollectionsToExport = ${entire_year_courses_academics_json};"
printf "${raw_entire_year_courses_academics_js}\n${entire_year_courses_academics_js}"> "${JS_PATH}academicCollections.js"

# Drop collections
for e in "${academics_to_scrape[@]}"
do
    entire_year_courses_academic=entire_year_courses_${e}
    echo "Dropping aggregated collection ${!entire_year_courses_academic} in database ${DB_NAME}"
    mongo ${DB_NAME} --eval "printjson(db.${!entire_year_courses_academic}.drop())"
done \
&& mongo "localhost:27017/${DB_NAME}" "${PROJECT_PATH}js/aggregate.js"

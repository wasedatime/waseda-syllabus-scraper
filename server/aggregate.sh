#!/bin/bash

source variables.sh

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
entire_year_courses_academics_json=$(printf '%s\n' "${entire_year_courses_academics[@]}" | jq -R . | jq -s .)
raw_entire_year_courses_academics_js="var rawEntireYearCoursesAcademics = ${raw_entire_year_courses_academics_json};"
entire_year_courses_academics_js="var entireYearCoursesAcademics = ${entire_year_courses_academics_json};"
raw_entire_year_courses_all_js="var rawEntireYearCoursesAll = \"${raw_entire_year_courses_all}\";"
entire_year_courses_all_js="var entireYearCoursesAll = \"${entire_year_courses_all}\";"

academic_collections_js="${raw_entire_year_courses_academics_js}\n${entire_year_courses_academics_js}"
academic_collections_js="${academic_collections_js}\n${raw_entire_year_courses_all_js}\n${entire_year_courses_all_js}"
printf "${academic_collections_js}" > "${JS_PATH}academicCollections.js"

# Drop previously aggregated collections, then start aggregating
for e in "${academics_to_scrape[@]}"
do
    entire_year_courses_academic=entire_year_courses_${e}
    echo "Dropping aggregated collection ${!entire_year_courses_academic} in database ${DB_NAME}"
    mongo ${DB_NAME} --eval "printjson(db.${!entire_year_courses_academic}.drop())"
done \
&& mongo ${DB_NAME} --eval "printjson(db.entire_2019_courses_SCI_ENG.drop())" \
&& mongo ${DB_NAME} --eval "printjson(db.entire_2019_courses_all.drop())" \
&& mongo "localhost:27017/${DB_NAME}" "${PROJECT_PATH}js/aggregate.js"

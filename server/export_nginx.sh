#!/bin/bash

source variables.sh

export_courses() {
    mongoexport --db ${DB_NAME} -c ${1} --out "${API_PATH}course_list_${2}.json" --jsonArray
}

for e in "${academics_to_scrape[@]}"
do
    entire_year_courses_academic=entire_year_courses_${e}
    echo "Exporting collection ${!entire_year_courses_academic} to API folder"
    export_courses ${!entire_year_courses_academic} ${e}
done

echo "Exporting collection stats to API folder"
mongoexport --db ${DB_NAME} -c stats --out "${API_PATH}scraper_stats/index.json"

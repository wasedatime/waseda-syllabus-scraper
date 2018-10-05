#!/bin/bash

# TODO jq, split json https://stackoverflow.com/questions/28744361/split-a-json-file-into-separate-files?noredirect=1&lq=1

source variables.sh

export_courses() {
    mongoexport --db ${DB_NAME} -c ${1} --out "${API_PATH}course_list_${2}.json" --jsonArray
}

export_courses ${entire_year_courses_all} "all" \
&& export_courses ${entire_year_courses_sci_eng} "sci_eng" \
&& export_courses ${entire_year_courses_pse} "pse" \
&& export_courses ${entire_year_courses_sils} "sils" \
&& export_courses ${entire_year_courses_sss} "sss" \
&& export_courses ${entire_year_courses_cjl} "cjl"


mongoexport --db ${DB_NAME} -c stats --out "${API_PATH}scraper_stats/index.json"

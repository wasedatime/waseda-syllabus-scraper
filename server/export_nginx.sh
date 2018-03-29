#!/bin/bash

# TODO jq, split json https://stackoverflow.com/questions/28744361/split-a-json-file-into-separate-files?noredirect=1&lq=1

source variables.sh

export_nginx() {
    mongoexport --db ${DB_NAME} -c ${1} --out "${API_PATH}courses/${2}/index.json" --jsonArray
}

export_nginx ${entire_year_courses_sci_eng} "sci_eng"
# && export_nginx ${entire_year_courses_pse} "pse" \
# && export_nginx ${entire_year_courses_sils} "sils"
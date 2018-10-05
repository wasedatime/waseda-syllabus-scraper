#!/bin/bash

source variables.sh

# drop database_prev
mongo ${DB_PREV_NAME} --eval "printjson(db.dropDatabase())"
# copy database to database_prev (back up)
mongo ${DB_NAME} --eval "printjson(db.copyDatabase('${DB_NAME}', '${DB_PREV_NAME}'))"
# drop database
mongo ${DB_NAME} --eval "printjson(db.dropDatabase())"

# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd "${PROJECT_PATH}wsl_spider"

scrape () {
    # Use absolute path to execute run_search.py in a virtual environment
    # Wrap the argument in quotes to tell the shell to ignore spaces in it
    "${VIRTUAL_ENV_PATH}bin/python3" "${PROJECT_PATH}wsl_spider/wsl_spider/run_search.py" \
    -d "$1" -s "$2" -t "$3" -k "$4" -b "$5" -c "$6"
}

# Arguments: displayed_language, schools, teaching_language, single_keyword, database, collection

scrape "en" ${schools_sci_eng} "all" "" ${DB_NAME} ${raw_entire_year_courses_sci_eng} \
&& scrape "en" ${schools_sci_eng} "jp" "" ${DB_NAME} ${raw_entire_year_courses_sci_eng} \
&& scrape "en" ${schools_sci_eng} "en" "" ${DB_NAME} ${raw_entire_year_courses_sci_eng} \
&& scrape "en" ${schools_sci_eng} "all" "IPSE" ${DB_NAME} ${raw_entire_year_courses_sci_eng} \
&& scrape "en" ${schools_sci_eng} "all" "English-based Undergraduate Program" ${DB_NAME} ${raw_entire_year_courses_sci_eng} \
&& scrape "en" ${school_pse} "all" "" ${DB_NAME} ${raw_entire_year_courses_pse} \
&& scrape "en" ${school_pse} "en" "" ${DB_NAME} ${raw_entire_year_courses_pse} \
&& scrape "en" ${school_pse} "jp" "" ${DB_NAME} ${raw_entire_year_courses_pse} \
&& scrape "en" ${school_sils} "all" "" ${DB_NAME} ${raw_entire_year_courses_sils} \
&& scrape "en" ${school_sils} "en" "" ${DB_NAME} ${raw_entire_year_courses_sils} \
&& scrape "en" ${school_sils} "jp" "" ${DB_NAME} ${raw_entire_year_courses_sils} \
&& scrape "en" ${school_sss} "all" "" ${DB_NAME} ${raw_entire_year_courses_sss} \
&& scrape "en" ${school_sss} "en" "" ${DB_NAME} ${raw_entire_year_courses_sss} \
&& scrape "en" ${school_sss} "jp" "" ${DB_NAME} ${raw_entire_year_courses_sss}
&& scrape "en" ${school_cjl} "jp" "" ${DB_NAME} ${raw_entire_year_courses_cjl}

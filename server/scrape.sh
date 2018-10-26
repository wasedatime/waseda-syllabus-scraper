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
    # Arguments: displayed_language, school, teaching_language, single_keyword, database, collection, path for academics.json
    "${VIRTUAL_ENV_PATH}bin/python3" "${PROJECT_PATH}wsl_spider/wsl_spider/run_search.py" \
    -d "$1" -s "$2" -t "$3" -k "$4" -b "$5" -c "$6" -p "${DATA_PATH}academics.json"
}

academics_to_scrape=( $(jq -r '.[]' ${DATA_PATH}academics_to_scrape.json ) )

for e in "${academics_to_scrape[@]}"
do
    # raw_entire_year_courses_school_name is a dynamic variable.
    # Its value it the 'variable name' of the current school name 'e'.
    # E.g., if e is 'PSE', the value of raw_entire_year_courses_school_name is raw_entire_year_courses_PSE.
    raw_entire_year_courses_school_name=raw_entire_year_courses_${e}

    # School FSE, ASE, CSE has special keywords IPSE and English-based Undergraduate Program.
    if [ "$e" = "FSE" ] || [ "$e" = "ASE" ] || [ "$e" = "CSE" ]; then
        # ! mark is used for indirect expansion.
        # This allows bash to use the value of the variable raw_entire_year_courses_school_name as a variable,
        # and then expand it so that its value is used in the rest of substitution.
        # E.g., if echo ${raw_entire_year_courses_school_name} is raw_entire_year_courses_PSE
        # echo ${!raw_entire_year_courses_school_name} is the 'value' of ${raw_entire_year_courses_PSE}

        # Arguments: displayed_language, school, teaching_language, single_keyword, database, collection
        scrape "en" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "en" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "jp" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "all" "IPSE" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "all" "English-based Undergraduate Program" ${DB_NAME} ${!raw_entire_year_courses_school_name}
    else
        scrape "en" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "en" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "en" ${e} "jp" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape "jp" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name}
    fi
done

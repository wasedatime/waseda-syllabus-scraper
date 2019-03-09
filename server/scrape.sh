#!/bin/bash

source variables.sh

scrape () {
    # Use absolute path to execute run_search.py in a virtual environment
    # Wrap the argument in quotes to tell the shell to ignore spaces in it
    # Arguments: displayed_language, school, teaching_language, single_keyword, database, collection, path for academics.json
    "${VIRTUAL_ENV_PATH}bin/python3" "${PROJECT_PATH}wsl_spider/wsl_spider/run_search.py" \
    -y "$1" -d "$2" -s "$3" -t "$4" -k "$5" -b "$6" -c "$7" -p "${DATA_PATH}academics.json"
}

# drop database_prev
echo "Dropping database_prev"
mongo ${DB_PREV_NAME} --eval "printjson(db.dropDatabase())"
# copy database to database_prev (back up)
echo "Copying current database to database_prev"
mongo ${DB_NAME} --eval "printjson(db.copyDatabase('${DB_NAME}', '${DB_PREV_NAME}'))"


# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd "${PROJECT_PATH}wsl_spider"

for e in "${academics_to_scrape[@]}"
do
    # raw_entire_year_courses_academic is a dynamic variable.
    # Its value it the 'variable name' of the current school name 'e'.
    # E.g., if e is 'PSE', the value of raw_entire_year_courses_academic is name ${raw_entire_year_courses_PSE}
    raw_entire_year_courses_academic=raw_entire_year_courses_${e}

    # ! mark is used for indirect expansion.
    # This allows bash to use the value of the variable raw_entire_year_courses_academic as a variable,
    # and then expand it so that its value is used in the rest of substitution.
    # E.g., if echo ${raw_entire_year_courses_academic} is the 'name' of ${raw_entire_year_courses_PSE}
    # echo ${!raw_entire_year_courses_academic} is the 'value' of ${raw_entire_year_courses_PSE}

    # Arguments: displayed_language, school, teaching_language, single_keyword, database, collection
    scrape ${academic_year} "en" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_academic} \
    && scrape ${academic_year} "en" ${e} "en" "" ${DB_NAME} ${!raw_entire_year_courses_academic} \
    && scrape ${academic_year} "en" ${e} "jp" "" ${DB_NAME} ${!raw_entire_year_courses_academic} \
    && if [ "$e" = "FSE" ] || [ "$e" = "ASE" ] || [ "$e" = "CSE" ]; then

        # School FSE, ASE, CSE has special keywords IPSE and English-based Undergraduate Program.
        scrape ${academic_year} "en" ${e} "all" "IPSE" ${DB_NAME} ${!raw_entire_year_courses_academic} \
        && scrape ${academic_year} "en" ${e} "all" "English-based Undergraduate Program" ${DB_NAME} ${!raw_entire_year_courses_academic}

    fi \
    && scrape ${academic_year} "jp" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_academic}
done

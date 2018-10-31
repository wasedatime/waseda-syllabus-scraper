#!/bin/bash

source variables.sh

academics_to_scrape=( $(jq -r '.[]' ${DATA_PATH}academics_to_scrape.json ) )

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


for e in "${academics_to_scrape[@]}"
do
    # raw_entire_year_courses_school_name is a dynamic variable.
    # Its value it the 'variable name' of the current school name 'e'.
    # E.g., if e is 'PSE', the value of raw_entire_year_courses_school_name is name ${raw_entire_year_courses_PSE}
    raw_entire_year_courses_school_name=raw_entire_year_courses_${e}

    # ! mark is used for indirect expansion.
    # This allows bash to use the value of the variable raw_entire_year_courses_school_name as a variable,
    # and then expand it so that its value is used in the rest of substitution.
    # E.g., if echo ${raw_entire_year_courses_school_name} is the 'name' of ${raw_entire_year_courses_PSE}
    # echo ${!raw_entire_year_courses_school_name} is the 'value' of ${raw_entire_year_courses_PSE}
    echo "Dropping collection ${!raw_entire_year_courses_school_name} in current database"
    mongo ${DB_NAME} --eval "printjson(db.${!raw_entire_year_courses_school_name}.drop())"
done


# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd "${PROJECT_PATH}wsl_spider"

for e in "${academics_to_scrape[@]}"
do
    raw_entire_year_courses_school_name=raw_entire_year_courses_${e}

    # School FSE, ASE, CSE has special keywords IPSE and English-based Undergraduate Program.
    if [ "$e" = "FSE" ] || [ "$e" = "ASE" ] || [ "$e" = "CSE" ]; then

        # Arguments: displayed_language, school, teaching_language, single_keyword, database, collection
        scrape ${academic_year} "en" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "en" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "jp" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "all" "IPSE" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "all" "English-based Undergraduate Program" ${DB_NAME} ${!raw_entire_year_courses_school_name}
    else
        scrape ${academic_year} "en" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "en" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "en" ${e} "jp" "" ${DB_NAME} ${!raw_entire_year_courses_school_name} \
        && scrape ${academic_year} "jp" ${e} "all" "" ${DB_NAME} ${!raw_entire_year_courses_school_name}
    fi
done

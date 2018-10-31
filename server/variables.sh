#!/bin/bash

get_academic_year() {
    # Calculates the current academic year.
    # Minus one year if the month is January or February because the second semester ends in February.
    current_month=$(date +'%B')
    current_academic_year=$(date +'%Y')
    if [ ${current_month} = "January" ] || [ ${current_month} = "February" ]; then
       # The (( ... )) construct permits arithmetic expansion and evaluation.
       ((current_academic_year--))
    fi;
    echo ${current_academic_year}
}

academic_year=$(get_academic_year)
next_academic_year=$((academic_year + 1))
entire_academic_year="entire_${academic_year}"

YEAR=${academic_year}-${next_academic_year}

BASE_PATH="/Users/oscar/PythonProjects/"
VIRTUAL_ENV_PATH="${BASE_PATH}/waseda-syllabus-scraper-personal-virtualenv/"

DB_NAME="test"
DB_PREV_NAME="${DB_NAME}_prev"
API_PATH="/Users/oscar/WebDev/wasetime-api/api/static/${YEAR}/"

# Don't for get spaces after '[' and before ']'! [ condition ]
if [ "$DEPLOY" = "deploy" ]; then
    BASE_PATH="/home/deploy/"
    VIRTUAL_ENV_PATH="${BASE_PATH}deploy-virtual-env/"

    DB_NAME="syllabus"
    DB_PREV_NAME="${DB_NAME}_prev"
    API_PATH="/var/www/api/static/${YEAR}/"
fi

PROJECT_PATH="${BASE_PATH}waseda-syllabus-scraper/"
SCRIPT_PATH="${PROJECT_PATH}server/"
DATA_PATH="${PROJECT_PATH}data/"
JS_PATH="${PROJECT_PATH}js/"

# Read school codes from the TOP level keys in academics.json
academics=( $(jq -r '. | keys_unsorted | .[]' ${DATA_PATH}academics.json ) )

# Declare dynamic variables and values for schools, e.g. school_PSE="PSE"
for e in "${academics[@]}"
do
    declare school_${e}=${e}
done

concat_variables() {
    argument_array=( "$@" )
    argument_array_length=${#argument_array[@]}
    result=${argument_array[0]}
    # Don't include the first element
    for ((i=1; i < argument_array_length; i++))
    do
      result=${result}_${argument_array[$i]}
    done
    echo ${result}
}

courses="courses"

# Raw collections in mongodb
for e in "${academics[@]}"
do
    declare raw_entire_year_courses_${e}=$(concat_variables "raw" ${entire_academic_year} ${courses} ${e})
done
raw_entire_year_courses_all=$(concat_variables "raw" ${entire_academic_year} ${courses} "all")

# Refined collections in mongodb
for e in "${academics[@]}"
do
    declare entire_year_courses_${e}=$(concat_variables ${entire_academic_year} ${courses} ${e})
done
entire_year_courses_all=$(concat_variables ${entire_academic_year} ${courses} "all")

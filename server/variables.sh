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
PROJECT_PATH="${BASE_PATH}waseda-syllabus-scraper/"
SCRIPT_PATH="${PROJECT_PATH}server/"
DATA_PATH="${PROJECT_PATH}/data/"
VIRTUAL_ENV_PATH="${BASE_PATH}/waseda-syllabus-scraper-personal-virtualenv/"

DB_NAME="test"
DB_PREV_NAME="${DB_NAME}_prev"
API_PATH="/Users/oscar/WebDev/wasetime-api/api/static/${YEAR}/"

# Don't for get spaces after '[' and before ']'! [ condition ]
if [ "$DEPLOY" = "deploy" ]; then
    BASE_PATH="/home/deploy/"
    PROJECT_PATH="${BASE_PATH}waseda-syllabus-scraper/"
    SCRIPT_PATH="${PROJECT_PATH}server/"
    DATA_PATH="${PROJECT_PATH}data/"
    VIRTUAL_ENV_PATH="${BASE_PATH}deploy-virtual-env/"

    DB_NAME="syllabus"
    DB_PREV_NAME="${DB_NAME}_prev"
    API_PATH="/var/www/api/static/${YEAR}/"
fi

# Read school codes from the TOP level keys in academics.json
academics=( $(jq -r '.[] | keys[]' ${DATA_PATH}academics.json ) )

# Declare dynamic variables and values for schools, e.g. school_PSE="PSE"
for e in "${academics[@]}"
do
    declare school_${e}=${e}
done

#schools_sci_eng="fund_sci_eng,cre_sci_eng,adv_sci_eng"
#school_pse="poli_sci"
#school_sils="sils"
#school_sss="sss"
#school_cjl="cjl"
#school_sports_sci="sports_sci"

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
for i in "${academics[@]}"
do
    declare raw_entire_year_courses_${i}=$(concat_variables "raw" ${entire_academic_year} ${courses} ${i})
done

# Refined collections in mongodb
for i in "${academics[@]}"
do
    declare entire_year_courses_${i}=$(concat_variables ${entire_academic_year} ${courses} ${i})
done

#entire_year_courses_all="${entire_academic_year}_courses_all"
#entire_year_courses_sci_eng="${entire_academic_year}_courses_sci_eng"
#entire_year_courses_pse="${entire_academic_year}_courses_pse"
#entire_year_courses_sils="${entire_academic_year}_courses_sils"
#entire_year_courses_sss="${entire_academic_year}_courses_sss"
#entire_year_courses_cjl="${entire_academic_year}_courses_cjl"
#entire_year_courses_sports_sci="${entire_academic_year}_courses_sports_sci"

#raw_entire_year_courses_all="${raw}${entire_academic_year}_all"
#raw_entire_year_courses_sci_eng="${raw}${entire_academic_year}_courses_sci_eng"
#raw_entire_year_courses_pse="${raw}${entire_academic_year}_courses_pse"
#raw_entire_year_courses_sils="${raw}${entire_academic_year}_courses_sils"
#raw_entire_year_courses_sss="${raw}${entire_academic_year}_courses_sss"
#raw_entire_year_courses_cjl="${raw}${entire_academic_year}_courses_cjl"
#raw_entire_year_courses_sports_sci="${raw}${entire_academic_year}_courses_sports_sci"

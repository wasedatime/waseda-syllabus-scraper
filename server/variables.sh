#!/bin/bash

raw="raw_"
# year=$(date +'%Y') be careful for January, February.
year="2018"
entire_year="entire_${year}"

schools_sci_eng="fund_sci_eng,cre_sci_eng,adv_sci_eng"

# Raw collections
raw_entire_year_courses_all="${raw}${entire_year}_all"
raw_entire_year_courses_sci_eng="${raw}${entire_year}_courses_sci_eng"
raw_entire_year_courses_pse="${raw}${entire_year}_courses_pse"
raw_entire_year_courses_sils="${raw}${entire_year}_courses_sils"

entire_year_courses_sci_eng="${entire_year}_courses_sci_eng"
entire_year_courses_sci_eng_search="${entire_year_courses_sci_eng}_search"
entire_year_courses_pse="${entire_year}_courses_pse"
entire_year_courses_pse_search="${entire_year_courses_pse}_search"
entire_year_courses_sils="${entire_year}_courses_sils"
entire_year_courses_sils_search="${entire_year_courses_sils}_search"

YEAR="2018-2019"
SCRIPT_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper/server/"
VIRTUAL_ENV_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper-personal-virtualenv/"
PROJECT_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper/"
DB_NAME="test"
DB_PREV_NAME="${DB_NAME}_prev"
API_PATH="/Users/oscar/WebDev/wasetime-api/api/${YEAR}/"

# Don't for get spaces after '[' and before ']'! [ condition ]
if [ "$DEPLOY" == "deploy" ]
then
    SCRIPT_PATH="/home/deploy/waseda-syllabus-scraper/server/"
    VIRTUAL_ENV_PATH="/home/deploy/deploy-virtual-env/"
    PROJECT_PATH="/home/deploy/waseda-syllabus-scraper/"
    DB_NAME="syllabus"
    DB_PREV_NAME="${DB_NAME}_prev"
    API_PATH="/var/www/api/${YEAR}/"
fi
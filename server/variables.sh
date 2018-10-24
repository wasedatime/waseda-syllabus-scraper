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

raw="raw_"
academic_year=$(get_academic_year)
next_academic_year=$((academic_year + 1))
entire_academic_year="entire_${academic_year}"

school_PSE="PSE"
school_LAW="LAW"
school_EDU="EDU"
school_SOC="SOC"
school_SSS="SSS"
school_HUM="HUM"
school_SPS="SPS"
school_SILS="SILS"
school_CMS="CMS"
school_HSS="HSS"
school_EHUM="EHUM"
school_FSE="FSE"
school_CSE="CSE"
school_ASE="ASE"
school_G_PS="G_PS"
school_G_E="G_E"
school_G_LAW="G_LAW"
school_G_LAS="G_LAS"
school_G_SC="G_SC"
school_G_EDU="G_EDU"
school_G_HUM="G_HUM"
school_G_SSS="G_SSS"
school_G_SAPS="G_SAPS"
school_G_ITS="G_ITS"
school_G_SJAL="G_SJAL"
school_G_IPS="G_IPS"
school_G_WOSPM="G_WOSPM"
school_G_WLS="G_WLS"
school_G_SA="G_SA"
school_G_SPS="G_SPS"
school_G_FSE="G_FSE"
school_G_CSE="G_CSE"
school_G_ASE="G_ASE"
school_G_WEEE="G_WEEE"
school_G_SICCS="G_SICCS"
school_G_WBS="G_WBS"
school_ART="ART"
school_CJL="CJL"
school_CIE="CIE"
school_GEC="GEC"


schools_sci_eng="fund_sci_eng,cre_sci_eng,adv_sci_eng"
school_pse="poli_sci"
school_sils="sils"
school_sss="sss"
school_cjl="cjl"
school_sports_sci="sports_sci"

# Raw collections
raw_entire_year_courses_all="${raw}${entire_academic_year}_all"
raw_entire_year_courses_sci_eng="${raw}${entire_academic_year}_courses_sci_eng"
raw_entire_year_courses_pse="${raw}${entire_academic_year}_courses_pse"
raw_entire_year_courses_sils="${raw}${entire_academic_year}_courses_sils"
raw_entire_year_courses_sss="${raw}${entire_academic_year}_courses_sss"
raw_entire_year_courses_cjl="${raw}${entire_academic_year}_courses_cjl"
raw_entire_year_courses_sports_sci="${raw}${entire_academic_year}_courses_sports_sci"

entire_year_courses_all="${entire_academic_year}_courses_all"
entire_year_courses_sci_eng="${entire_academic_year}_courses_sci_eng"
entire_year_courses_pse="${entire_academic_year}_courses_pse"
entire_year_courses_sils="${entire_academic_year}_courses_sils"
entire_year_courses_sss="${entire_academic_year}_courses_sss"
entire_year_courses_cjl="${entire_academic_year}_courses_cjl"
entire_year_courses_sports_sci="${entire_academic_year}_courses_sports_sci"

YEAR=${academic_year}-${next_academic_year}
SCRIPT_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper/server/"
VIRTUAL_ENV_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper-personal-virtualenv/"
PROJECT_PATH="/Users/oscar/PythonProjects/waseda-syllabus-scraper/"
DB_NAME="test"
DB_PREV_NAME="${DB_NAME}_prev"
API_PATH="/Users/oscar/WebDev/wasetime-api/api/static/${YEAR}/"

# Don't for get spaces after '[' and before ']'! [ condition ]
if [ "$DEPLOY" = "deploy" ]; then
    SCRIPT_PATH="/home/deploy/waseda-syllabus-scraper/server/"
    VIRTUAL_ENV_PATH="/home/deploy/deploy-virtual-env/"
    PROJECT_PATH="/home/deploy/waseda-syllabus-scraper/"
    DB_NAME="syllabus"
    DB_PREV_NAME="${DB_NAME}_prev"
    API_PATH="/var/www/api/static/${YEAR}/"
fi
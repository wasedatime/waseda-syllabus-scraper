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

arr=( $(jq '.[]' academics.json ) )

school_ALL="ALL"
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
# Raw collections
raw="raw"
courses="courses"

#entire_year_courses_all="${entire_academic_year}_courses_all"
#entire_year_courses_sci_eng="${entire_academic_year}_courses_sci_eng"
#entire_year_courses_pse="${entire_academic_year}_courses_pse"
#entire_year_courses_sils="${entire_academic_year}_courses_sils"
#entire_year_courses_sss="${entire_academic_year}_courses_sss"
#entire_year_courses_cjl="${entire_academic_year}_courses_cjl"
#entire_year_courses_sports_sci="${entire_academic_year}_courses_sports_sci"

entire_year_courses_ALL=$(            concat_variables ${entire_academic_year} ${courses} ${school_ALL})
entire_year_courses_PSE=$(            concat_variables ${entire_academic_year} ${courses} ${school_PSE})
entire_year_courses_LAW=$(            concat_variables ${entire_academic_year} ${courses} ${school_LAW})
entire_year_courses_EDU=$(            concat_variables ${entire_academic_year} ${courses} ${school_EDU})
entire_year_courses_SOC=$(            concat_variables ${entire_academic_year} ${courses} ${school_SOC})
entire_year_courses_SSS=$(            concat_variables ${entire_academic_year} ${courses} ${school_SSS})
entire_year_courses_HUM=$(            concat_variables ${entire_academic_year} ${courses} ${school_HUM})
entire_year_courses_SPS=$(            concat_variables ${entire_academic_year} ${courses} ${school_SPS})
entire_year_courses_SILS=$(           concat_variables ${entire_academic_year} ${courses} ${school_SILS})
entire_year_courses_CMS=$(            concat_variables ${entire_academic_year} ${courses} ${school_CMS})
entire_year_courses_HSS=$(            concat_variables ${entire_academic_year} ${courses} ${school_HSS})
entire_year_courses_EHUM=$(           concat_variables ${entire_academic_year} ${courses} ${school_EHUM})
entire_year_courses_FSE=$(            concat_variables ${entire_academic_year} ${courses} ${school_FSE})
entire_year_courses_CSE=$(            concat_variables ${entire_academic_year} ${courses} ${school_CSE})
entire_year_courses_ASE=$(            concat_variables ${entire_academic_year} ${courses} ${school_ASE})
entire_year_courses_G_PS=$(           concat_variables ${entire_academic_year} ${courses} ${school_G_PS})
entire_year_courses_G_E=$(            concat_variables ${entire_academic_year} ${courses} ${school_G_E})
entire_year_courses_G_LAW=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_LAW})
entire_year_courses_G_LAS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_LAS})
entire_year_courses_G_SC=$(           concat_variables ${entire_academic_year} ${courses} ${school_G_SC})
entire_year_courses_G_EDU=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_EDU})
entire_year_courses_G_HUM=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_HUM})
entire_year_courses_G_SSS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_SSS})
entire_year_courses_G_SAPS=$(         concat_variables ${entire_academic_year} ${courses} ${school_G_SAPS})
entire_year_courses_G_ITS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_ITS})
entire_year_courses_G_SJAL=$(         concat_variables ${entire_academic_year} ${courses} ${school_G_SJAL})
entire_year_courses_G_IPS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_IPS})
entire_year_courses_G_WOSPM=$(        concat_variables ${entire_academic_year} ${courses} ${school_G_WOSPM})
entire_year_courses_G_WLS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_WLS})
entire_year_courses_G_SA=$(           concat_variables ${entire_academic_year} ${courses} ${school_G_SA})
entire_year_courses_G_SPS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_SPS})
entire_year_courses_G_FSE=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_FSE})
entire_year_courses_G_CSE=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_CSE})
entire_year_courses_G_ASE=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_ASE})
entire_year_courses_G_WEEE=$(         concat_variables ${entire_academic_year} ${courses} ${school_G_WEEE})
entire_year_courses_G_SICCS=$(        concat_variables ${entire_academic_year} ${courses} ${school_G_SICCS})
entire_year_courses_G_WBS=$(          concat_variables ${entire_academic_year} ${courses} ${school_G_WBS})
entire_year_courses_ART=$(            concat_variables ${entire_academic_year} ${courses} ${school_ART})
entire_year_courses_CJL=$(            concat_variables ${entire_academic_year} ${courses} ${school_CJL})
entire_year_courses_CIE=$(            concat_variables ${entire_academic_year} ${courses} ${school_CIE})
entire_year_courses_GEC=$(            concat_variables ${entire_academic_year} ${courses} ${school_GEC})

#raw_entire_year_courses_all="${raw}${entire_academic_year}_all"
#raw_entire_year_courses_sci_eng="${raw}${entire_academic_year}_courses_sci_eng"
#raw_entire_year_courses_pse="${raw}${entire_academic_year}_courses_pse"
#raw_entire_year_courses_sils="${raw}${entire_academic_year}_courses_sils"
#raw_entire_year_courses_sss="${raw}${entire_academic_year}_courses_sss"
#raw_entire_year_courses_cjl="${raw}${entire_academic_year}_courses_cjl"
#raw_entire_year_courses_sports_sci="${raw}${entire_academic_year}_courses_sports_sci"

raw_entire_year_courses_ALL=$(            concat_variables ${raw} ${entire_year_courses_ALL})
raw_entire_year_courses_PSE=$(            concat_variables ${raw} ${entire_year_courses_PSE})
raw_entire_year_courses_LAW=$(            concat_variables ${raw} ${entire_year_courses_LAW})
raw_entire_year_courses_EDU=$(            concat_variables ${raw} ${entire_year_courses_EDU})
raw_entire_year_courses_SOC=$(            concat_variables ${raw} ${entire_year_courses_SOC})
raw_entire_year_courses_SSS=$(            concat_variables ${raw} ${entire_year_courses_SSS})
raw_entire_year_courses_HUM=$(            concat_variables ${raw} ${entire_year_courses_HUM})
raw_entire_year_courses_SPS=$(            concat_variables ${raw} ${entire_year_courses_SPS})
raw_entire_year_courses_SILS=$(           concat_variables ${raw} ${entire_year_courses_SILS})
raw_entire_year_courses_CMS=$(            concat_variables ${raw} ${entire_year_courses_CMS})
raw_entire_year_courses_HSS=$(            concat_variables ${raw} ${entire_year_courses_HSS})
raw_entire_year_courses_EHUM=$(           concat_variables ${raw} ${entire_year_courses_EHUM})
raw_entire_year_courses_FSE=$(            concat_variables ${raw} ${entire_year_courses_FSE})
raw_entire_year_courses_CSE=$(            concat_variables ${raw} ${entire_year_courses_CSE})
raw_entire_year_courses_ASE=$(            concat_variables ${raw} ${entire_year_courses_ASE})
raw_entire_year_courses_G_PS=$(           concat_variables ${raw} ${entire_year_courses_G_PS})
raw_entire_year_courses_G_E=$(            concat_variables ${raw} ${entire_year_courses_G_E})
raw_entire_year_courses_G_LAW=$(          concat_variables ${raw} ${entire_year_courses_G_LAW})
raw_entire_year_courses_G_LAS=$(          concat_variables ${raw} ${entire_year_courses_G_LAS})
raw_entire_year_courses_G_SC=$(           concat_variables ${raw} ${entire_year_courses_G_SC})
raw_entire_year_courses_G_EDU=$(          concat_variables ${raw} ${entire_year_courses_G_EDU})
raw_entire_year_courses_G_HUM=$(          concat_variables ${raw} ${entire_year_courses_G_HUM})
raw_entire_year_courses_G_SSS=$(          concat_variables ${raw} ${entire_year_courses_G_SSS})
raw_entire_year_courses_G_SAPS=$(         concat_variables ${raw} ${entire_year_courses_G_SAPS})
raw_entire_year_courses_G_ITS=$(          concat_variables ${raw} ${entire_year_courses_G_ITS})
raw_entire_year_courses_G_SJAL=$(         concat_variables ${raw} ${entire_year_courses_G_SJAL})
raw_entire_year_courses_G_IPS=$(          concat_variables ${raw} ${entire_year_courses_G_IPS})
raw_entire_year_courses_G_WOSPM=$(        concat_variables ${raw} ${entire_year_courses_G_WOSPM})
raw_entire_year_courses_G_WLS=$(          concat_variables ${raw} ${entire_year_courses_G_WLS})
raw_entire_year_courses_G_SA=$(           concat_variables ${raw} ${entire_year_courses_G_SA})
raw_entire_year_courses_G_SPS=$(          concat_variables ${raw} ${entire_year_courses_G_SPS})
raw_entire_year_courses_G_FSE=$(          concat_variables ${raw} ${entire_year_courses_G_FSE})
raw_entire_year_courses_G_CSE=$(          concat_variables ${raw} ${entire_year_courses_G_CSE})
raw_entire_year_courses_G_ASE=$(          concat_variables ${raw} ${entire_year_courses_G_ASE})
raw_entire_year_courses_G_WEEE=$(         concat_variables ${raw} ${entire_year_courses_G_WEEE})
raw_entire_year_courses_G_SICCS=$(        concat_variables ${raw} ${entire_year_courses_G_SICCS})
raw_entire_year_courses_G_WBS=$(          concat_variables ${raw} ${entire_year_courses_G_WBS})
raw_entire_year_courses_ART=$(            concat_variables ${raw} ${entire_year_courses_ART})
raw_entire_year_courses_CJL=$(            concat_variables ${raw} ${entire_year_courses_CJL})
raw_entire_year_courses_CIE=$(            concat_variables ${raw} ${entire_year_courses_CIE})
raw_entire_year_courses_GEC=$(            concat_variables ${raw} ${entire_year_courses_GEC})

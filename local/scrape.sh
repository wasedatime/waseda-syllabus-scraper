#!/usr/bin/env bash

# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd ~/PythonProjects/waseda-syllabus-scraper/wsl_spider

# TODO add -c for collection from terminal
# TODO Add sils, pse
# TODO mongoexport --db syllabus_2018 -c entire_2018_courses_sci_eng --out test.json --jsonArray --pretty
# TODO Nginx static files
# TODO jq, split json https://stackoverflow.com/questions/28744361/split-a-json-file-into-separate-files?noredirect=1&lq=1

raw="raw_"
year="2018"
entireYear="entire_${year}"

schoolsSciEng="fund_sci_eng,cre_sci_eng,adv_sci_eng"

# Collections
rawEntireYearCoursesAll="${raw}${entireYear}_all"
rawEntireYearCoursesSciEng="${raw}${entireYear}_courses_sci_eng"
rawEntireYearCoursesPSE="${raw}${entireYear}_courses_pse"
rawEntireYearCoursesSILS="${raw}${entireYear}_courses_sils"

scrape () {
    # Wrap the argument in quotes to tell the shell to ignore spaces in it
    ~/PythonProjects/waseda-syllabus-scraper-personal-virtualenv/bin/python3 \
    ~/PythonProjects/waseda-syllabus-scraper/wsl_spider/wsl_spider/run_search.py \
    -d "$1" -s "$2" -t "$3" -k "$4" -c "$5"
}

# displayed_language, schools, teaching_language, single_keyword, collection

scrape "en" ${schoolsSciEng} "all" "" ${rawEntireYearCoursesSciEng} \
&& scrape "en" ${schoolsSciEng} "jp" "" ${rawEntireYearCoursesSciEng} \
&& scrape "en" ${schoolsSciEng} "en" "" ${rawEntireYearCoursesSciEng} \
&& scrape "en" ${schoolsSciEng} "all" "IPSE" ${rawEntireYearCoursesSciEng} \
&& scrape "en" ${schoolsSciEng} "all" "English-based Undergraduate Program" ${rawEntireYearCoursesSciEng} \

# "en" "poli_sci" "all" "" ${rawEntireYearCoursesPSE}
# "en" "poli_sci" "en" "" ${rawEntireYearCoursesPSE}
# "en" "poli_sci" "jp" "" ${rawEntireYearCoursesPSE}
# "en" "sils" "all" "" ${rawEntireYearCoursesSILS}
# "en" "sils" "en" "" ${rawEntireYearCoursesSILS}
# "en" "sils" "jp" "" ${rawEntireYearCoursesSILS}

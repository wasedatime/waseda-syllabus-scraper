#!/usr/bin/env bash

if [$USER == "deploy"]; then
    mongo localhost:27017/syllabus /home/deploy/waseda-syllabus-scraper/js/dropCollection.js \
    && mongo localhost:27017/syllabus /home/deploy/waseda-syllabus-scraper/js/aggregate.js \
    && source /home/deploy/waseda-syllabus-scraper/server/export.sh
else
    mongo localhost:27017/syllabus_2018 /Users/oscar/PythonProjects/waseda-syllabus-scraper/js/dropCollection.js \
    && mongo localhost:27017/syllabus_2018 /Users/oscar/PythonProjects/waseda-syllabus-scraper/js/aggregate.js
fi

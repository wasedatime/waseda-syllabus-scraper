#!/bin/bash

# Don't for get spaces after '[' and before ']'! [ condition ]
if [ "$DEPLOY" == "deploy" ]
then
    mongo localhost:27017/syllabus /home/deploy/waseda-syllabus-scraper/js/dropAggregatedCollections.js \
    && mongo localhost:27017/syllabus /home/deploy/waseda-syllabus-scraper/js/aggregate.js
else
    mongo localhost:27017/syllabus_2018 /Users/oscar/PythonProjects/waseda-syllabus-scraper/js/dropAggregatedCollections.js \
    && mongo localhost:27017/syllabus_2018 /Users/oscar/PythonProjects/waseda-syllabus-scraper/js/aggregate.js
fi

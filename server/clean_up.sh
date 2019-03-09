#!/bin/bash

source variables.sh
echo "Clean up database..."
for e in "${academics_to_scrape[@]}"
do
    raw_entire_year_courses_academic=raw_entire_year_courses_${e}
    echo "Dropping raw collection ${!raw_entire_year_courses_academic} in database ${DB_NAME}"
    mongo ${DB_NAME} --eval "printjson(db.${!raw_entire_year_courses_academic}.drop())"
done \
&& echo "Clean up finished."
#!/bin/bash

source variables.sh

# drop database_prev
echo "Dropping database_prev"
mongo ${DB_PREV_NAME} --eval "printjson(db.dropDatabase())"
# copy database to database_prev (back up)
echo "Copying current database to database_prev"
mongo ${DB_NAME} --eval "printjson(db.copyDatabase('${DB_NAME}', '${DB_PREV_NAME}'))"

echo "Clean up raw collections in database..."
for e in "${academics_to_scrape[@]}"
do
    raw_entire_year_courses_academic=raw_entire_year_courses_${e}
    echo "Dropping raw collection ${!raw_entire_year_courses_academic} in database ${DB_NAME}"
    mongo ${DB_NAME} --eval "printjson(db.${!raw_entire_year_courses_academic}.drop())"
done \
&& echo "Clean up finished."
#!/bin/bash

# drop syllabus_prev
mongo syllabus_prev --eval "printjson(db.dropDatabase())"
# copy syllabus to syllabus_prev
mongo syllabus --eval "printjson(db.copyDatabase('syllabus', 'syllabus_prev'))"
# drop syllabus
mongo syllabus --eval "printjson(db.dropDatabase())"

# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd /home/deploy/waseda-syllabus-scraper/wsl_spider

# Use absolute path to execute run_search.py in a virtual environment, if succeed do aggregation
/home/deploy/deploy-virtual-env/bin/python3 /home/deploy/waseda-syllabus-scraper/wsl_spider/wsl_spider/run_search.py \
&& source /home/deploy/waseda-syllabus-scraper/server/aggregate.sh

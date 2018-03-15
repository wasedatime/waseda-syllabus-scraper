#!/bin/bash
source /home/deploy/waseda-syllabus-scraper/server/scrape.sh \
&& source /home/deploy/waseda-syllabus-scraper/server/aggregate.sh \
&& source /home/deploy/waseda-syllabus-scraper/server/export_dev.sh \
&& source /home/deploy/export_prod.sh

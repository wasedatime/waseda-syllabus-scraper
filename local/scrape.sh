#!/usr/bin/env bash

# Change directory for Scrapy to detect scrapy.cfg properly. Or else it returns no active project
cd ~/PythonProjects/waseda-syllabus-scraper/wsl_spider

~/PythonProjects/waseda-syllabus-scraper-personal-virtualenv/bin/python3 \
~/PythonProjects/waseda-syllabus-scraper/wsl_spider/wsl_spider/run_search.py \
-s fund_sci_eng,cre_sci_eng,adv_sci_eng -k "IPSE" \
&& ~/PythonProjects/waseda-syllabus-scraper-personal-virtualenv/bin/python3 \
~/PythonProjects/waseda-syllabus-scraper/wsl_spider/wsl_spider/run_search.py \
-s fund_sci_eng,cre_sci_eng,adv_sci_eng -k "English-based Undergraduate Program"
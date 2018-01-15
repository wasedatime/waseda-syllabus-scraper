# Run this file to parse a single course page.

from scrapy import cmdline
cmdline.execute("scrapy crawl course_info".split())
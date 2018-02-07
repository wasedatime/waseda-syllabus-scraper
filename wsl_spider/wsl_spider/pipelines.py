# -*- coding: utf-8 -*-
import logging
import pymongo

from scrapy.exceptions import DropItem

# This pipeline drops a course if another course with the
# same title, instructor, year, term, and school is scraped already
#TODO: Check Financial Information and Business Valuation, consider adding day and period?
class DuplicatesPipeline(object):

    drop_item_msg = "Duplicate course, title: {}, instructor: {}"

    def __init__(self):
        self.hashes_seen = set()

    def process_item(self, item, spider):
        item_hash = hash((item['title'], item['instructor'], item['year'], item['term'], item['school']))
        if item_hash in self.hashes_seen:
            raise DropItem(self.drop_item_msg.format(item['title'], item['instructor']))
        else:
            self.hashes_seen.add(item_hash)
            return item

# This pipeline produces a hash according to the title, instructor, year, and term of a course.
# It's result will be used in MongoDB aggregation framework to group courses together.
# Currently it uses the default hash() provided by python, which produces a different result every time we rerun.
# Check out Stack Overflow "hash function in Python 3.3 returns different results between sessions"
# See https://docs.python.org/3/using/cmdline.html#envvar-PYTHONHASHSEED
class HashPipeline(object):

    def __init__(self):
        return

    def process_item(self, item, spider):
        # TODO: Set a fixed PYTHONHASHSEED environment variable or use hashlib for stable hashing
        item_hash = hash((item['title'], item['instructor'], item['year'], item['term']))
        item['hash'] = item_hash
        return item

# This pipeline exports the result to MongoDB.
class MongoPipeline(object):

    def __init__(self, mongo_uri, mongo_db, mongo_col):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
        self.mongo_col = mongo_col
        self.client = None
        self.db = None
        self.col = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri = crawler.settings.get('MONGO_URI'),
            mongo_db = crawler.settings.get('MONGO_DB'),
            mongo_col = crawler.settings.get('MONGO_COLLECTION')
        )

    def open_spider(self, spider):
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        self.col = self.db[self.mongo_col]

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        self.col.insert_one(dict(item))
        logging.log(logging.INFO, "Course '{}' is added to collection {}".format(item['title'], self.mongo_col))
        return item

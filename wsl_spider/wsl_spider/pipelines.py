# -*- coding: utf-8 -*-
import logging
import pymongo
from _datetime import datetime

from scrapy.exceptions import DropItem

# This pipeline drops a course if another course with the
# same title, instructor, year, term, and school is scraped already
#TODO: Consider a cleaner way of filteringi duplicates
class DuplicatesPipeline(object):

    drop_item_msg = "Duplicate course, title: {}, instructor: {}"

    def __init__(self):
        self.hashes_seen = set()

    def process_item(self, item, spider):
        # Take the first occurrence of the course
        occurrence = item['occurrences'][0]
        item_hash = hash((item['title'], item['instructor'], item['school'],
                          occurrence['day'], occurrence['start_period'], occurrence['end_period']))
        if item_hash in self.hashes_seen:
            raise DropItem(self.drop_item_msg.format(item['title'], item['instructor']))
        else:
            self.hashes_seen.add(item_hash)
            return item


class FilterByYearPipeline(object):

    drop_item_msg = "Year below lower bound course, year:{}, title: {}, instructor: {}"

    def __init__(self):
        self.lower_bound_year = 2017

    def process_item(self, item, spider):
        # Take the first occurrence of the course
        item_year = int(item['year'])
        if item_year <= self.lower_bound_year:
            raise DropItem(self.drop_item_msg.format(item_year, item['title'], item['instructor']))
        else:
            return item


# This pipeline exports the result to MongoDB.
class MongoPipeline(object):

    def __init__(self, mongo_uri, mongo_db, mongo_col, mongo_stats_col):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
        self.mongo_col = mongo_col
        self.mongo_stats_col = mongo_stats_col
        self.client = None
        self.db = None
        self.col = None
        self.stats_col = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri = crawler.settings.get('MONGO_URI'),
            mongo_db = crawler.settings.get('MONGO_DB'),
            mongo_col = crawler.settings.get('MONGO_COLLECTION'),
            mongo_stats_col = crawler.settings.get('MONGO_STATS_COLLECTION')
        )

    def open_spider(self, spider):
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        self.col = self.db[self.mongo_col]
        self.stats_col = self.db[self.mongo_stats_col]

    def close_spider(self, spider):
        now = datetime.now().replace(microsecond=0)
        self.stats_col.insert_one({'finish_time': str(now)})
        self.client.close()

    def process_item(self, item, spider):
        self.col.insert_one(dict(item))
        logging.log(logging.INFO, "Course '{}' is added to collection {}".format(item['title'], self.mongo_col))
        return item

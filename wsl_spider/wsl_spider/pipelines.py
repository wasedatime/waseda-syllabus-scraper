# -*- coding: utf-8 -*-
import logging
import pymongo

from scrapy.exceptions import DropItem


class FilterYearPipeline(object):

    drop_item_msg = "Dropping {} course, title: {}, instructor: {}"

    def __init__(self):
        return

    def process_item(self, item, spider):
        if item['year'] != '2017':
            raise DropItem(self.drop_item_msg.format(item['year'], item['title'], item['instructor']))
        else:
            return item


class DuplicatesPipeline(object):

    drop_item_msg = "Dropping duplicate course, title: {}, instructor: {}"

    def __init__(self):
        self.hashes_seen = set()

    def process_item(self, item, spider):
        item_hash = hash((item['title'], item['instructor'], item['year'], item['term'], item['school']))
        if item_hash in self.hashes_seen:
            raise DropItem(self.drop_item_msg.format(item['title'], item['instructor']))
        else:
            self.hashes_seen.add(item_hash)
            return item


class HashPipeline(object):

    def __init__(self):
        return

    def process_item(self, item, spider):
        item_hash = hash((item['title'], item['instructor'], item['year'], item['term']))
        item['hash'] = item_hash
        return item


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

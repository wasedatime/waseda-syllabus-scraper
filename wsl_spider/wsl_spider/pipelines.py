# -*- coding: utf-8 -*-
import logging
import pymongo


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
        logging.log(logging.INFO, "Course '{}' is added to MongoDB".format(item['title']))

        return item

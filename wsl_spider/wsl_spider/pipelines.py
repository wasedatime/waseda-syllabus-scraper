# -*- coding: utf-8 -*-
import logging
import pymongo
from _datetime import datetime

from scrapy.exceptions import DropItem

# This pipeline drops a course if another course with the
# same title, instructor, year, term, and school is scraped already
#TODO: Consider a better way of filtering duplicates
class DuplicatesPipeline(object):

    drop_item_msg = "Duplicate course, title: {}, instructor: {}"

    def __init__(self):
        self.hashes_seen = set()

    def process_item(self, item, spider):
        # Take the first occurrence of the course
        occurrence = item['occurrences'][0]
        item_hash = hash((item['title'], item['instructor'], item['school'], item['term'],
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


class RenameCourseTermPipeline(object):
    terms = {
        'spring': 'Spring',
        'summer': 'Summer',
        'fall': 'Fall',
        'winter': 'Winter',

        'springQuarter': 'Spring Quarter',
        'summerQuarter': 'Summer Quarter',
        'fallQuarter': 'Fall Quarter',
        'winterQuarter': 'Winter Quarter',
        'fullYear': 'Full Year',

        'intensiveSpring': 'Intensive: Spring',
        'intensiveFall': 'Intensive: Fall',
        'intensiveSpringFall': 'Intensive: Spring & Fall',

    }

    termMap = {
        '秋学期': terms['fall'],
        'fall semester': terms['fall'],
        '春学期': terms['spring'],
        'spring semester': terms['spring'],

        '春クォーター': terms['springQuarter'],
        'spring quarter': terms['springQuarter'],
        '夏クォーター': terms['summerQuarter'],
        'summer quarter': terms['summerQuarter'],
        '秋クォーター': terms['fallQuarter'],
        'fall quarter': terms['fallQuarter'],
        '冬クォーター': terms['winterQuarter'],
        'winter quarter': terms['winterQuarter'],
        '通年': terms['fullYear'],
        'full year': terms['fullYear'],

        '集中講義（春学期）': terms['intensiveSpring'],
        'an intensive course(spring)': terms['intensiveSpring'],
        '集中講義（秋学期）': terms['intensiveFall'],
        'an intensive course(fall)': terms['intensiveFall'],
        '集中（春・秋学期）': terms['intensiveSpringFall'],
        'an intensive course(spring and fall)': terms['intensiveSpringFall'],

        # Due to Waseda's inconsistent data in SSS.
        '夏季集中': 'Summer',
        'summer': 'Summer',
        'spring': 'Spring',
        'spring semester and summer': 'Spring'
    }

    def process_item(self, item, spider):
        item['term'] = self.termMap[item['term']]
        return item


class RenameCourseSchoolPipeline(object):
    schoolMap = {
        'Schl of Fund Sci/Eng': 'FSE',
        'Schl Cre Sci/Eng': 'CSE',
        'Schl Adv Sci/Eng': 'ASE',
        'Schl Political Sci/Econo': 'PSE',
        'SILS': 'SILS',
        'Schl Social Sci': 'SSS',
        'CJL': 'CJL',
        'Schl Sport Sci': 'SPS'
    }

    def process_item(self, item, spider):
        item['school'] = self.schoolMap[item['school']]
        return item


class RenameCourseLangPipeline(object):
    langMap = {
        'en': "EN",
        'jp': "JP",
        'others': "others"
    }

    def process_item(self, item, spider):
        item['lang'] = self.langMap[item['lang']]
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
        # use default mongo db and collection in settings.py if not specified by user
        self.db = self.client[self.mongo_db] if spider.mongo_db == "" else self.client[spider.mongo_db]
        self.col = self.db[self.mongo_col] if spider.mongo_col == "" else self.db[spider.mongo_col]
        self.stats_col = self.db[self.mongo_stats_col]

    def close_spider(self, spider):
        now = datetime.now().replace(microsecond=0)
        self.stats_col.drop()
        self.stats_col.insert_one({'finish_time': str(now)})
        self.client.close()

    def update_item_keyword(self, item_title, item_id, keywords):
        # If keywords is absent in the document to update,
        # $addToSet creates the array field with the specified value as its element.
        self.col.update_one({'_id': item_id}, {"$addToSet": {'keywords': {"$each": keywords}}})
        logging.log(logging.INFO, "Add program '{}' to {} in collection {}".format(keywords, item_title, self.col.name))

    def update_item_lang(self, item_title, item_id, lang):
        self.col.update_one({'_id': item_id}, {"$set": {'lang': lang}})
        logging.log(logging.INFO, "Set lang '{}' for {} in collection {}".format(lang, item_title, self.col.name))

    def add_item_title_jp(self, item_title_jp, item_id):
        self.col.update_one({'_id': item_id}, {"$set": {'title_jp': item_title_jp}})
        logging.log(logging.INFO, "Add title_jp '{}' for id {} in collection {}".format(item_title_jp, item_id, self.col.name))

    def process_item(self, item, spider):
        try:
            self.col.insert_one(dict(item))
            logging.log(logging.INFO, "Course '{}' is added to collection {}".format(item['title'], self.col.name))
        except pymongo.errors.DuplicateKeyError:
            logging.log(logging.WARNING, "Duplicate Key Course.")
            item_id = item['_id']
            item_title = item['title']
            item_lang = item['lang']
            if spider.display_lang == "jp":
                self.add_item_title_jp(item_title, item_id)
            elif "keywords" in item:
                self.update_item_keyword(item_title, item_id, item['keywords'])
            elif item['lang'] != "others":
                self.update_item_lang(item_title, item_id, item_lang)

        return item

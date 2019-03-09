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
        'springSem': 'springSem',
        'fallSem': 'fallSem',

        'springQuart': 'springQuart',
        'summerQuart': 'summerQuart',
        'fallQuart': 'fallQuart',
        'winterQuart': 'winterQuart',
        'fullYear': 'fullYear',

        'intensiveSpringSem': 'intensiveSpringSem',
        'intensiveFallSem': 'intensiveFallSem',
        'intensiveSpringFallSem': 'intensiveSpringFallSem',

        'intensiveSpring': 'intensiveSpring',
        'intensiveSummer': 'intensiveSummer',
        'intensiveFall': 'intensiveFall',
        'intensiveWinter': 'intensiveWinter',
        'springSummer': 'springSummer',
        'fallWinter': 'fallWinter'
    }

    termMap = {
        '春学期': terms['springSem'],
        '秋学期': terms['fallSem'],

        '春クォーター': terms['springQuart'],
        '夏クォーター': terms['summerQuart'],
        '秋クォーター': terms['fallQuart'],
        '冬クォーター': terms['winterQuart'],
        '通年': terms['fullYear'],

        '集中講義(春学期)': terms['intensiveSpringSem'],
        '集中講義(秋学期)': terms['intensiveFallSem'],
        '集中(春・秋学期)': terms['intensiveSpringFallSem'],

        '春季集中': terms['intensiveSpring'],
        '夏季集中': terms['intensiveSummer'],
        '秋季集中': terms['intensiveFall'],
        '冬季集中': terms['intensiveWinter'],
        '春夏期': terms['springSummer'],
        '秋冬期': terms['fallWinter']
    }

    def process_item(self, item, spider):
        term = item['term']
        if spider.display_lang == "jp":
            try:
                item['term'] = self.termMap[term]
            except KeyError:
                title = item['title']
                school = item['school']
                logging.log(logging.ERROR, "Cannot map term: {} for title: {} in school: {}".format(term, title, school))
        return item


class RenameCourseSchoolPipeline(object):
    school_name_to_code_map = {}

    def open_spider(self, spider):
        for k, v in spider.academics_json.items():
            # Invert code and school_name from academics_json
            self.school_name_to_code_map[v['jp']] = k
            self.school_name_to_code_map[v['en']] = k

    def process_item(self, item, spider):
        item['school'] = self.school_name_to_code_map[item['school']]
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

    def set_item_lang(self, item_title, item_id, lang):
        self.col.update_one({'_id': item_id}, {"$set": {'lang': lang}})
        logging.log(logging.INFO, "Set lang '{}' for {} in collection {}".format(lang, item_title, self.col.name))

    def add_item_title_jp(self, item_title_jp, item_id):
        self.col.update_one({'_id': item_id}, {"$set": {'title_jp': item_title_jp}})
        logging.log(logging.INFO, "Add title_jp '{}' for id {} in collection {}".format(item_title_jp, item_id, self.col.name))

    def add_item_instructor_jp(self, item_instructor_jp, item_id):
        self.col.update_one({'_id': item_id}, {"$set": {'instructor_jp': item_instructor_jp}})
        logging.log(logging.INFO, "Add instructor_jp '{}' for id {} in collection {}".format(item_instructor_jp, item_id, self.col.name))

    def set_item_term_jp(self, item_term, item_id):
        self.col.update_one({'_id': item_id}, {"$set": {'term': item_term}})
        logging.log(logging.INFO, "Set term '{}' for id {} in collection {}".format(item_term, item_id, self.col.name))

    def process_item(self, item, spider):
        try:
            self.col.insert_one(dict(item))
            logging.log(logging.INFO, "Course '{}' is added to collection {}".format(item['title'], self.col.name))
        except pymongo.errors.DuplicateKeyError:
            logging.log(logging.WARNING, "Duplicate Key Course.")
            item_id = item['_id']
            item_title = item['title']
            if spider.display_lang == "jp":
                item_instructor = item['instructor']
                item_term = item['term']
                self.add_item_title_jp(item_title, item_id)
                self.add_item_instructor_jp(item_instructor, item_id)
                self.set_item_term_jp(item_term, item_id)
            elif "keywords" in item:
                self.update_item_keyword(item_title, item_id, item['keywords'])
            elif item['lang'] != "others":
                item_lang = item['lang']
                self.set_item_lang(item_title, item_id, item_lang)

        return item

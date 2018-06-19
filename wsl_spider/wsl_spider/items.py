# -*- coding: utf-8 -*-
import unicodedata
import re

from scrapy.item import Item, Field
from scrapy.loader import ItemLoader
from scrapy.loader.processors import Identity, TakeFirst, MapCompose


def normalize_characters(value):
    return unicodedata.normalize('NFKC', value)


def weekday_to_int(day):
    w_t_n = {
        'Sun': 0,
        'Mon': 1,
        'Tues': 2,
        'Wed': 3,
        'Thur': 4,
        'Fri': 5,
        'Sat': 6
    }
    try:
        return w_t_n[day]
    except KeyError:
        return -1


def string_to_int(string):
    try:
        int(string)
        return int(string)
    except ValueError:
        return -1


def onclick_url_to_id(onclick_url):
    # pKey is the query parameter used in waseda's syllabus website. We stick with its original name for now.
    onclick_match = re.match(r"post_submit\(\'(?P<php>\w{6})\w*', '(?P<pKey>\w+)'\)", onclick_url)
    _id = onclick_match.group('pKey')
    return _id


def create_keyword_list(keyword):
    # Create a list for str to be inserted in MongoDB.
    if type(keyword) is str:
        return [keyword]
    else:
        raise ValueError("Type of a keyword should a str.")


class Course(Item):
    _id = Field()
    title = Field()
    instructor = Field()
    year = Field()
    term = Field()
    school = Field()
    keywords = Field()
    lang = Field()
    occurrences = Field()
    code = Field()


class Occurrence(Item):
    day = Field()
    start_period = Field()
    end_period = Field()
    start_time = Field()
    end_time = Field()
    location = Field()
    building = Field()
    classroom = Field()


class CourseLoader(ItemLoader):
    default_item_class = Course
    default_output_processor = TakeFirst()

    title_in = MapCompose(str.strip, normalize_characters)
    title_out = TakeFirst()

    instructor_in = MapCompose(str.strip, normalize_characters)
    instructor_out = TakeFirst()

    year_in = MapCompose(str.strip, normalize_characters, string_to_int)
    year_out = TakeFirst()

    term_in = MapCompose(str.strip, normalize_characters)
    term_out = TakeFirst()

    school_in = MapCompose(str.strip, normalize_characters)
    school_out = TakeFirst()

    keywords_in = MapCompose(create_keyword_list)
    keywords_out = Identity()

    lang_in = MapCompose(str.strip, normalize_characters)
    lang_out = TakeFirst()

    occurrences_out = Identity()

    _id_in = MapCompose(str.strip, normalize_characters, onclick_url_to_id)
    _id_out = TakeFirst()

    code_in = MapCompose(str.strip, normalize_characters)
    code_out = TakeFirst()


class OccurrenceLoader(ItemLoader):
    default_item_class = Occurrence
    default_output_processor = TakeFirst()

    day_in = MapCompose(str.strip, normalize_characters, weekday_to_int)
    day_out = TakeFirst()

    start_period_in = MapCompose(str.strip, normalize_characters, string_to_int)
    start_period_out = TakeFirst()

    end_period_in = MapCompose(str.strip, normalize_characters, string_to_int)
    end_period_out = TakeFirst()

    building_in = MapCompose(str.strip, normalize_characters)
    building_out = TakeFirst()

    classroom_in = MapCompose(str.strip, normalize_characters)
    classroom_out = TakeFirst()

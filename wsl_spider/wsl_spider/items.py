# -*- coding: utf-8 -*-
import unicodedata

from scrapy.item import Item, Field
from scrapy.loader import ItemLoader
from scrapy.loader.processors import Identity, TakeFirst, MapCompose


def normalize_characters(value):
    return unicodedata.normalize('NFKC', value)


def weekday_to_number(day):
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


class Course(Item):
    title = Field()
    instructor = Field()
    year = Field()
    term = Field()
    school = Field()
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

    year_in = MapCompose(str.strip, normalize_characters)
    year_out = TakeFirst()

    term_in = MapCompose(str.strip, normalize_characters)
    term_out = TakeFirst()

    school_in = MapCompose(str.strip, normalize_characters)
    school_out = TakeFirst()

    occurrences_out = Identity()

    code_in = MapCompose(str.strip, normalize_characters)
    code_out = TakeFirst()


class OccurrenceLoader(ItemLoader):
    default_item_class = Occurrence
    default_output_processor = TakeFirst()

    day_in = MapCompose(str.strip, normalize_characters, weekday_to_number)
    day_out = TakeFirst()

    start_period_in = MapCompose(str.strip, normalize_characters)
    start_period_out = TakeFirst()

    end_period_in = MapCompose(str.strip, normalize_characters)
    end_period_out = TakeFirst()

    building_in = MapCompose(str.strip, normalize_characters)
    building_out = TakeFirst()

    classroom_in = MapCompose(str.strip, normalize_characters)
    classroom_out = TakeFirst()


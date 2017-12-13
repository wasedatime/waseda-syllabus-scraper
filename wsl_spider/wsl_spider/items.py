# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# http://doc.scrapy.org/en/latest/topics/items.html

from scrapy.item import Item, Field
from scrapy.loader import ItemLoader
from scrapy.loader.processors import Identity, TakeFirst, MapCompose


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
        return 7


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
    building = Field()
    classroom = Field()


class CourseLoader(ItemLoader):
    default_item_class = Course
    default_output_processor = TakeFirst()

    title_in = MapCompose(str.strip)
    title_out = TakeFirst()

    instructor_in = MapCompose(str.strip)
    instructor_out = TakeFirst()

    year_in = MapCompose(str.strip)
    year_out = TakeFirst()

    term_in = MapCompose(str.strip)
    term_out = TakeFirst()

    school_in = MapCompose(str.strip)
    school_out = TakeFirst()

    occurrences_out = Identity()

    code_in = MapCompose(str.strip)
    code_out = TakeFirst()


class OccurrenceLoader(ItemLoader):
    default_item_class = Occurrence
    default_output_processor = TakeFirst()

    day_in = MapCompose(str.strip, weekday_to_number)
    day_out = TakeFirst()

    start_period_in = MapCompose(str.strip)
    start_period_out = TakeFirst()

    end_period_in = MapCompose(str.strip)
    end_period_out = TakeFirst()

    building_in = MapCompose(str.strip)
    building_out = TakeFirst()

    classroom_in = MapCompose(str.strip)
    classroom_out = TakeFirst()


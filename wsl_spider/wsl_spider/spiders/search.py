# -*- coding: utf-8 -*-
import re
from time import sleep

from scrapy.selector import Selector
from scrapy.spiders import Spider
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

from wsl_spider.items import CourseLoader, OccurrenceLoader


############################
# TODO https://www.wsl.waseda.jp/syllabus/JAA103.php?pLng=en&p_number=100&p_page=1
# TODO https://www.wsl.waseda.jp/syllabus/js/custom/JAA103/JAA103.js
# TODO You can find the key in <a onclick></a> and insert it into JAA104.php
############################


class SearchSpider(Spider):
    name = 'search'
    allowed_domains = ['wsl.waseda.jp']
    basic_url = 'https://www.wsl.waseda.jp/syllabus/JAA103.php?'
    langs = {'Eng': "en", 'Jp': "jp"}
    terms = {'Full Year': "0", 'Spring': "1", 'Fall': "2", 'Others': "9"}
    schools = {
        # These two schools return little course results and are good for testing.
        'Art/Architecture Schl': "712001",
        'Sports Sci': "202003",

        'SILS': "212004",
        'Political Sci': "111973",
        'Fund Sci/Eng': "262006",
        'Cre Sci/Eng': "272006",
        'Adv Sci/Eng': "282006",

        # Returns results of every school.
        'All': ""
    }
    # Use dict to represent enum
    results_per_page_dict = {'10': "10", '20': "20", '50': "50", '100': "100"}

    # Change the target semester and school here.
    lang = 'pLng=' + langs['Eng']
    target_term = 'p_gakki=' + terms['Fall']
    target_school = 'p_gakubu=' + schools['All']
    results_per_page = 'p_number=' + results_per_page_dict['100']
    page_number = 'p_page=' + '1'
    query_strings = ([lang, target_term, target_school, results_per_page, page_number])
    custom_url = basic_url + '&'.join(query_strings)
    start_urls = [custom_url]

    def __init__(self):
        # Replace /Users/oscar/chromedriver with your own chrome driver path, e.g. /Users/myself/my-chromedriver
        # For linux, use os.path.expanduser('~/chromedriver')
        self.driver = webdriver.Chrome('/Users/oscar/chromedriver')
        return

    def parse(self, response):

        while True:

            sel = Selector(response=response, type="html")

            c_infos = sel.xpath('//table[@class="ct-vh"]/tbody/tr[not(@class="c-vh-title")]')
            for c_info in c_infos:
                cl = CourseLoader(selector=c_info)

                cl.add_xpath(field_name='year', xpath='td[1]/text()')
                cl.add_xpath(field_name='code', xpath='td[2]/text()')
                cl.add_xpath(field_name='title', xpath='td[3]/a/text()')
                cl.add_xpath(field_name='instructor', xpath='td[4]/text()')
                cl.add_xpath(field_name='school', xpath='td[5]/text()')
                cl.add_xpath(field_name='term', xpath='td[6]/text()')

                link = c_info.xpath('td[3]/a/@onclick').extract()
                cl.add_value(field_name='link', value=link)

                day_periods = c_info.xpath('td[7]/text()').extract()
                locations = c_info.xpath('td[8]/text()').extract()

                for day_period, location in zip(day_periods, locations):
                    ol = OccurrenceLoader()
                    day_period_match = re.match(
                        r'(\d{2}:)?(?P<day>[A-Z][a-z]*).(?P<start>\d)?-?(?P<end>\d)', day_period
                    )

                    if day_period_match is None:
                        day_period_match = re.match(
                            r'(\d{2}:)?(?P<value>.*)', day_period
                        )
                        value = day_period_match.group('value')
                        day = value
                        start_period = value
                        end_period = value
                        start_time = self.period_to_minutes(value)
                        end_time = self.period_to_minutes(value)
                    else:
                        day = day_period_match.group('day')
                        start_period = day_period_match.group('start')
                        end_period = day_period_match.group('end')
                        if start_period is None:
                            start_period = end_period
                        start_time = self.period_to_minutes(start_period + 's')
                        end_time = self.period_to_minutes(end_period + 'e')

                    ol.add_value(field_name='day', value=int(day))
                    ol.add_value(field_name='start_period', value=int(start_period))
                    ol.add_value(field_name='end_period', value=int(end_period))
                    ol.add_value(field_name='start_time', value=int(start_time))
                    ol.add_value(field_name='end_time', value=int(end_time))

                    location_match = re.match(
                        r'(\d{2}:)?(?P<building>\d+)-(?P<classroom>.*)', location
                    )

                    if location_match is None:
                        location_match = re.match(
                            r'(\d{2}:)?(?P<value>.*)', location
                        )
                        bldg = '-1'
                        classroom = location_match.group('value')

                    else:
                        bldg = location_match.group('building')
                        classroom = location_match.group('classroom')

                    ol.add_value(field_name='building', value=bldg)
                    ol.add_value(field_name='classroom', value=classroom)
                    ol.add_value(field_name='location', value=bldg + '-' + classroom)
                    cl.add_value(field_name='occurrences', value=ol.load_item())

                yield(cl.load_item())

            try:
                next_page = self.driver.find_element_by_xpath(
                    '//table[@class="t-btn"]/tbody/tr/td/div/div/p/a[text()="Next>"]'
                )
                sleep(3)
                self.logger.info('Sleeping for 3 seconds.')
                next_page.click()

            except NoSuchElementException:
                self.logger.info('No more pages to load.')
                self.driver.quit()
                break


    def period_to_minutes(self, period):
        p_t_m = {
            '1s': 540,
            '1e': 630,
            '2s': 640,
            '2e': 730,
            '3s': 780,
            '3e': 870,
            '4s': 885,
            '4e': 975,
            '5s': 990,
            '5e': 1080,
            '6s': 1095,
            '6e': 1185,
            '7s': 1195,
            '7e': 1285
        }
        try:
            return p_t_m[period]
        except KeyError:
            return -1

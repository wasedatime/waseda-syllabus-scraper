# -*- coding: utf-8 -*-
import os
import json
import re
import tempfile
from time import sleep

from scrapy.http import FormRequest
from scrapy.selector import Selector
from scrapy.spiders import Spider
from scrapy.utils.python import to_bytes
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException

from wsl_spider.items import CourseLoader, OccurrenceLoader


class SearchSpider(Spider):
    name = 'search'
    allowed_domains = ['wsl.waseda.jp']
    start_urls = ['https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en']
    semesters = {'Spring': "1", 'Fall': "2"}
    schools = {
        'Art/Architecture Schl': "712001",
        'Sports Sci': "202003",
        'Political Sci': "111973",
        'Fund Sci/Eng': "262006",
        'Cre Sci/Eng': "272006",
        'Adv Sci/Eng': "282006"
    }

    target_semester = 'Fall'
    target_school = 'Fund Sci/Eng'

    abs_script_path = os.path.abspath(os.path.dirname(__file__))
    abs_data_path = os.path.join(abs_script_path, "../data/form_data.json")
    with open(abs_data_path) as data_file:
        form_data = json.load(data_file)

    form_data['p_gakki'] = semesters[target_semester]
    form_data['p_gakubu'] = schools[target_school]

    def __init__(self):
        self.driver = webdriver.Chrome('/Users/oscar/chromedriver')
        return

    # perform a POST request to the syllabus search page
    def parse(self, response):
        yield FormRequest.from_response(
            response,
            formdata=self.form_data,
            callback=self.after_search
        )

    def after_search(self, response):
        fname = self.get_temp_html_path(response)
        self.driver.get("file://%s" % fname)
        return self.expand_results_per_page()

    def expand_results_per_page(self):
        next_page = self.driver.find_element_by_xpath(
            '//table[@class="t-btn"]/tbody/tr/td/div/div/p/a[text()="Next>"]'
        )
        next_page.click()

        hundred_items = self.driver.find_element_by_xpath('id("cHeader")/div[3]/a[3]')
        hundred_items.click()
        return self.parse_each_results_page()

    def parse_each_results_page(self):

        while True:

            sel = Selector(text=self.driver.page_source, type="html")

            c_infos = sel.xpath('//table[@class="ct-vh"]/tbody/tr[not(@class="c-vh-title")]')
            for c_info in c_infos:
                cl = CourseLoader(selector=c_info)
                cl.add_xpath(field_name='year', xpath='td[1]/text()')
                cl.add_xpath(field_name='code', xpath='td[2]/text()')
                cl.add_xpath(field_name='title', xpath='td[3]/a/text()')
                cl.add_xpath(field_name='instructor', xpath='td[4]/text()')
                cl.add_xpath(field_name='school', xpath='td[5]/text()')
                cl.add_xpath(field_name='term', xpath='td[6]/text()')

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

                    ol.add_value(field_name='day', value=day)
                    ol.add_value(field_name='start_period', value=start_period)
                    ol.add_value(field_name='end_period', value=end_period)
                    ol.add_value(field_name='start_time', value=start_time)
                    ol.add_value(field_name='end_time', value=end_time)

                    location_match = re.match(
                        r'(\d{2}:)?(?P<building>\d+)-(?P<classroom>.*)', location
                    )

                    if location_match is None:
                        location_match = re.match(
                            r'(\d{2}:)?(?P<value>.*)', location
                        )
                        bldg = '-1'
                        clsrm = location_match.group('value')

                    else:
                        bldg = location_match.group('building')
                        clsrm = location_match.group('classroom')

                    ol.add_value(field_name='building', value=bldg)
                    ol.add_value(field_name='classroom', value=clsrm)
                    ol.add_value(field_name='location', value=bldg + '-' + clsrm)
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

    def get_temp_html_path(self, response):

        from scrapy.http import HtmlResponse
        # The implementation below is modified from scrapy.util.response.open_in_browser
        # According to the source code, it is a bit dirty and could be improved
        body = response.body
        if isinstance(response, HtmlResponse):
            if b'<base' not in body:
                repl = '<head><base href="%s">' % response.url
                body = body.replace(b'<head>', to_bytes(repl))
            ext = '.html'
        else:
            raise TypeError("Unsupported response type: %s" %
                            response.__class__.__name__)
        fd, fname = tempfile.mkstemp(ext)
        os.write(fd, body)
        os.close(fd)
        return fname

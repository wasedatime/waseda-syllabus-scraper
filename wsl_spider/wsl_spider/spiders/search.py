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

    target_semester = 'Spring'
    target_school = 'Art/Architecture Schl'

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

    # after the server responded, parse through each result page
    def after_search(self, response):

        fname = self.get_temp_html_path(response)
        self.driver.get("file://%s" % fname)

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
                        r'(\d{2}:)?(?P<day>[A-Z][a-z]*).(?P<period>.*)', day_period
                    )
                    ol.add_value(field_name='day', value=day_period_match.group('day'))
                    ol.add_value(field_name='period', value=day_period_match.group('period'))

                    location_match = re.match(
                        r'(\d{2}:)?(?P<building>\d+)-(?P<classroom>\d+)', location
                    )

                    if location_match is None:
                        location_match = re.match(
                            r'(\d{2}:)?(?P<value>.*)', location
                        )
                        ol.add_value(field_name='building', value='999')
                        ol.add_value(field_name='classroom', value=location_match.group('value'))

                    else:
                        ol.add_value(field_name='building', value=location_match.group('building'))
                        ol.add_value(field_name='classroom', value=location_match.group('classroom'))

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

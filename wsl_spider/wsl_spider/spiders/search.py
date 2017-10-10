# -*- coding: utf-8 -*-
import os
import re
import tempfile
from time import sleep

from scrapy.http import FormRequest
from scrapy.selector import Selector
from scrapy.spiders import Spider
from scrapy.utils.python import to_bytes
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException


class SearchSpider(Spider):
    name = 'search'
    allowed_domains = ['wsl.waseda.jp']
    start_urls = ['https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en']
    target = 'Art/Architecture Schl'
    school_dict = {
        'Art/Architecture Schl': "712001",
        'Sports Sci': "202003",
        'Political Sci': "111973",
        'Fund Sci/Eng': "262006",
        'Cre Sci/Eng': "272006",
        'Adv Sci/Eng': "282006"
    }
    form_data = {
        'keyword': "",
        "s_bunya1_hid": "Please select the First Academic disciplines.",
        "s_bunya2_hid": "Please select the Second Academic disciplines.",
        "s_bunya3_hid": "Please select the Third Academic disciplines.",
        "area_type": "",
        "area_value": "",
        "s_level_hid": "",
        "kamoku": "",
        "kyoin": "",
        "p_gakki": "2",
        "p_youbi": "",
        "p_jigen": "",
        "p_gengo": "",
        "p_gakubu": school_dict[target],
        "p_keya": "",
        "p_searcha": "a",
        "p_keyb": "",
        "p_searchb": "b",
        "hidreset": "",
        "pfrontPage": "now",
        "pchgFlg": "",
        "bunya1_hid": "",
        "bunya2_hid": "",
        "bunya3_hid": "",
        "level_hid": "",
        "ControllerParameters": "JAA103SubCon",
        "pOcw": "",
        "pType": "",
        "pLng": "en"
    }

    def __init__(self):
        self.driver = webdriver.Chrome('/Users/oscar/chromedriver')
        return

    def parse(self, response):
        return FormRequest.from_response(
            response,
            formdata=self.form_data,
            callback=self.after_search
        )

    def after_search(self, response):

        fname = self.get_temp_html_path(response)
        self.driver.get("file://%s" % fname)

        while True:

            sel = Selector(text=self.driver.page_source, type="html")
            c_infos = sel.xpath('//table[@class="ct-vh"]/tbody/tr[not(@class="c-vh-title")]')
            for c_info in c_infos:

                course_title = c_info.xpath('td[3]/a/text()').extract_first()
                instructor = c_info.xpath('td[4]/text()').extract_first()
                school = c_info.xpath('td[5]/text()').extract_first()
                term = c_info.xpath('td[6]/text()').extract_first()
                day_periods = c_info.xpath('td[7]/text()').extract()
                day_period = ""
                for day_period_elem in day_periods:
                    day_period_match = re.match(
                        r'(\d{2}:)?(?P<value>.*)', day_period_elem
                    )
                    day_period += day_period_match.group('value') + " "

                classrooms = c_info.xpath('td[8]/text()').extract()
                classroom = ""
                for classroom_elem in classrooms:
                    classroom_match = re.match(
                        r'(\d{2}:)?(?P<value>.*)', classroom_elem
                    )
                    classroom += classroom_match.group('value') + " "

                print(course_title, instructor, school, term, "\n", day_period, classroom)

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
        # XXX: this implementation is modified from scrapy.util.response.open_in_browser
        # according to the source code, it is a bit dirty and could be improved
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

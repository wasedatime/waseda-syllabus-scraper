# -*- coding: utf-8 -*-
import os
import tempfile
from time import sleep

from scrapy.http import FormRequest
from scrapy.spiders import Spider
from scrapy.utils.python import to_bytes
from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException


class SearchSpider(Spider):
    name = 'search'
    allowed_domains = ['wsl.waseda.jp']
    start_urls = ['https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en']
    target = 'Sports Sci'
    school_dict = {
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
            try:
                next_page = self.driver.find_element_by_xpath('//table[@class="t-btn"]/tbody/tr/td/div/div/p/a[text()="Next>"]')
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

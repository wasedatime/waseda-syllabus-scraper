# -*- coding: utf-8 -*-
import scrapy


class CourseInfoSpider(scrapy.Spider):
    name = 'course_info'
    allowed_domains = ['wsl.waseda.jp/syllabus']
    start_urls = ['http://wsl.waseda.jp/syllabus/']

    def parse(self, response):
        pass

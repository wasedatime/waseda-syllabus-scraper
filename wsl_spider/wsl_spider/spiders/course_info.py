# -*- coding: utf-8 -*-
import scrapy


class CourseInfoSpider(scrapy.Spider):
    name = 'course_info'
    allowed_domains = ['wsl.waseda.jp/syllabus']
    start_urls = [('https://www.wsl.waseda.jp/syllabus/'
        'JAA104.php?pKey=210CO14300032017210CO1430021&pLng=en')]

    #Info Design 'JAA104.php?pKey=26GF02200201201726GF02200226&pLng=en')]
    base_xpath = '//*[@class="ct-common ct-sirabasu"]/tbody/tr'

    def parse(self, response):

        course_dict = {
            'Course Title' : "",
            'Instructor' : "",
            'Schedule': "",
            'Campus' : "",
            'Classroom' : ""
        }
        course_title = response.xpath((
            self.base_xpath + '[contains(th/text(),"Course Title")]/td/div/text()'
        )).extract_first()

        course_sub_title = response.xpath((
            self.base_xpath + '[contains(th/text(),"Course Title")]/td/p/text()'
        )).extract_first()

        course_dict['Course Title'] = course_title if course_sub_title is None else course_title + course_sub_title

        course_dict['Instructor'] = response.xpath((
            self.base_xpath + '[contains(th/text(),"Instructor")]/td/text()'
        )).extract_first()

        course_dict['Schedule'] = response.xpath((
            self.base_xpath + '[contains(th/text(),"Term/Day/Period")]/td/text()'
        )).extract_first()

        classroom_campus = response.xpath((
            self.base_xpath + '[contains(th/text(),"Classroom")]/td/text()'
        )).extract()

        course_dict['Campus'] = classroom_campus[1]

        course_dict['Classroom'] = classroom_campus[0]

        for key, value in course_dict.items():
            value = value.replace('\xa0', ' ').encode('utf-8')

        yield course_dict

# Run this file to parse a list of returned course page.
import sys
import getopt
from scrapy import cmdline


def parse_cmd_options():
    # These two schools return little course results and are good for testing:
    # art_architecture, sports_sci
    # Actual schools to be scraped:
    # sils, poli_sci, fund_sci_eng, cre_sci_eng, adv_sci_eng
    # To scrape, use "all"
    schools = ""
    # useful keywords: IPSE, English-based Undergraduate Program
    keyword = ""
    try:
        opts, args = getopt.getopt(sys.argv[1:], 's:k:')
    except getopt.GetoptError:
        print("Usage: python3 run_search.py -s school_one school_two -k a_single_keyword")
        sys.exit(2)

    for o, a in opts:
        if o == '-s':
            schools = a
        elif o == '-k':
            keyword = a
        else:
            assert False, "unhandled option"
    school_arg = "-a schools={}".format(schools) if schools else ""
    keyword_arg = "-a keyword={}".format(keyword) if keyword else ""
    return " ".join([school_arg, keyword_arg])


command = "scrapy crawl search " + parse_cmd_options()
cmdline.execute(command.split())

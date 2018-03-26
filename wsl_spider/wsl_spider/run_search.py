# Run this file to parse a list of returned course page.
import sys
import getopt
from scrapy import cmdline


def parse_cmd_options():
    # These two schools return little course results and are good for testing:
    # art_architecture, sports_sci
    # Target schools:
    # sils, poli_sci, fund_sci_eng, cre_sci_eng, adv_sci_eng
    schools = ""
    # Target programs: IPSE, English-based Undergraduate Program
    program = ""
    try:
        opts, args = getopt.getopt(sys.argv[1:], 's:k:')
    except getopt.GetoptError:
        print("Usage: python3 run_search.py -s school_one school_two -k a_single_program")
        sys.exit(2)

    for o, a in opts:
        if o == '-s':
            schools = a
        elif o == '-k':
            program = a
        else:
            assert False, "unhandled option"
    schools_arg = ["-a"] + ["schools={}".format(schools)] if schools else []
    program_arg = ["-a"] + ["program={}".format(program)] if program else []
    return schools_arg + program_arg


command = "scrapy crawl search"
cmdline.execute(command.split() + parse_cmd_options())

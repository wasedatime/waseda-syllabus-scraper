# Dataflow

This file explains how the syllabus data is scraped, aggregated, and exported when `cron_job.sh` is executed.

## Variable Initialization

`source variables.sh` is called in the beginning of almost all shell script files. It has 4 main tasks.

#### 1. Get the current academic year

#### 2. Setup the correct environment path

#### 3. Read `data/academics.json` and `/data/academics_to_scrape.json`.

- `academics.json` provides a complete list of **academic codes**. E.g., `FSE` for School of Fundamental Science and Engineering, `PSE` for School of Political Science and Economics.

- `academics_to_scrape.json` specifies the schools which the scraper will scrape. It it customizable by the user.

#### 4. Generate the required variables.

Variables are named in the following way:
`raw`\_`entire_year`\_`courses`\_`all`

- `raw` means the data that are not aggregated yet = raw data scraped directly from syllabus database.
- `entire_year` means it contains data for the entire academic year, which means all semesters.
- `courses` means the data is about courses.
- `all` means it contains data for all schools.

Examples:
`raw_entire_year_courses_all`: Raw data for all courses in the entire academic year.
`entire_year_courses_all`: Aggregated, refined data for all courses in the entire academic year.

## Scraping

`scrape.sh` is used for scraping data from the syllabus database.
The scraper reads

## Aggregation

## Export

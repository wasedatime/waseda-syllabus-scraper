# Waseda Syllabus Scraper

[![Build Status](https://travis-ci.org/OscarWang114/waseda-syllabus-scraper.svg?branch=master)](https://travis-ci.org/OscarWang114/waseda-syllabus-scraper)

This is a web scraper built to scrape course information from the [Syllabus Search Database at Waseda University](https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en).

## NOTE: Documentation is outdated
Large amount of refinement and changes have been done to improve the program, so some parts of the README.md are
not applicable anymore. We will update it as soon as possible. (2018.03.10)

## Getting Started

### Prerequisites

* [Python 3](https://www.python.org/downloads/), version 3.6.2 and above.
* pip3 (package manager for Python3) 9.0.1 and above.
* [MongoDB shell](https://docs.mongodb.com/getting-started/shell/installation/) 3.6.0 and above.
* [Google Chrome Driver](https://sites.google.com/a/chromium.org/chromedriver/downloads)
* [Robo 3T](https://robomongo.org/) (Optional but recommended)

### Installing

**NOTE:** Currently, this guide is written for Mac users. The general procedure also applies to Window users, but the input commands might be different.

Installations for Python 3, MongoDB shell, and Robo 3T are pretty straight-forward, so they are not covered.

#### Dev dependencies

After installing Python 3, run the command below inside your terminal/command line to check it's available. Note that it is **python3**, not python.

```
python3 --version
```

Run the next command to check if pip3 is available.

```
pip3 --version
```

For more questions, follow the detailed guide [here](https://packaging.python.org/tutorials/installing-packages/) and replace all python, pip command with **python3** and **pip3**.

Install virtual environment for Python 3 by running

```
pip3 install virtualenv
```

Create a folder that will be used as a virtual environment for this project.

```
mkdir my-virtual-env
```

Initialize and activate the environment.

```
virtualenv my-virtual-env
source my-virtual-env/bin/activate
```

Clone this project into the virtual environment folder, and install dev dependencies.

```
cd my-virtual-env
git clone https://github.com/wasetime/waseda-syllabus-scraper.git
pip3 install -r requirements-dev.txt
```

#### MongoDB shell

Run the following command to check if MongoDB shell is available.

```
mongo --version
```

You should see an output like MongoDB shell version v3.6.0.

Run the following command to start the daemon database process.

```
mongod
```

Remember that you will need to start the database before scraping so that the scraped data can be exported to MongoDB.

#### Google Chrome Driver

This project automates Google Chrome to click on links and proceed to the next page of search results. Download the driver [here](https://sites.google.com/a/chromium.org/chromedriver/downloads) and put it somewhere you like.

### Some tweaks before scraping

#### Google Chrome Driver Path

Inside `search.py`, you need to replace the original chrome driver path with your own one.

```python
# Replace /Users/oscar/chromedriver with your own chrome driver path, e.g. /Users/myself/my-chrome-driver
self.driver = webdriver.Chrome('/Users/oscar/chromedriver')
```

#### Target Year, Semester, and School

Also, you can specify the courses of a particular semester and school you want to scrape.

```python
# Change the target semester and school here.
target_semester = 'Fall'
target_school = 'All'
```

#### Export collection name

At last, if needed feel free to change the name of output MongoDB collection inside `settings.py`.

```python
# Change the name of the output collection here
MONGO_COLLECTION = "raw_2017F_courses"
```

### Start scraping

Type the following command inside your terminal

```
python3 run_search.py
```

You should see a new Google Chrome Icon pop up. Open it and it should display
"Chrome is being controlled by automated test software.". Depends on the target you selected,
the scraping process may take a few minutes.

After finish scraping, you can deactivate the virtual environment by typing the following command

```
deactivate
```

### Data validation

You can use mongo shell (pure CLI) or Robo3T (provides a great GUI) to validate if the interested data is scraped and stored correctly in MongoDB.

### Extract classroom and building collections from courses

The Waseda syllabus database only provides data related to courses. In order to obtain classroom and building information, we have extract and group them into separate collections. This can be done using [MongoDB's Aggregation Framework](https://docs.mongodb.com/manual/aggregation/).

This project contains a `aggregate.js` file that helps automating the entire aggregation process. However, it is necessary to change some variables inside before starting.

### Some tweaks before aggregating

Currently, there is no written guide for this section, but you can follow the comments in `aggregate.js` to tweak and customize your own aggregation process.

### Start aggregating

Type the following command inside your terminal to start using mongo shell and load the aggregation script.

```
mongo
load("/path/to/aggregation/script.js")
```

It should return `true` if the aggregation is successful.

### Congratulations!

If you have obtained the desired results, congratulations! Or
if you encountered some troubles during scraping or aggregating the data, feel free to submit an issue. :)

## Built With

* [Python3](https://www.python.org/) - The language used.
* [Scrapy](https://scrapy.org/) - The scraping framework used.
* [Selenium](http://www.seleniumhq.org/) - The browser automation framework used.
* [MongoDB](https://www.mongodb.com/) - The database used for storing results.

## Contributing

Submit an issue or a pull request!

## Author

* **Oscar Wang** - _Initial work_ - [OscarWang114](https://github.com/OscarWang114)
* **Taihei Sato** - _Add a new url_ - [tsato815](https://github.com/tsato815)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

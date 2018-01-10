# Waseda Syllabus Scraper

This is a web scraper built to scrape course information from the [Syllabus Search Database at Waseda University](https://www.wsl.waseda.jp/syllabus/JAA101.php?pLng=en).

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

End with an example of getting some data out of the system or using it for a little demo

#### MongoDB shell

Run the following command to check if MongoDB shell is available.

```
mongo --version
```

You should see an output like MongoDB shell version v3.6.0.

Run the following command to start the database process.

```
mongod
```

Remember that you will need to run this before scraping so that the scraped data can be exported to MongoDB.

#### Google Chrome Driver

This project automates Google Chrome to click on links and proceed to the next page of search results. Download the driver [here](https://sites.google.com/a/chromium.org/chromedriver/downloads) and put it somewhere you like.

### Almost there!!

Inside `search.py`, you need to replace the original chrome driver path with your own one.

```python
# Replace /Users/oscar/chromedriver with your own chrome driver path, e.g. /Users/myself/my-chrome-driver
self.driver = webdriver.Chrome('/Users/oscar/chromedriver')
```

Also, you can specify the courses of a particular semester and school you want to scrape.

```python
# Change the target semester and school here.
target_semester = 'Fall'
target_school = 'Fund Sci/Eng'
```

At last, inside `settings.py`, change the name of output collection in MongoDB.

```python
# Change the name of the output collection here, e.g. "my courses"
MONGO_COLLECTION = "test"
```

## Start scraping

Run the following command

```
python3 run_search.py
```

You should see a Google Chrome Icon popped up.

## Built With

* [Python3](https://www.python.org/) - The language used.
* [Scrapy](https://scrapy.org/) - The scraping framework used.
* [Selenium](http://www.seleniumhq.org/) - The browser automation framework used.
* [MongoDB](https://www.mongodb.com/) - The database used for storing results.

## Contributing

Submit an issue or a pull request!

## Author

* **Oscar Wang** - _Initial work_ - [OscarWang114](https://github.com/OscarWang114)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

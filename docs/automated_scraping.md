# Automated Scraping

## Scraping phase

Refer to [scrape.sh](../server/scrape.sh) for the procedure details.

## Exporting phase

Refer to [export.sh](../server/export.sh) for the procedure details.

**IMPORTANT** Set up environment variables for deploy logged-in shell on the server
```bash
# ubuntu uses .profile instead of .bash_profile
vim /home/deploy/.profile

# set up environment variables for aggregate.sh
export DEPLOY=deploy
# set up environment variables for mlab
export MLAB_DEV_PASSWORD=example_password
export MLAB_DEV_HOST_PORT=example_host_port
export MLAB_PASSWORD=example_password
export MLAB_HOST_PORT=example_host_port
```

## Cron job

Make all shell scripts executable by user deploy
```bash
chmod u+x scrape.sh
chmod u+x aggregate.sh
chmod u+x export_dev.sh
chmod u+x export_prod.sh
chmod u+x cron_job.sh
```

Type in to set up cron job
```bash
crontab -e
```

Inside the file
```bash
# Using bash so we can access the RANDOM variable
SHELL=/bin/bash
# Remember to set your server time zone to JST
# Gets environment variables before scraping
# Start scraping at midnight every Tue Thur Sat, but first sleep randomly up to 2.5 hours
# cd into server folder so variables.sh can be read properly
0 0 * * 2,4,6 source /home/deploy/.profile; sleep $(( RANDOM \% 9000 )); cd /home/deploy/waseda-syllabus-scraper/server; ./cron_job.sh
```

Add `>> /home/deploy/example.log 2>&1` at the end for logging

Check cron jobs
```bash
crontab -l
```

Check cron logs
```bash
sudo grep CRON /var/log/syslog
```

For exporting static json file to nginx api folder, be sure to give deploy permission
```bash
sudo chown deploy: api_folder
sudo chmod u+w api_folder
```

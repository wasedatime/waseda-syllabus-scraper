# Automated Scraping

## Scraping phase

Refer to [scrape.sh](../server/scrape.sh) for the procedure details.

## Exporting phase

Refer to [export.sh](../server/export.sh) for the procedure details.

**IMPORTANT** Set up environment variables for deploy logged-in shell on the server
```bash
# ubuntu uses .profile instead of .bash_profile
vim /home/deploy/.profile
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
# Start scraping at midnight
# Sleep randomly up til 2.5 hours
0 0 * * * deploy sleep $(( RANDOM \% 9000 )); /home/deploy/waseda-syllabus-scraper/server/scrape.sh
```

Check cron jobs
```bash
crontab -l
```

Check cron logs
```bash
sudo grep CRON /var/log/syslog
```

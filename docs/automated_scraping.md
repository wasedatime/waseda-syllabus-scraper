# Automated Scraping

## Scraping phase

Refer to [scrape.sh](../server/scrape.sh) for the procedure details.

## Exporting phase

Refer to [export.sh](../server/export.sh) for the procedure details.

**IMPORTANT** Set up environment variables for deploy logged-in shell on the server
```bash
# ubuntu uses .profile instead of .bash_profile
vim /home/deploy/.profile
export MLAB_PASSWORD=example_password
export MLAB_HOST_PORT=example_host_port
```

## Chron job
To be completed

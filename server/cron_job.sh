#!/bin/bash

source variables.sh

cron_job() {
    # Use source so that variables and functions are still accessible from the called scripts
    source ${SCRIPT_PATH}${1} \
    && cd "${PROJECT_PATH}server" # cd back so that variables.sh can be found in sub shell scripts
}

cron_job "scrape.sh" \
&& cron_job "aggregate.sh" \
&& cron_job "export_nginx.sh" \
&& cron_job "clean_up.sh"


#!/usr/bin/env bash

declare -p | grep -Ev 'BASHOPTS|BASH_VERSINFO|EUID|PPID|SHELLOPTS|UID' > /container.env
chmod 0644 /etc/cron.d/afp-cron
touch /var/log/afp_pipeline.log
touch /var/log/afp_monthly_digest.log
crontab /etc/cron.d/afp-cron
cron

tail -f /dev/null
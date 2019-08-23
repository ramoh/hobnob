#!/usr/bin/env bash

RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

#Make sure the port is not already bound
if netstat -vnap tcp | grep -q 8080; then
  echo "Another process is using port 8080"
  exit 1
fi

if ! launchctl list | grep -q 'elasticsearch-full'; then

  echo "Starting elastic search service"
  brew services run elasticsearch-full
  until curl --silent localhost:9200 -w " " -o /dev/null; do
    sleep "$RETRY_INTERVAL"
  done
fi

yarn run serve &

echo "API service has been started"
until netstat -vanp tcp | grep -q 8080; do
  sleep "$RETRY_INTERVAL"
done

npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/steps
kill -15 0

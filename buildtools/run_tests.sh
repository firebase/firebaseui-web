#!/bin/bash
# Copyright 2016 Google Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# Prepares the setup for running unit tests. It starts a Selenium Webdriver.
# creates a local webserver to serve test files, and run protractor.
#
# Usage:
#
# ./buildtools/run_tests.sh [--saucelabs [--tunnelIdentifier=<tunnelId>]]
#
# Can take up to two arguments:
# --saucelabs: Use SauceLabs instead of phantomJS.
# --tunnelIdentifier=<tunnelId>: when using SauceLabs, specify the tunnel
#     identifier. Otherwise, uses the environment variable TRAVIS_JOB_NUMBER.
#
# Prefer to use the `npm test` command as explained below.
#
# Run locally with PhantomJS:
# $ npm test
# It will start a local Selenium Webdriver server as well as the HTTP server
# that serves test files.
#
# Run locally using SauceLabs:
# Go to your SauceLab account, under "My Account", and copy paste the
# access key. Now export the following variables:
# $ export SAUCE_USERNAME=<your username>
# $ export SAUCE_ACCESS_KEY=<the copy pasted access key>
# Then, start SauceConnect:
# $ ./buildtools/sauce_connect.sh
# Take note of the "Tunnel Identifier" value logged in the terminal.
# Run the tests:
# $ npm run -- --saucelabs --tunnelIdentifier=<the tunnel identifier>
# This will start the HTTP Server locally, and connect through SauceConnect
# to SauceLabs remote browsers instances.
#
# Travis will run `npm test -- --saucelabs`.

cd "$(dirname $(dirname "$0"))"
BIN_PATH="./node_modules/.bin"
PROTRACTOR_BIN_PATH="./node_modules/protractor/bin"

function killServer () {
  if [ "$seleniumStarted" = true ]; then
    echo "Stopping Selenium..."
    $PROTRACTOR_BIN_PATH/webdriver-manager shutdown
    $PROTRACTOR_BIN_PATH/webdriver-manager clean
  fi
  echo "Killing HTTP Server..."
  kill $serverPid
}

# Start the local webserver.
$BIN_PATH/gulp serve &
serverPid=$!
echo "Local HTTP Server started with PID $serverPid."

trap killServer EXIT

# If --saucelabs option is passed, forward it to the protractor command adding
# the second argument that is required for local SauceLabs test run.
if [[ $1 = "--saucelabs" ]]; then
  seleniumStarted=false
  sleep 2
  echo "Using SauceLabs."
  # $2 contains the tunnelIdentifier argument if specified, otherwise is empty.
  $PROTRACTOR_BIN_PATH/protractor protractor.conf.js --saucelabs $2
else
  echo "Using Headless Chrome."
  # Updates Selenium Webdriver.
  echo "$PROTRACTOR_BIN_PATH/webdriver-manager update --gecko=false"
  $PROTRACTOR_BIN_PATH/webdriver-manager update --gecko=false
  # Start Selenium Webdriver.
  echo "$PROTRACTOR_BIN_PATH/webdriver-manager start &>/dev/null &"
  $PROTRACTOR_BIN_PATH/webdriver-manager start &>/dev/null &
  seleniumStarted=true
  echo "Selenium Server started."
  # Wait for servers to come up.
  sleep 10
  $PROTRACTOR_BIN_PATH/protractor protractor.conf.js
fi

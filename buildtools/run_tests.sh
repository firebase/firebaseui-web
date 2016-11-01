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
# $ buildtools/run_protractor.sh

cd "$(dirname $(dirname "$0"))"

./node_modules/.bin/webdriver-manager update

function killServer () {
  # Selenium Webdriver starts one child process from this one.
  # This command kills them all.
  kill -- -$seleniumPid
  kill $serverPid
}

# Start Selenium Webdriver.
./node_modules/.bin/webdriver-manager start &>/dev/null &
seleniumPid=$!

# Start the local webserver.
./node_modules/.bin/gulp serve &
serverPid=$!

trap killServer EXIT

# Wait for servers to come up.
sleep 10

./node_modules/.bin/protractor protractor.conf.js

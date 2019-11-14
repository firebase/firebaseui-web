/*
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

const fs = require('fs');
const Twitter = require('twitter');

/**
 * Print the usage of the script.
 */
function printUsage() {
  console.error(`
Usage: tweet.js <version>

Credentials must be stored in "twitter.json" in this directory.

Arguments:
  - version: Version of module that was released. e.g. "1.2.3"
`);
  process.exit(1);
}

/**
 * Returns the URL of the release note.
 * @param {string} version The version number.
 * @return {string} The URL of the release note.
 */
function getUrl(version) {
  return `https://github.com/firebase/firebaseui-web/releases/tag/v${version}`;
}

if (process.argv.length !== 3) {
  console.error('Missing arguments.');
  printUsage();
}

const version = process.argv.pop();
if (!version.match(/^\d+\.\d+\.\d+$/)) {
  console.error(`Version "${version}" not a version number.`);
  printUsage();
}

// Check Twitter account credential.
if (!fs.existsSync(`${__dirname}/twitter.json`)) {
  console.error('Missing credentials.');
  printUsage();
}
const creds = require('./twitter.json');

const client = new Twitter(creds);

// Send tweet with release note.
client.post(
  'statuses/update',
  {
    status: `v${version} of @Firebase FirebaseUI for Web is available. ` +
    `Release notes: ${getUrl(version)}`
  },
  (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  }
);

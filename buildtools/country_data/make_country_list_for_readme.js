#!/usr/bin/env node
/*
 * Copyright 2016 Google Inc. All Rights Reserved.
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

/*
 * Converts the data in full_country_data to a Markdown table.
 *
 * Usage:
 * It is recommended to just run generate_country_data.sh. However, you can run
 * this on its own with:
 * $ ./make_country_list_for_readme.js
 *
 * Then, take the output and put it between the START COPIED TABLE and END
 * COPIED TABLE markers in javascript/data/README.md.
 */

var fullCountryData = require('./full_country_data.json');

// Keep track of seen country codes to eliminate duplicates.
var seenCountryCodes = {};

// Print the table header.
console.log('| Code | Country |');
console.log('| ---- | ------- |');

for (var i = 0; i < fullCountryData.length; i++) {
  var country = fullCountryData[i];

  // Don't print duplicate entries.
  if (seenCountryCodes[country.iso2_cc]) {
    continue;
  }
  seenCountryCodes[country.iso2_cc] = true;

  // Replace square brackets with parentheses, for Markdown support.
  var normalizedName = country.name.replace(/\[/g, '(').replace(/\]/g, ')');

  // Print the Markdown table row.
  console.log('| ' + country.iso2_cc + ' | ' + normalizedName + ' |');
}

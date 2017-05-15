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
 * Filters the data in full_country_data to save space in the FirebaseUI binary
 * and support i18n. This reads from full_country_data.json and outputs to
 * stdout. The output format is JS that should be inlined in
 * javascript/data/country.js.
 *
 * Usage:
 * It is recommended to just run generate_country_data.sh. However, you can run
 * this on its own with:
 * $ ./filter_country_data.js
 *
 * Then, take the output and put it between the START COPIED CODE and END
 * COPIED CODE markers in javascript/data/country.js.
 */

var fullCountryData = require('./full_country_data.json');

// The properties of each country we want to keep.
var KEYS_TO_KEEP = ['name', 'e164_key', 'e164_cc', 'iso2_cc'];

/**
 * Gets the name of the MSG_* variable that has the translatable country name.
 * @param {!Object} countryData
 * @return {string}
 */
function getCountryNameVariable(countryData) {
  var key = countryData.e164_key.toUpperCase().replace(/-/g, '_');
  return 'MSG_' + key;
}

// Make a copy of the country data that we can mutate it.
var outputCountryData = JSON.parse(JSON.stringify(fullCountryData));

// Make translatable strings of country names. They must be declared as a
// variable with the prefix MSG_, be uniquely named, and should have a
// JSDoc "@desc" entry.
var translatableMsgs = fullCountryData.map(function(countryData) {
  // Escape single quotes.
  var name = countryData.name.replace(/'/g, '\\\'');
  var key = getCountryNameVariable(countryData);
  return '/** @desc The name of the country/territory "' + name + '". */\n' +
      'var ' + key + ' = goog.getMsg(\'' + name + '\');';
}).join('\n');
console.log(translatableMsgs);

// Make the JSON object reference the translatable messages.
// This is kind of hacky since we set the the value to a string containing the
// variable name, and then unquote the string below.
outputCountryData = outputCountryData.map(function(countryData) {
  countryData.name = getCountryNameVariable(countryData);
  return countryData;
});

// Stringify and filter out keys we don't want to keep.
var outputJs = JSON.stringify(outputCountryData, KEYS_TO_KEEP, 2);

// Unquote the MSG_ variable references.
outputJs = outputJs.replace(/"(MSG_.+)"/g, '$1');

// Unquote the field keys, so they can be obfuscated in the binary.
KEYS_TO_KEEP.forEach(function(key) {
  outputJs = outputJs.replace(new RegExp('"' + key + '"', 'g'), key);
});

// Change double quotes to single quotes; Closure prefers single quoted strings.
outputJs = outputJs.replace(/"/g, '\'');

// Make this a variable declaration.
outputJs = '/**\n * @type {!Array<!firebaseui.auth.data.country.Country>}\n' +
    ' */\nfirebaseui.auth.data.country.COUNTRY_LIST = ' + outputJs + ';';

console.log(outputJs);

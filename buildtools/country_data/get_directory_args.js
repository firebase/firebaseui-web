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
 * Utilities for parsing command line arguments.
 */

var fs = require('fs');
var path = require('path');

/**
 * Asserts that the given path points to a directory and exits otherwise.
 * @param {string} path
 */
function assertIsDirectory(path) {
  try {
    if (!fs.lstatSync(path).isDirectory()) {
      console.log('Path "' + path + '" is not a directory.');
      process.exit();
    }
  } catch (e) {
    console.log('Directory "' + path + '" could not be found.');
    process.exit();
  }
}

/**
 * Gets the input and output directories from the script arguments.
 * @return {!Object}
 */
module.exports = function() {
  // The file name of the script using this library.
  var currentScript = path.parse(process.argv[1]).base;

  if (process.argv.length !== 4) {
    console.log('Usage: ' + currentScript + ' /path/to/input /path/to/output');
    process.exit();
  }

  var args = process.argv.slice(2);
  var fromDir = args[0];
  var toDir = args[1];

  assertIsDirectory(fromDir);
  assertIsDirectory(toDir);

  return {
    from: fromDir,
    to: toDir
  };
};

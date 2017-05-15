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
 * Converts all SVGs in a directory to PNGs.
 *
 * Usage:
 * It is recommended to just run generate_country_data.sh. However, you can run
 * this on its own with:
 * $ ./make_flag_pngs.js ./svg_images_dir ./png_images_dir
 */

var fs = require('fs');
var getDirectoryArgs = require('./get_directory_args.js');
var path = require('path');
var svgexport = require('svgexport');

var dirs = getDirectoryArgs();

/* The desired resolution of each PNG. */
var OUTPUT_RESOLUTION = '48:28';

var files = fs.readdirSync(dirs.from);
var svgExportInput = files.filter(function(file) {
  // Ignore non-top-level flags (e.g. USA state flags).
  return file.match(/^[A-Z][A-Z]\.svg$/);
}).map(function(file) {
  var fromPath = path.join(dirs.from, file);
  var toPath = path.join(dirs.to, path.parse(file).name + '.png');

  return {
    input: [fromPath, 'pad', OUTPUT_RESOLUTION],
    output: [toPath]
  };
});
svgexport.render(svgExportInput);

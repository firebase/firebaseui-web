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
 * Compresses all PNGs in a given directory using optipng. Optipng reduces
 * the file size of PNGs losslessly.
 *
 * Usage:
 * It is recommended to just run generate_country_data.sh. However, you can run
 * this on its own with:
 * $ ./compress_pngs.js ./source_images_dir ./output_images_dir
 */

var fs = require('fs');
var getDirectoryArgs = require('./get_directory_args.js');
var imagemin = require('imagemin');
var imageminOptipng = require('imagemin-optipng');
var path = require('path');

var dirs = getDirectoryArgs();

var files = fs.readdirSync(dirs.from)
    .filter(function(file) {
      return file.endsWith('.png');
    })
    .map(function(file) {
      return path.join(dirs.from, file);
    });
imagemin(files, dirs.to, {
  use: [
    imageminOptipng()
  ]
});

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
 * Creates a CSS sprite of the images in the given directory.
 * The CSS is generated according to the template css.hbs.
 *
 * Usage:
 * It is recommended to just run generate_country_data.sh. However, you can run
 * this on its own with:
 * $ ./make_flag_sprite.js ./source_images_dir ./out_dir
 */

var fs = require('fs');
var getDirectoryArgs = require('./get_directory_args.js');
var path = require('path');
var sprity = require('sprity');

var dirs = getDirectoryArgs();

var options = {
  out: dirs.to,
  src: dirs.from + '/*',
  style: 'flags.css',
  margin: 0,
  // Generate both standard-res and high-res images.
  dimension: [{
    ratio: 1, dpi: 72
  }, {
    ratio: 2, dpi: 192
  }],
  template: 'css.hbs'
};
sprity.create(options);

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

exports.config = {
  // Using jasmine to wrap Closure JSUnit tests.
  framework: 'jasmine',
  // Address of Selenium webdriver, started with `webdriver-manager start`.
  seleniumAddress: 'http://localhost:4444/wd/hub',
  // The jasmine specs to run.
  specs: ['protractor_spec.js'],
  // Configuration for phantomjs.
  capabilities: {
    'browserName': 'phantomjs',
    'phantomjs.binary.path': './node_modules/.bin/phantomjs',
    'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
  }
};

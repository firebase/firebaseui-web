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

/**
 * @fileoverview UI component for the spinner page.
 */

goog.provide('firebaseui.auth.ui.page.Spinner');

goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.page.Base');
goog.requireType('goog.dom.DomHelper');


/**
 * Spinner page UI componenet.
 */
firebaseui.auth.ui.page.Spinner = class extends firebaseui.auth.ui.page.Base {
  /**
   * @param {?goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
   */
  constructor(opt_domHelper) {
    super(
        firebaseui.auth.soy2.page.spinner, undefined, opt_domHelper, 'spinner');
  }
};

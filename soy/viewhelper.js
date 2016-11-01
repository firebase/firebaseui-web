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

/**
 * @fileoverview Helpers for Soy viewer.
 */

goog.provide('firebaseui.auth.soy2.viewHelper');
goog.setTestOnly('firebaseui.auth.soy2.viewHelper');

goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.classlist');


function isViewerMode() {
  return typeof thisIsRunningInSoyViewerMode != 'undefined' &&
      !!thisIsRunningInSoyViewerMode;
}


function isRtlMode() {
  return typeof thisIsRunningInRtlMode != 'undefined' &&
      !!thisIsRunningInRtlMode;
}


function loadCss(path) {
  var link = goog.dom.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = path;
  var head = goog.dom.getElementsByTagNameAndClass('head')[0];
  goog.dom.insertChildAt(head, link, 0);
}


function setInvalid(root, id) {
  var e = goog.dom.getElementByClass(goog.getCssName(id), root);
  goog.dom.classlist.addRemove(
      e,
      goog.getCssName('firebaseui-input'),
      goog.getCssName('firebaseui-input-invalid'));
}


function setError(root, id, message) {
  var e = goog.dom.getElementByClass(goog.getCssName(id), root);
  goog.dom.setTextContent(e, message);
  goog.dom.classlist.remove(e, goog.getCssName('firebaseui-hidden'));
}

function initViewer(file) {
  if (isViewerMode()) {
    if (isRtlMode()) {
      loadCss('../stylesheet/firebase-ui_rtl.css');
    } else {
      loadCss('../stylesheet/firebase-ui_ltr.css');
    }
  }
}

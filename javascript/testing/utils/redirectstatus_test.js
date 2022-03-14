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
 * @fileoverview Tests for redirectstatus.js.
 */

goog.provide('firebaseui.auth.RedirectStatusTest');

goog.require('firebaseui.auth.RedirectStatus');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.RedirectStatusTest');


var redirectStatus1 = new firebaseui.auth.RedirectStatus('TENANT_ID');
var redirectStatus2 = new firebaseui.auth.RedirectStatus();
var obj1 = {
  'tenantId': 'TENANT_ID'
};
var obj2 = {
  'tenantId': null
};


function testRedirectStatus() {
  assertEquals('TENANT_ID', redirectStatus1.getTenantId());
  assertNull(redirectStatus2.getTenantId());
}


function testToPlainObject() {
  assertObjectEquals(obj1, redirectStatus1.toPlainObject());
  assertObjectEquals(obj2, redirectStatus2.toPlainObject());
}


function testFromPlainObject() {
  assertObjectEquals(redirectStatus1,
                     firebaseui.auth.RedirectStatus.fromPlainObject(obj1));
  assertObjectEquals(redirectStatus2,
                     firebaseui.auth.RedirectStatus.fromPlainObject(obj2));
  assertNull(firebaseui.auth.RedirectStatus.fromPlainObject({}));
}

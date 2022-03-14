/*
 * Copyright 2018 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for actioncodeurlbuilder.js.
 */

goog.provide('firebaseui.auth.ActionCodeUrlBuilderTest');

goog.require('firebaseui.auth.ActionCodeUrlBuilder');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.ActionCodeUrlBuilderTest');


function testActionCodeUrlBuilder_outgoing() {
  var url = 'https://www.example.com/path/api?a=1&b=2#c=2';
  var builder = new firebaseui.auth.ActionCodeUrlBuilder(url);

  // Confirm expected values.
  assertNull(builder.getAnonymousUid());
  assertFalse(builder.getForceSameDevice());
  assertNull(builder.getSessionId());
  assertNull(builder.getProviderId());
  assertNull(builder.getOobCode());
  assertNull(builder.getMode());
  assertNull(builder.getApiKey());
  assertNull(builder.getTenantId());
  assertEquals(url, builder.toString());

  // Set new parameters.
  builder.setAnonymousUid('ANONYMOUS_UID');
  builder.setForceSameDevice(true);
  builder.setSessionId('SESSION_ID');
  builder.setProviderId('PROVIDER_ID');
  builder.setTenantId('TENANT_ID');

  // Confirm new parameters.
  assertEquals('ANONYMOUS_UID', builder.getAnonymousUid());
  assertTrue(builder.getForceSameDevice());
  assertEquals('SESSION_ID', builder.getSessionId());
  assertEquals('PROVIDER_ID', builder.getProviderId());
  assertNull(builder.getOobCode());
  assertNull(builder.getMode());
  assertNull(builder.getApiKey());
  assertEquals('TENANT_ID', builder.getTenantId());
  assertEquals(
      'https://www.example.com/path/api?a=1&b=2&' +
      'ui_auid=ANONYMOUS_UID&' +
      'ui_sd=1&' +
      'ui_sid=SESSION_ID&' +
      'ui_pid=PROVIDER_ID&' +
      'tenantId=TENANT_ID' +
      '#c=2',
      builder.toString());
}


function testActionCodeUrlBuilder_incoming() {
  var url = 'https://www.example.com/path/api?' +
      'apiKey=API_KEY&mode=signIn&oobCode=EMAIL_ACTION_CODE&a=1&b=2#c=2';
  var builder = new firebaseui.auth.ActionCodeUrlBuilder(
      'https://www.example.com/path/api?' +
      // Incoming link would also have API key, mode and oobCode fields.
      'apiKey=API_KEY&mode=signIn&oobCode=EMAIL_ACTION_CODE&' +
      'tenantId=TENANT_ID&' +
      'ui_auid=ANONYMOUS_UID&' +
      'ui_sd=1&' +
      'ui_sid=SESSION_ID&' +
      'ui_pid=PROVIDER_ID&' +
      'a=1&b=2#c=2');
  // Confirm expected values parsed from url.
  assertEquals('ANONYMOUS_UID', builder.getAnonymousUid());
  assertTrue(builder.getForceSameDevice());
  assertEquals('SESSION_ID', builder.getSessionId());
  assertEquals('PROVIDER_ID', builder.getProviderId());
  assertEquals('EMAIL_ACTION_CODE', builder.getOobCode());
  assertEquals('signIn', builder.getMode());
  assertEquals('API_KEY', builder.getApiKey());
  assertEquals('TENANT_ID', builder.getTenantId());

  // Clear all values.
  builder.setAnonymousUid(null);
  builder.setForceSameDevice(null);
  builder.setSessionId(null);
  builder.setProviderId(null);
  builder.setTenantId(null);
  // Confirm updated URL has relevant parameters cleared.
  assertEquals(url, builder.toString());

  // Updated parameters with new values.
  builder.setAnonymousUid('ANONYMOUS_UID2');
  builder.setForceSameDevice(false);
  builder.setSessionId('SESSION_ID2');
  builder.setProviderId('PROVIDER_ID2');
  builder.setTenantId('TENANT_ID2');

  // Confirm new expected values.
  assertEquals('ANONYMOUS_UID2', builder.getAnonymousUid());
  assertFalse(builder.getForceSameDevice());
  assertEquals('SESSION_ID2', builder.getSessionId());
  assertEquals('PROVIDER_ID2', builder.getProviderId());
  assertEquals(
      'https://www.example.com/path/api?' +
      'apiKey=API_KEY&mode=signIn&oobCode=EMAIL_ACTION_CODE&' +
      'a=1&b=2&' +
      'ui_auid=ANONYMOUS_UID2&' +
      'ui_sd=0&' +
      'ui_sid=SESSION_ID2&' +
      'ui_pid=PROVIDER_ID2&' +
      'tenantId=TENANT_ID2' +
      '#c=2',
      builder.toString());
}


function testActionCodeUrlBuilder_clearState() {
  var url = 'https://www.example.com/path/api?lang=en&a=1&b=2#c=2';
  var builder = new firebaseui.auth.ActionCodeUrlBuilder(
      'https://www.example.com/path/api?' +
      // Incoming link would also have API key, mode and oobCode fields.
      'apiKey=API_KEY&mode=signIn&oobCode=EMAIL_ACTION_CODE&' +
      'ui_auid=ANONYMOUS_UID&' +
      'ui_sd=1&' +
      'ui_sid=SESSION_ID&' +
      'ui_pid=PROVIDER_ID&' +
      'tenantId=TENANT_ID&' +
      'lang=en&a=1&b=2#c=2');

  // Confirm expected values parsed from url.
  assertEquals('ANONYMOUS_UID', builder.getAnonymousUid());
  assertTrue(builder.getForceSameDevice());
  assertEquals('SESSION_ID', builder.getSessionId());
  assertEquals('PROVIDER_ID', builder.getProviderId());
  assertEquals('EMAIL_ACTION_CODE', builder.getOobCode());
  assertEquals('signIn', builder.getMode());
  assertEquals('API_KEY', builder.getApiKey());
  assertEquals('TENANT_ID', builder.getTenantId());

  // Clear state of URL from anything related to email action codes.
  builder.clearState();

  // Confirm expected values.
  assertNull(builder.getAnonymousUid());
  assertFalse(builder.getForceSameDevice());
  assertNull(builder.getSessionId());
  assertNull(builder.getProviderId());
  assertNull(builder.getOobCode());
  assertNull(builder.getMode());
  assertNull(builder.getApiKey());
  assertNull(builder.getTenantId());
  assertEquals(url, builder.toString());
}

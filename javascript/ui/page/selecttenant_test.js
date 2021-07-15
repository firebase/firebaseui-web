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
 * @fileoverview Tests for the page displaying a list of tenants to select from.
 */

goog.module('firebaseui.auth.ui.page.SelectTenantTest');
goog.setTestOnly();


const KeyCodes = goog.require('goog.events.KeyCodes');
const MockClock = goog.require('goog.testing.MockClock');
const PageTestHelper = goog.require('firebaseui.auth.ui.page.PageTestHelper');
const SelectTenant = goog.require('firebaseui.auth.ui.page.SelectTenant');
const TagName = goog.require('goog.dom.TagName');
const TosPpTestHelper =
    goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
const dom = goog.require('goog.dom');
const events = goog.require('goog.testing.events');
const testSuite = goog.require('goog.testing.testSuite');

let mockClock;
let root;
let component;
const tosPpTestHelper = new TosPpTestHelper().registerTests();
const pageTestHelper = new PageTestHelper().registerTests();

// The tenant button click callback.
let onTenantSelect;
let selectedTenant;

testSuite({
  setUp() {
    // Set up clock.
    mockClock = new MockClock();
    mockClock.install();
    root = dom.createDom(TagName.DIV);
    document.body.appendChild(root);
    // Set up the tenant button click callback.
    selectedTenant = null;
    onTenantSelect = (tenantId) => {
      selectedTenant = tenantId;
    };

    component = new SelectTenant(
        onTenantSelect,
        [{
            tenantId: 'TENANT_ID',
            displayName: 'Contractor A',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
          },
          {
            tenantId: null,
            displayName: 'ACME',
            buttonColor: '#53B2BF',
            iconUrl: 'icon-url',
          }],
        goog.bind(
            TosPpTestHelper.prototype.onTosLinkClick,
            tosPpTestHelper),
        goog.bind(
            TosPpTestHelper.prototype.onPpLinkClick,
            tosPpTestHelper));
    component.render(root);
    tosPpTestHelper.setComponent(component);
    // Reset previous state of tosPp helper.
    tosPpTestHelper.resetState();
    pageTestHelper.setClock(mockClock).setComponent(component);
  },

  tearDown() {
    // Tear down clock.
    mockClock.tick(Infinity);
    mockClock.reset();
    component.dispose();
    dom.removeNode(root);
  },

  testSelectTenant_onClick_tenant() {
    // Test that the correct tenant ID is passed to the callback on button
    // clicked.
    const tenantButtons =
        component.getElementsByClass('firebaseui-id-tenant-selection-button');
    events.fireClickSequence(tenantButtons[0]);
    assertEquals('TENANT_ID', selectedTenant);
  },

  testSelectTenant_onEnter_tenant() {
    // Test that the correct tenant ID is passed to the callback on enter
    // pressed.
    const tenantButtons =
        component.getElementsByClass('firebaseui-id-tenant-selection-button');
    events.fireKeySequence(tenantButtons[0], KeyCodes.ENTER);
    assertEquals('TENANT_ID', selectedTenant);
  },

  testSelectTenant_onClick_topLevelProject() {
    // Test that null tenant ID is passed to the callback on button clicked
    // for top-level project.
    const tenantButtons =
        component.getElementsByClass('firebaseui-id-tenant-selection-button');
    events.fireClickSequence(tenantButtons[1]);
    assertNull(selectedTenant);
  },

  testSelectTenant_onEnter_topLevelProject() {
    // Test that null tenant ID is passed to the callback on enter pressed
    // for top-level project.
    const tenantButtons =
        component.getElementsByClass('firebaseui-id-tenant-selection-button');
    events.fireKeySequence(tenantButtons[1], KeyCodes.ENTER);
    assertNull(selectedTenant);
  },

  testSelectTenant_pageEvents() {
    component.dispose();
    // Initialize component.
    component = new SelectTenant(
        onTenantSelect,
        [{
            tenantId: 'TENANT_ID',
            displayName: 'Contractor A',
            buttonColor: '#FFB6C1',
            iconUrl: 'icon-url',
          },
          {
            tenantId: null,
            displayName: 'ACME',
            buttonColor: '#53B2BF',
            iconUrl: 'icon-url',
          }],
        goog.bind(
            TosPpTestHelper.prototype.onTosLinkClick,
            tosPpTestHelper),
        goog.bind(
            TosPpTestHelper.prototype.onPpLinkClick,
            tosPpTestHelper));
    // Run all page helper tests.
    pageTestHelper.runTests(component, root);
  },

  testSelectTenant_getPageId() {
    assertEquals('selectTenant', component.getPageId());
  },
});

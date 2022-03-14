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
 * @fileoverview Tests for the page displaying a list of supported identity
 * providers.
 */

goog.module('firebaseui.auth.ui.page.ProviderSignInTest');
goog.setTestOnly();

const IdpsTestHelper =
    goog.require('firebaseui.auth.ui.element.IdpsTestHelper');
const InfoBarTestHelper =
    goog.require('firebaseui.auth.ui.element.InfoBarTestHelper');
const MockClock = goog.require('goog.testing.MockClock');
const PageTestHelper = goog.require('firebaseui.auth.ui.page.PageTestHelper');
const ProviderSignIn = goog.require('firebaseui.auth.ui.page.ProviderSignIn');
const TagName = goog.require('goog.dom.TagName');
const TosPpTestHelper =
    goog.require('firebaseui.auth.ui.element.TosPpTestHelper');
const dom = goog.require('goog.dom');
const testSuite = goog.require('goog.testing.testSuite');

let mockClock;
let root;
let component;
const idpsTestHelper =
    new IdpsTestHelper().registerTests();
const infoBarTestHelper =
    new InfoBarTestHelper().registerTests();
const tosPpTestHelper =
    new TosPpTestHelper().registerTests();
const pageTestHelper =
    new PageTestHelper().registerTests();

testSuite({
  setUp() {
    // Set up clock.
    mockClock = new MockClock();
    mockClock.install();
    root = dom.createDom(TagName.DIV);
    document.body.appendChild(root);
    component = new ProviderSignIn(
        goog.bind(
            IdpsTestHelper.prototype.onClick,
            idpsTestHelper),
        [{
          providerId: 'google.com',
        },
        {
          providerId: 'password',
        }],
        goog.bind(
            TosPpTestHelper.prototype.onTosLinkClick,
            tosPpTestHelper),
        goog.bind(
            TosPpTestHelper.prototype.onPpLinkClick,
            tosPpTestHelper));
    component.render(root);
    idpsTestHelper.setComponent(component);
    infoBarTestHelper.setComponent(component);
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

  testProviderSignIn_pageEvents() {
    // Run page event tests.
    // Dispose previously created container since test must run before rendering
    // the component in docoument.
    component.dispose();
    // Initialize component.
    component = new ProviderSignIn(
        goog.bind(
            IdpsTestHelper.prototype.onClick,
            idpsTestHelper),
        [{
          providerId: 'facebook.com',
        },
        {
          providerId: 'password',
        }]);
    // Run all page helper tests.
    pageTestHelper.runTests(component, root);
  },

  testProviderSignIn_getPageId() {
    assertEquals('providerSignIn', component.getPageId());
  },
});

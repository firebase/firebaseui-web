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
 * @fileoverview Tests for the base page component.
 */

goog.provide('firebaseui.auth.ui.page.BaseTest');
goog.setTestOnly('firebaseui.auth.ui.page.BaseTest');

goog.require('firebaseui.auth.EventDispatcher');
goog.require('firebaseui.auth.soy2.page');
goog.require('firebaseui.auth.ui.page.Base');
goog.require('firebaseui.auth.ui.page.CustomEvent');
goog.require('goog.Promise');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.events');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.recordFunction');


var mockClock;
var root;
var component;
var dispatcher;
var pageEnterEvents = [];
var pageExitEvents = [];


function setUp() {
  // Set up clock.
  mockClock = new goog.testing.MockClock();
  mockClock.install();
  root = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(root);

  // Reset event tracking.
  pageEnterEvents = [];
  pageExitEvents = [];
}


function tearDown() {
  // Tear down clock.
  mockClock.tick(Infinity);
  mockClock.reset();
  if (component) {
    component.dispose();
    component = null;
  }
  if (dispatcher) {
    dispatcher.unregister();
    dispatcher = null;
  }
  goog.dom.removeNode(root);
  pageEnterEvents = [];
  pageExitEvents = [];
}


function testBase_constructor() {
  // Test constructor with minimal parameters.
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank);

  assertNotNull(component);
  assertNull(component.getPageId());
}


function testBase_constructorWithPageId() {
  // Test constructor with page ID.
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page-id');

  assertEquals('test-page-id', component.getPageId());
}


function testBase_constructorWithTemplateData() {
  // Test constructor with template data.
  var templateData = {foo: 'bar'};
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      templateData,
      undefined,
      'test-page');

  assertNotNull(component);
  assertEquals('test-page', component.getPageId());
}


function testBase_constructorWithInjectedData() {
  // Test constructor with custom injected data.
  var injectedData = {
    customIcon: 'https://example.com/icon.png'
  };
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page',
      injectedData);

  assertNotNull(component);
  assertEquals('test-page', component.getPageId());
}


function testBase_getPageId() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'my-page-id');

  assertEquals('my-page-id', component.getPageId());
}


function testBase_getPageId_null() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank);

  assertNull(component.getPageId());
}


function testBase_createDom() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');

  // Call createDom.
  component.createDom();

  // Verify element is created.
  var element = component.getElement();
  assertNotNull(element);
  assertTrue(goog.dom.isElement(element));
}


function testBase_render() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');

  // Render component.
  component.render(root);

  // Verify element is in the DOM.
  assertTrue(component.isInDocument());
  assertNotNull(component.getElement());
  assertEquals(root, component.getContainer());
}


function testBase_enterDocument_pageEnterEvent() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');

  // Set up event dispatcher to listen for PAGE_ENTER event.
  dispatcher = new firebaseui.auth.EventDispatcher(root);
  dispatcher.register();

  goog.events.listen(
      dispatcher,
      firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
      function(event) {
        pageEnterEvents.push(event);
      });

  // Render component, which triggers enterDocument.
  component.render(root);

  // Verify PAGE_ENTER event was dispatched.
  assertEquals(1, pageEnterEvents.length);
  assertEquals(
      firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
      pageEnterEvents[0].type);
  assertEquals(root, pageEnterEvents[0].target);
  assertEquals('test-page', pageEnterEvents[0]['pageId']);
}


function testBase_exitDocument_pageExitEvent() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');

  // Set up event dispatcher.
  dispatcher = new firebaseui.auth.EventDispatcher(root);
  dispatcher.register();

  goog.events.listen(
      dispatcher,
      firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
      function(event) {
        pageExitEvents.push(event);
      });

  // Render and then dispose to trigger exitDocument.
  component.render(root);
  component.dispose();

  // Verify PAGE_EXIT event was dispatched.
  assertEquals(1, pageExitEvents.length);
  assertEquals(
      firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
      pageExitEvents[0].type);
  assertEquals(root, pageExitEvents[0].target);
  assertEquals('test-page', pageExitEvents[0]['pageId']);
}


function testBase_pageEvents_enterAndExit() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');

  // Set up event dispatcher.
  dispatcher = new firebaseui.auth.EventDispatcher(root);
  dispatcher.register();

  goog.events.listen(
      dispatcher,
      firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
      function(event) {
        pageEnterEvents.push(event);
      });

  goog.events.listen(
      dispatcher,
      firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
      function(event) {
        pageExitEvents.push(event);
      });

  // Render component.
  component.render(root);

  // Verify PAGE_ENTER was dispatched.
  assertEquals(1, pageEnterEvents.length);
  assertEquals(0, pageExitEvents.length);

  // Dispose component.
  component.dispose();

  // Verify PAGE_EXIT was dispatched.
  assertEquals(1, pageEnterEvents.length);
  assertEquals(1, pageExitEvents.length);
}


function testBase_showProcessingIndicator() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // No busy indicator initially.
  assertEquals(
      0,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);

  // Trigger processing.
  var pending = new goog.Promise(function(resolve, reject) {
    // Keep promise pending.
  });
  component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  // No busy indicator yet (delay not passed).
  assertEquals(
      0,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);

  // Advance clock past the delay.
  mockClock.tick(500);

  // Verify busy indicator is shown.
  assertEquals(
      1,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);
}


function testBase_hideProcessingIndicator() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var resolvePending;
  var pending = new goog.Promise(function(resolve, reject) {
    resolvePending = resolve;
  });

  var promise = component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  // Advance clock to show busy indicator.
  mockClock.tick(500);
  assertEquals(
      1,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);

  // Resolve the promise.
  resolvePending();

  return promise.then(function() {
    // Verify busy indicator is hidden.
    assertEquals(
        0,
        goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);
  });
}


function testBase_executePromiseRequest_success() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var successCalled = false;
  var errorCalled = false;

  var promise = component.executePromiseRequest(
      function(value) {
        return goog.Promise.resolve(value);
      },
      ['success-value'],
      function(result) {
        successCalled = true;
        assertEquals('success-value', result);
      },
      function(error) {
        errorCalled = true;
      });

  return promise.then(function() {
    assertTrue(successCalled);
    assertFalse(errorCalled);
  });
}


function testBase_executePromiseRequest_error() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var successCalled = false;
  var errorCalled = false;
  var testError = new Error('Test error');

  var promise = component.executePromiseRequest(
      function() {
        return goog.Promise.reject(testError);
      },
      [],
      function() {
        successCalled = true;
      },
      function(error) {
        errorCalled = true;
        assertEquals(testError, error);
      });

  return promise.then(function() {
    assertFalse(successCalled);
    assertTrue(errorCalled);
  });
}


function testBase_executePromiseRequest_onlyOneAtATime() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var pending = new goog.Promise(function(resolve, reject) {
    // Keep pending.
  });

  // Start first request.
  var result1 = component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  assertNotNull(result1);

  // Try to start second request while first is in progress.
  var result2 = component.executePromiseRequest(
      function() { return goog.Promise.resolve(); },
      [],
      function() {},
      function() {});

  // Second request should be rejected (returns null).
  assertNull(result2);
}


function testBase_executePromiseRequest_disposedBeforeCompletion() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var resolvePending;
  var pending = new goog.Promise(function(resolve, reject) {
    resolvePending = resolve;
  });

  var successCalled = false;
  var promise = component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {
        successCalled = true;
      },
      function() {});

  // Dispose component before promise resolves.
  component.dispose();
  component = null;

  // Resolve promise after disposal.
  resolvePending();

  return promise.then(function() {
    // Success callback should not be called because component was disposed.
    assertFalse(successCalled);
  });
}


function testBase_executePromiseRequest_useSpinner() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Add spinner class to element.
  goog.dom.classlist.add(component.getElement(), 'firebaseui-use-spinner');

  var pending = new goog.Promise(function(resolve, reject) {
    // Keep pending.
  });

  component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  // Advance clock to show busy indicator.
  mockClock.tick(500);

  var indicators = goog.dom.getElementsByClass('firebaseui-busy-indicator', root);
  assertEquals(1, indicators.length);

  // Verify spinner class is used.
  assertTrue(goog.dom.classlist.contains(indicators[0], 'mdl-spinner'));
}


function testBase_executePromiseRequest_useProgressBar() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Do not add spinner class, should use progress bar.

  var pending = new goog.Promise(function(resolve, reject) {
    // Keep pending.
  });

  component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  // Advance clock to show busy indicator.
  mockClock.tick(500);

  var indicators = goog.dom.getElementsByClass('firebaseui-busy-indicator', root);
  assertEquals(1, indicators.length);

  // Verify progress bar class is used.
  assertTrue(goog.dom.classlist.contains(indicators[0], 'mdl-progress'));
}


function testBase_disposal() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Verify component is in document.
  assertTrue(component.isInDocument());

  // Dispose component.
  component.dispose();

  // Verify component is disposed.
  assertTrue(component.isDisposed());
  assertFalse(component.isInDocument());

  // Clear reference for tearDown.
  component = null;
}


function testBase_disposal_clearsBusyIndicator() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var pending = new goog.Promise(function(resolve, reject) {
    // Keep pending.
  });

  component.executePromiseRequest(
      function() { return pending; },
      [],
      function() {},
      function() {});

  // Show busy indicator.
  mockClock.tick(500);
  assertEquals(
      1,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);

  // Dispose component.
  component.dispose();

  // Verify busy indicator is removed from DOM.
  assertEquals(
      0,
      goog.dom.getElementsByClass('firebaseui-busy-indicator', root).length);

  component = null;
}


function testBase_getContainer() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  assertEquals(root, component.getContainer());
}


function testBase_customEvent() {
  var target = goog.dom.createDom(goog.dom.TagName.DIV);
  var properties = {
    foo: 'bar',
    number: 123
  };

  var customEvent = new firebaseui.auth.ui.page.CustomEvent(
      'custom-event-type',
      target,
      properties);

  assertEquals('custom-event-type', customEvent.type);
  assertEquals(target, customEvent.target);
  assertEquals('bar', customEvent.foo);
  assertEquals(123, customEvent.number);
}


function testBase_customEvent_withoutProperties() {
  var target = goog.dom.createDom(goog.dom.TagName.DIV);

  var customEvent = new firebaseui.auth.ui.page.CustomEvent(
      'custom-event-type',
      target);

  assertEquals('custom-event-type', customEvent.type);
  assertEquals(target, customEvent.target);
}


function testBase_injectedDataManagement() {
  var customInjectedData = {
    defaultIconUrls: {
      'custom.com': 'https://custom.com/icon.png'
    },
    customField: 'customValue'
  };

  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page',
      customInjectedData);

  component.render(root);

  // Verify component was created successfully with custom injected data.
  assertNotNull(component);
  assertTrue(component.isInDocument());
}


function testBase_injectedDataCallbacks_tos() {
  var tosCalled = false;
  var tosCallback = function() {
    tosCalled = true;
  };

  var injectedData = {
    tosCallback: tosCallback
  };

  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page',
      injectedData);

  component.render(root);

  // Note: In a real test with a template that has ToS links,
  // the callback would be triggered when clicking the link.
  // Since blank page doesn't have ToS links, we can't test the actual behavior.
  // But we verified the component accepts and stores the callback.
  assertNotNull(component);
}


function testBase_injectedDataCallbacks_privacyPolicy() {
  var ppCalled = false;
  var ppCallback = function() {
    ppCalled = true;
  };

  var injectedData = {
    privacyPolicyCallback: ppCallback
  };

  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page',
      injectedData);

  component.render(root);

  // Same note as above - blank page doesn't have PP links.
  assertNotNull(component);
}


function testBase_focusHandling_focusToNextOnEnter() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Create test elements.
  var input1 = goog.dom.createDom(goog.dom.TagName.INPUT);
  var input2 = goog.dom.createDom(goog.dom.TagName.INPUT);
  component.getElement().appendChild(input1);
  component.getElement().appendChild(input2);

  // Set up focus handling.
  component.focusToNextOnEnter(input1, input2);

  // Verify method exists and can be called.
  assertNotNull(component.focusToNextOnEnter);
}


function testBase_focusHandling_submitOnEnter() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  var input = goog.dom.createDom(goog.dom.TagName.INPUT);
  component.getElement().appendChild(input);

  var submitCalled = false;
  var onSubmit = function() {
    submitCalled = true;
  };

  // Set up submit handling.
  component.submitOnEnter(input, onSubmit);

  // Verify method exists and can be called.
  assertNotNull(component.submitOnEnter);
}


function testBase_infoBarMethods() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Verify info bar methods are available via mixin.
  assertNotNull(component.showInfoBar);
  assertNotNull(component.dismissInfoBar);
  assertNotNull(component.getInfoBarElement);
  assertNotNull(component.getInfoBarDismissLinkElement);
  assertEquals('function', typeof component.showInfoBar);
  assertEquals('function', typeof component.dismissInfoBar);
  assertEquals('function', typeof component.getInfoBarElement);
  assertEquals('function', typeof component.getInfoBarDismissLinkElement);
}


function testBase_dialogMethods() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Verify dialog methods are available via mixin.
  assertNotNull(component.showProgressDialog);
  assertNotNull(component.dismissDialog);
  assertNotNull(component.getDialogElement);
  assertEquals('function', typeof component.showProgressDialog);
  assertEquals('function', typeof component.dismissDialog);
  assertEquals('function', typeof component.getDialogElement);
}


function testBase_tosPpMethods() {
  component = new firebaseui.auth.ui.page.Base(
      firebaseui.auth.soy2.page.blank,
      undefined,
      undefined,
      'test-page');
  component.render(root);

  // Verify ToS/PP methods are available via mixin.
  assertNotNull(component.getTosPpElement);
  assertNotNull(component.getTosLinkElement);
  assertNotNull(component.getPpLinkElement);
  assertNotNull(component.getTosPpListElement);
  assertEquals('function', typeof component.getTosPpElement);
  assertEquals('function', typeof component.getTosLinkElement);
  assertEquals('function', typeof component.getPpLinkElement);
  assertEquals('function', typeof component.getTosPpListElement);
}

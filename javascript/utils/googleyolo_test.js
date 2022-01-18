/*
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @fileoverview Tests for googleyolo.js
 */

goog.provide('firebaseui.auth.GoogleYoloTest');

goog.require('firebaseui.auth.GoogleYolo');
goog.require('firebaseui.auth.util');
goog.require('goog.Promise');
goog.require('goog.dispose');
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.net.jsloader');
goog.require('goog.string.Const');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');
goog.require('goog.testing.mockmatchers');

goog.setTestOnly('firebaseui.auth.GoogleYoloTest');


var mockControl;
var ignoreArgument;
var clock;
var googleYoloClientId = '1234567890.apps.googleusercontent.com';
// Mock credential returned by googleyolo.
var googleYoloCredential = {
  'credential': 'ID_TOKEN',
  'clientId': googleYoloClientId,
};


function setUp() {
  // Install mock clock.
  clock = new goog.testing.MockClock(true);
  mockControl = new goog.testing.MockControl();
  ignoreArgument = goog.testing.mockmatchers.ignoreArgument;
}


function tearDown() {
  goog.dispose(clock);
  mockControl.$verifyAll();
  mockControl.$tearDown();
  delete goog.global['google'];
  delete goog.global['onGoogleLibraryLoad'];
}


/** @return {!SmartLockApi} A googleyolo mock object. */
function initializeGoogleYoloMock() {
  return {
    'cancel': mockControl.createFunctionMock('cancel'),
    'initialize': mockControl.createFunctionMock('initialize'),
    'prompt': mockControl.createFunctionMock('prompt')
  };
}


function testGoogleYolo_show_autoSignInEnabled() {
  // Test when auto sign-in is enabled.
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        config.callback(googleYoloCredential);
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_show_autoSignInDisabled() {
  // Test when auto sign-in is disabled and a credential is selected from
  // list of accounts.
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertFalse(config.auto_select);
        config.callback(googleYoloCredential);
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloClientId, true)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_noAvailableCredentials() {
  // Test when auto sign-in is enabled and no credentials are available.
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        // Simulate no credential. Promise should not resolve.
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        throw new Error('Should not resolve');
      });
}


function testGoogleYolo_cancel() {
  // Tests when cancel is manually called.
  // User cancelled flow.
  var cancelled = false;
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        cancelled = true;
      });
  mockGoogleYolo.prompt().$once();
  mockGoogleYolo.cancel().$once();
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        assertTrue(cancelled);
        config.callback(googleYoloCredential);
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  // All calls to cancel should have no effect before show is called.
  googleYolo.cancel();
  googleYolo.cancel();
  googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
  // This will take effect and cancel the above show call.
  googleYolo.cancel();
  return googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noGoogleYolo_success() {
  // Tests when googleyolo namespace is not available.
  var googleYoloLoader =
      mockControl.createStrictMock(firebaseui.auth.GoogleYolo.Loader);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo.Loader, 'getInstance');
  var mockGoogleYolo = initializeGoogleYoloMock();
  getInstance().$returns(googleYoloLoader);
  // googleyolo should be dynamically loaded.
  googleYoloLoader.load()
      .$once()
      .$does(function() {
        // Simulate successful load.
        return goog.Promise.resolve().then(function() {
          goog.global['google'] = {
            'accounts': {
              'id': mockGoogleYolo,
            },
          };
        });
      });
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        config.callback(googleYoloCredential);
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  // googleyolo namespace not available. This will dynamically load googleyolo.
  var googleYolo = new firebaseui.auth.GoogleYolo(null);
  // This should do nothing.
  googleYolo.cancel();
  return googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        assertEquals(mockGoogleYolo, goog.global['google'].accounts.id);
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noGoogleYolo_retrialAfterError() {
  // Tests when googleyolo namespace is not available.
  // This will test a flow where load initially fails and then succeeds after
  // retrial.
  var mockGoogleYolo = initializeGoogleYoloMock();
  var googleYoloLoader =
      mockControl.createStrictMock(firebaseui.auth.GoogleYolo.Loader);
  var getInstance = mockControl.createMethodMock(
      firebaseui.auth.GoogleYolo.Loader, 'getInstance');
  getInstance().$returns(googleYoloLoader);
  // googleyolo should be dynamically loaded.
  googleYoloLoader.load()
      .$once()
      .$does(function() {
        // Simulate unsuccessful initial load.
        return goog.Promise.reject();
      });
  getInstance().$returns(googleYoloLoader);
  // Simulate second call succeeding.
  googleYoloLoader.load()
      .$once()
      .$does(function() {
        // Simulate successful load.
        return goog.Promise.resolve().then(function() {
          goog.global['google'] = {
            'accounts': {
              'id': mockGoogleYolo,
            },
          };
        });
      });
  mockGoogleYolo.initialize(ignoreArgument).$once()
      .$does(function(config) {
        assertEquals(googleYoloClientId, config.client_id);
        assertTrue(config.auto_select);
        config.callback(googleYoloCredential);
      });
  mockGoogleYolo.prompt().$once();
  mockControl.$replayAll();

  // googleyolo namespace not available. This will dynamically load googleyolo.
  var googleYolo = new firebaseui.auth.GoogleYolo(null);
  return googleYolo.show(googleYoloClientId, false)
      .then(function(actualCredential) {
        assertUndefined(goog.global['google']);
        assertNull(actualCredential);
        // Try again. This should succeed.
        return googleYolo.show(googleYoloClientId, false);
      })
      .then(function(actualCredential) {
        assertEquals(mockGoogleYolo, goog.global['google'].accounts.id);
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noop_noConfig() {
  // Tests when googleyolo config is not available.
  // No googleyolo config available. All operations will be no-ops.
  var mockGoogleYolo = initializeGoogleYoloMock();
  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(null, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
}


function testGoogleYoloLoader_dynamicLoading_onGoogleLibraryLoad_triggered() {
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://accounts.google.com/gsi/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // As library not available, try to load dynamically.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          goog.global['google'] = {
            'accounts': {
              'id': initializeGoogleYoloMock(),
            },
          };
          goog.global['onGoogleLibraryLoad']();
        });
      });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['google'] === 'object');
    // This should resolve with cached googleyolo without jsloader called again.
    return googleYoloLoader.load();
  });
}


function testGoogleYoloLoader_dynamicLoading_onGoogleLibraryLoad_notCalled() {
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://accounts.google.com/gsi/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // As library not available, try to load dynamically.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          // Should still resolve even if onGoogleLibraryLoad is not called.
          goog.global['google'] = {
            'accounts': {
              'id': initializeGoogleYoloMock(),
            },
          };
        });
      });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['google'] === 'object');
    // This should resolve with cached googleyolo without jsloader called again.
    return googleYoloLoader.load();
  });
}


function testGoogleYoloLoader_loadedOnDomReady() {
  // No safeLoad call.
  mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  var onDomReady = mockControl.createMethodMock(
      firebaseui.auth.util, 'onDomReady');
  // Simulate googleyolo already loaded on DOM ready.
  onDomReady().$once().$does(function() {
    goog.global['google'] = {
      'accounts': {
        'id': initializeGoogleYoloMock(),
      },
    };
    return goog.Promise.resolve();
  });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['google'] === 'object');
  });
}


function testGoogleYoloLoader_loadedBeforeCall() {
  // Simulate already loaded.
  goog.global['google'] = {
    'accounts': {
      'id': initializeGoogleYoloMock(),
    },
  };
  mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  mockControl.createMethodMock(firebaseui.auth.util, 'onDomReady');
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['google'] === 'object');
  });
}


function testGoogleYoloLoader_successAfterGenericError() {
  var expectedError = new Error;
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://accounts.google.com/gsi/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // Simulate first load failing with expected error.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        // Throw an error in loading.
        return goog.Promise.reject(expectedError);
      });
  // Simulate second call succeeding.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          goog.global['google'] = {
            'accounts': {
              'id': initializeGoogleYoloMock(),
            },
          };
          goog.global['onGoogleLibraryLoad']();
        });
      });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().thenCatch(function(error) {
    // First call will fail with expected error.
    assertEquals(expectedError, error);
    // Second call will succeed.
    return googleYoloLoader.load()
        .then(function() {
          // googleyolo should be loaded.
          assertTrue(typeof goog.global['google'] === 'object');
          // Third call should succeed without jsloader running.
          return googleYoloLoader.load();
        });
  });
}


function testGoogleYoloLoader_successAfterTimeout() {
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://accounts.google.com/gsi/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // Simulate first call not resolving.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        // Simulate timeout.
        clock.tick(10000);
        return goog.Promise.resolve();
      });
  // Second call will succeed.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          goog.global['google'] = {
            'accounts': {
              'id': initializeGoogleYoloMock(),
            },
          };
          goog.global['onGoogleLibraryLoad']();
        });
      });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(fail, function(error) {
    // First call will fail with expected error due to loading timeout.
    assertEquals('Network error!', error.message);
    // Second call will succeed.
    return googleYoloLoader.load()
        .then(function() {
          // googleyolo should be loaded.
          assertTrue(typeof goog.global['google'] === 'object');
          // Third call should succeed without jsloader running.
          return googleYoloLoader.load();
        });
  });
}

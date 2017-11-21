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
goog.require('goog.html.TrustedResourceUrl');
goog.require('goog.net.jsloader');
goog.require('goog.string.Const');
goog.require('goog.testing.MockClock');
goog.require('goog.testing.MockControl');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.GoogleYoloTest');


var mockControl;
var clock;
// Mock googleyolo config.
var googleYoloConfig = {
  'supportedAuthMethods': [
    'https://accounts.google.com',
    'googleyolo://id-and-password'
  ],
  'supportedIdTokenProviders': [
    {
      'uri': 'https://accounts.google.com',
      'clientId': '1234567890.apps.googleusercontent.com'
    }
  ]
};
// Mock credential returned by googleyolo.
var googleYoloCredential = {
  'idToken': 'ID_TOKEN',
  'id': 'user@example.com',
  'authMethod': 'https://accounts.google.com'
};


function setUp() {
  // Install mock clock.
  clock = new goog.testing.MockClock(true);
  mockControl = new goog.testing.MockControl();
}


function tearDown() {
  goog.dispose(clock);
  mockControl.$verifyAll();
  mockControl.$tearDown();
  delete goog.global['googleyolo'];
  delete goog.global['onGoogleYoloLoad'];
}


/**
 * Returns a googleyolo error for the type provided.
 * @param {string} type The error type.
 * @return {!Error} The corresponding googleyolo error.
 */
function createGoogleYoloError(type) {
  var err = new Error;
  err.type = type;
  return err;
}


/** @return {!SmartLockApi} A googleyolo mock object. */
function initializeGoogleYoloMock() {
  return {
    'cancelLastOperation': mockControl.createFunctionMock(
        'cancelLastOperation'),
    'retrieve': mockControl.createFunctionMock('retrieve'),
    'hint': mockControl.createFunctionMock('hint')
  };
}


function testGoogleYolo_show_autoSignInEnabled_noSavedCredentials() {
  // Test when auto sign-in is enabled and no saved credentials are available.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('noCredentialsAvailable'));
  });
  mockGoogleYolo.hint(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_userCancelled_whileRetrieve() {
  // Test when auto sign-in is enabled and user cancels the flow while
  // retrieving the saved credential.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('userCanceled'));
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_userCancelled_whileSelection() {
  // Test when auto sign-in is enabled and user cancels the flow while
  // selecting a credential from list of accounts.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('noCredentialsAvailable'));
  });
  mockGoogleYolo.hint(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('userCanceled'));
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
}


function testGoogleYolo_show_autoSignInDisabled_savedCredential() {
  // Test when auto sign-in is disabled and a credential is selected from
  // list of accounts.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.hint(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, true)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_noAvailableCredentials() {
  // Test when auto sign-in is enabled and no credentials are available.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('noCredentialsAvailable'));
  });
  mockGoogleYolo.hint(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('noCredentialsAvailable'));
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_savedCredentials() {
  // Test when auto sign-in is enabled and a saved credential is retrieved.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_show_autoSignInEnabled_concurrent() {
  // Test when auto sign-in is enabled and a previous One-Tap UI is already
  // rendered.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  var mockGoogleYolo = initializeGoogleYoloMock();
  // The first call will fail with the concurrent request error.
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.reject(createGoogleYoloError('illegalConcurrentRequest'));
  });
  // The above error will lead to a call to cancelLastOperation.
  mockGoogleYolo.cancelLastOperation().$once().$does(function() {
    return Promise.resolve();
  });
  // The show routine will be called again.
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_cancel() {
  // Tests when cancel is manually called.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  // User cancelled flow.
  var retrieveReject = null;
  var userCancelledError = createGoogleYoloError('userCanceled');
  var cancelled = false;
  var mockGoogleYolo = initializeGoogleYoloMock();
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return new Promise(function(resolve, reject) {
      cancelled = true;
      retrieveReject = reject;
    });
  });
  mockGoogleYolo.cancelLastOperation().$once().$does(function() {
    retrieveReject(userCancelledError);
    return Promise.resolve();
  });
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    // This will wait until above resolves.
    assertTrue(cancelled);
    return Promise.reject(createGoogleYoloError('noCredentialsAvailable'));
  });
  // This corresponds to second call to show.
  mockGoogleYolo.hint(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();

  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  // All calls to cancel should have no effect before show is called.
  googleYolo.cancel();
  googleYolo.cancel();
  googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
  // This will take effect and cancel the above show call.
  googleYolo.cancel();
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noGoogleYolo_success() {
  // Tests when googleyolo namespace is not available.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
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
          goog.global['googleyolo'] = mockGoogleYolo;
        });
      });
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();
  // googleyolo namespace not available. This will dynamically load googleyolo.
  var googleYolo = new firebaseui.auth.GoogleYolo(null);
  // This should do nothing.
  googleYolo.cancel();
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertEquals(mockGoogleYolo, goog.global['googleyolo']);
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noGoogleYolo_retrialAfterError() {
  // Tests when googleyolo namespace is not available.
  // This will test a flow where load initially fails and then succeeds after
  // retrial.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
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
          goog.global['googleyolo'] = mockGoogleYolo;
        });
      });
  mockGoogleYolo.retrieve(googleYoloConfig).$once().$does(function() {
    return Promise.resolve(googleYoloCredential);
  });
  mockControl.$replayAll();
  // googleyolo namespace not available. This will dynamically load googleyolo.
  var googleYolo = new firebaseui.auth.GoogleYolo(null);
  return googleYolo.show(googleYoloConfig, false)
      .then(function(actualCredential) {
        assertUndefined(goog.global['googleyolo']);
        assertNull(actualCredential);
        // Try again. This should succeed.
        return googleYolo.show(googleYoloConfig, false);
      })
      .then(function(actualCredential) {
        assertEquals(mockGoogleYolo, goog.global['googleyolo']);
        assertObjectEquals(googleYoloCredential, actualCredential);
      });
}


function testGoogleYolo_noop_noConfig() {
  // Tests when googleyolo config is not available.
  // Ignore old browsers where googleyolo will not work.
  if (typeof Promise === 'undefined') {
    return;
  }
  // No googleyolo config available. All operations will be no-ops.
  var mockGoogleYolo = initializeGoogleYoloMock();
  var googleYolo = new firebaseui.auth.GoogleYolo(mockGoogleYolo);
  return googleYolo.show(null, false)
      .then(function(actualCredential) {
        assertNull(actualCredential);
      });
}


function testGoogleYoloLoader_dynamicLoading() {
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://smartlock.google.com/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // As library not available, try to load dynamically.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          goog.global['googleyolo'] = initializeGoogleYoloMock();
          goog.global['onGoogleYoloLoad'](goog.global['googleyolo']);
        });
      });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['googleyolo'] === 'object');
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
    goog.global['googleyolo'] = initializeGoogleYoloMock();
    return goog.Promise.resolve();
  });
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['googleyolo'] === 'object');
  });
}


function testGoogleYoloLoader_loadedBeforeCall() {
  // Simulate already loaded.
  goog.global['googleyolo'] = initializeGoogleYoloMock();
  mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  mockControl.createMethodMock(firebaseui.auth.util, 'onDomReady');
  mockControl.$replayAll();

  var googleYoloLoader = new firebaseui.auth.GoogleYolo.Loader();
  return googleYoloLoader.load().then(function() {
    // googleyolo should be loaded.
    assertTrue(typeof goog.global['googleyolo'] === 'object');
  });
}


function testGoogleYoloLoader_successAfterGenericError() {
  var expectedError = new Error;
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://smartlock.google.com/client'));
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
          goog.global['googleyolo'] = initializeGoogleYoloMock();
          goog.global['onGoogleYoloLoad'](goog.global['googleyolo']);
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
          assertTrue(typeof goog.global['googleyolo'] === 'object');
          // Third call should succeed without jsloader running.
          return googleYoloLoader.load();
        });
  });
}


function testGoogleYoloLoader_successAfterTimeout() {
  var expectedUrl = goog.html.TrustedResourceUrl.fromConstant(
      goog.string.Const.from('https://smartlock.google.com/client'));
  var safeLoad = mockControl.createMethodMock(goog.net.jsloader, 'safeLoad');
  // Simulate first call not resolving.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        // Simulate timeout.
        clock.tick(10000);
        return new goog.Promise.resolve();
      });
  // Second call will succeed.
  safeLoad(expectedUrl)
      .$once()
      .$does(function(url) {
        return goog.Promise.resolve().then(function() {
          goog.global['googleyolo'] = initializeGoogleYoloMock();
          goog.global['onGoogleYoloLoad'](goog.global['googleyolo']);
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
          assertTrue(typeof goog.global['googleyolo'] === 'object');
          // Third call should succeed without jsloader running.
          return googleYoloLoader.load();
        });
  });
}

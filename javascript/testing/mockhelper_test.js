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
 * @fileoverview Tests for mockhelper.js
 */

goog.provide('firebaseui.auth.MockHelperTest');

goog.require('firebaseui.auth.testing.MockHelper');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.MockHelperTest');


var myMock;


function setUp() {
  var ref1 = {};
  var ref2 = {};
  var asyncMethods = {
    'METHOD_1': {
      'name': 'method1',
      'context': ref1
    },
    'METHOD_2': {
      'name': 'method2',
      'context': ref1
    },
    'METHOD_3': {
      'name': 'method3',
      'context': ref2
    },
    'METHOD_4': {
      'name': 'method4',
      'context': ref2
    },
  };
  myMock = new firebaseui.auth.testing.MockHelper(asyncMethods);
  myMock['ref1'] = ref1;
  myMock['ref2'] = ref2;
}


function testMockHelper_success() {
  var expectedError1 = new Error('foo');
  var expectedError2 = new Error('bar');
  myMock.install();
  myMock['ref1'].method1(true, {'a': 1}).then(function(result) {
    assertEquals('success', result);
    return myMock['ref2'].method3();
  }).then(function(result) {
    assertFalse(result);
    return myMock['ref1'].method2('something');
  }).thenCatch(function(error) {
    assertEquals(expectedError1, error);
    return myMock['ref2'].method4(10);
  }).thenCatch(function(error) {
    assertEquals(expectedError2, error);
    return myMock['ref1'].method1();
  });
  myMock['ref1'].assertMethod1([true, {'a': 1}], 'success');
  myMock['ref2'].assertMethod3([], function() {return false;});
  return myMock.process().then(function() {
    // These asserts can also be chained with process.
    myMock['ref1'].assertMethod2(['something'], null, expectedError1);
    myMock['ref2'].assertMethod4(
        [10], null, function() {return expectedError2;});
    myMock['ref1'].assertMethod1([]);
    return myMock.process().then(function() {
      return myMock.uninstall();
    });
  });
}


function testMockHelper_uncalledApiError() {
  // Asserting a different API than the one actually called.
  myMock.install();
  myMock['ref1'].method1(true, {'a': 1}).then(function(result) {
    assertEquals('success', result);
    return myMock['ref2'].method3();
  });
  // This will never get called and will result in a missing API request
  // error.
  myMock['ref2'].assertMethod3([], function() {return false;});
  return myMock.process().then(function() {
    return myMock.uninstall();
  }).thenCatch(function(e) {
    assertEquals(
        'missing API request: method3', e.message);
  });
}


function testMockHelper_unexpectedApiError() {
  // Forgetting to assert API calls that were actually called.
  myMock.install();
  myMock['ref1'].method1(true, {'a': 1}).then(function(result) {
    assertEquals('success', result);
    // This unexpect API call will throw an error.
    return myMock['ref2'].method3();
  }, function(result) {
    assertFalse(result);
    return myMock['ref1'].method2('something');
  });
  // Simulate method1 API call only.
  myMock['ref1'].assertMethod1([true, {'a': 1}], 'success');
  return myMock.process().then(function() {
    return myMock.uninstall();
  }).thenCatch(function(e) {
    assertEquals(
        'unexpected API request(s): method3', e.message);
  });
}

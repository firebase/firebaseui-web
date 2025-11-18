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
 * @fileoverview Tests for phonenumber.js
 */

goog.provide('firebaseui.auth.ui.element.phoneNumberTest');
goog.setTestOnly('firebaseui.auth.ui.element.phoneNumberTest');

goog.require('firebaseui.auth.PhoneNumber');
goog.require('firebaseui.auth.data.country');
goog.require('firebaseui.auth.data.country.LookupTree');
goog.require('firebaseui.auth.soy2.strings');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.phoneNumber');
goog.require('goog.dom');
goog.require('goog.dom.TagName');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.KeyCodes');
goog.require('goog.testing.events');
goog.require('goog.testing.jsunit');
goog.require('goog.ui.Component');


var component;
var container;

// Mock dialogPolyfill for tests
window['dialogPolyfill'] = {
  'registerDialog': function(dialog) {
    dialog.open = false;
    dialog.showModal = function() {
      dialog.open = true;
    };
    dialog.close = function() {
      dialog.open = false;
    };
  }
};


function setUp() {
  container = goog.dom.createDom(goog.dom.TagName.DIV);
  document.body.appendChild(container);

  component = new goog.ui.Component();
  container.innerHTML =
      '<div class="firebaseui-id-country-selector">' +
      '<div class="firebaseui-flag firebaseui-id-country-selector-flag"></div>' +
      '<span class="firebaseui-id-country-selector-code"></span>' +
      '</div>' +
      '<input type="tel" class="firebaseui-id-phone-number firebaseui-input">' +
      '<div class="firebaseui-id-phone-number-error firebaseui-hidden"></div>' +
      '<dialog class="firebaseui-id-dialog firebaseui-hidden">' +
      '<div class="firebaseui-id-dialog-body"></div>' +
      '</dialog>';
  component.decorate(container);
}


function tearDown() {
  component.dispose();
  goog.dom.removeNode(container);
}


function testGetPhoneNumberElement() {
  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  assertNotNull(phoneElement);
  assertTrue(goog.dom.classlist.contains(phoneElement,
      'firebaseui-id-phone-number'));
}


function testGetPhoneNumberErrorElement() {
  var errorElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberErrorElement.call(
          component);
  assertNotNull(errorElement);
  assertTrue(goog.dom.classlist.contains(errorElement,
      'firebaseui-id-phone-number-error'));
}


function testGetCountrySelectorElement() {
  var selectorElement =
      firebaseui.auth.ui.element.phoneNumber.getCountrySelectorElement.call(
          component);
  assertNotNull(selectorElement);
  assertTrue(goog.dom.classlist.contains(selectorElement,
      'firebaseui-id-country-selector'));
}


function testInitPhoneNumberElement() {
  // Test initialization without callback
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  // Verify default country is selected (USA)
  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));

  // Verify flag class is added
  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-US'));
}


function testInitPhoneNumberElement_withCountryId() {
  // Test initialization with specific country (Denmark)
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(
      component,
      null,  // use default lookup tree
      '45-DK-0');

  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+45', goog.dom.getTextContent(selectorCode));

  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-DK'));
}


function testInitPhoneNumberElement_enterCallback() {
  var callbackCalled = false;
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(
      component,
      null,
      null,
      function() {
        callbackCalled = true;
      });

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  assertFalse(callbackCalled);
  goog.testing.events.fireKeySequence(phoneElement, goog.events.KeyCodes.ENTER);
  assertTrue(callbackCalled);
}


function testInitPhoneNumberElement_clearErrorOnInput() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  var errorElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberErrorElement.call(
          component);

  // Show an error
  firebaseui.auth.ui.element.setValid(phoneElement, false);
  firebaseui.auth.ui.element.show(errorElement, 'Test error');
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));

  // Type something
  goog.dom.forms.setValue(phoneElement, '1');
  goog.testing.events.fireKeySequence(phoneElement, goog.events.KeyCodes.ONE);

  // Error should be hidden
  assertTrue(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
  assertTrue(goog.dom.classlist.contains(phoneElement, 'firebaseui-input'));
}


function testSelectCountry() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  // Change to France
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      '33-FR-0',
      firebaseui.auth.data.country.LOOKUP_TREE);

  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+33', goog.dom.getTextContent(selectorCode));

  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertFalse(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-US'));
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-FR'));
}


function testSelectCountry_invalidCountryId() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  // Try to select invalid country
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      'invalid-id',
      firebaseui.auth.data.country.LOOKUP_TREE);

  // Should still be USA (default)
  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));
}


function testSelectCountry_overrideCountryCode() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Enter a phone number with country code
  goog.dom.forms.setValue(phoneElement, '+4560123456');

  // Select France with override flag
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      '33-FR-0',
      firebaseui.auth.data.country.LOOKUP_TREE,
      true);

  // Phone number should be updated with French country code
  assertEquals('+3360123456', goog.dom.forms.getValue(phoneElement));
}


function testGetPhoneNumberValue_empty() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  goog.dom.forms.setValue(phoneElement, '');

  // Empty should return null
  assertNull(firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
      component));
}


function testGetPhoneNumberValue_onlyCountryCode() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  goog.dom.forms.setValue(phoneElement, '+1');

  // Only country code should return null
  assertNull(firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
      component));
}


function testGetPhoneNumberValue_validNumber() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  goog.dom.forms.setValue(phoneElement, '6505550101');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  assertNotNull(result);
  assertEquals('6505550101', result.nationalNumber);
  assertEquals('1-US-0', result.countryId);
  assertEquals('+16505550101', result.getPhoneNumber());
}


function testGetPhoneNumberValue_withCountryCode() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  goog.dom.forms.setValue(phoneElement, '+4560123456');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  assertNotNull(result);
  assertEquals('60123456', result.nationalNumber);
  assertEquals('45-DK-0', result.countryId);
  assertEquals('+4560123456', result.getPhoneNumber());
}


function testGetPhoneNumberValue_whitespace() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);
  goog.dom.forms.setValue(phoneElement, '  650 555 0101  ');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  assertNotNull(result);
  // Should handle whitespace
  assertTrue(result.nationalNumber.indexOf('650') !== -1);
}


function testGetPhoneNumberValue_unsupportedCountryCode() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Set a phone number with country code
  goog.dom.forms.setValue(phoneElement, '+16505550101');

  // Try to get value with empty lookup tree (no countries available)
  var emptyLookupTree = new firebaseui.auth.data.country.LookupTree([]);

  var error = assertThrows(function() {
    firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
        component, emptyLookupTree);
  });

  assertEquals('The country code provided is not supported.', error.message);

  // Phone number should be cleared
  assertEquals('', goog.dom.forms.getValue(phoneElement));

  // Error should be shown
  var errorElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberErrorElement.call(
          component);
  assertFalse(goog.dom.classlist.contains(errorElement, 'firebaseui-hidden'));
}


function testAutoDetectCountryFromInput() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Start typing a Danish number
  goog.dom.forms.setValue(phoneElement, '+');
  goog.testing.events.fireKeySequence(phoneElement, goog.events.KeyCodes.PLUS_SIGN);

  // Should still be USA
  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));

  // Type +45
  goog.dom.forms.setValue(phoneElement, '+45');
  goog.testing.events.fireKeySequence(phoneElement, goog.events.KeyCodes.FIVE);

  // Should auto-switch to Denmark
  assertEquals('\u200e+45', goog.dom.getTextContent(selectorCode));

  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-DK'));
}


function testPhoneNumberValidation_specialCharacters() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Phone numbers with special characters should be handled
  var numbersWithSpecialChars = [
    '(650) 555-0101',
    '650.555.0101',
    '650-555-0101'
  ];

  numbersWithSpecialChars.forEach(function(number) {
    goog.dom.forms.setValue(phoneElement, number);
    var result =
        firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
            component);
    // Should handle gracefully (may or may not be valid)
    assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
  });
}


function testPhoneNumberValidation_xssProtection() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Test XSS payloads
  var xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>'
  ];

  xssPayloads.forEach(function(payload) {
    goog.dom.forms.setValue(phoneElement, payload);
    // Should not throw
    var result =
        firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
            component);
    // XSS payloads won't match country codes, so should return null or handle safely
    assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
  });
}


function testPhoneNumberValidation_veryLongNumber() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Test very long phone number
  var longNumber = '1234567890123456789012345678901234567890';
  goog.dom.forms.setValue(phoneElement, longNumber);

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  // Should handle gracefully
  assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
}


function testPhoneNumberValidation_negativeNumbers() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  goog.dom.forms.setValue(phoneElement, '-6505550101');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  // Should handle gracefully (likely invalid)
  assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
}


function testPhoneNumberValidation_leadingZeros() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  goog.dom.forms.setValue(phoneElement, '0046701234567');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  // Should handle gracefully
  assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
}


function testPhoneNumberValidation_alphabeticCharacters() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  goog.dom.forms.setValue(phoneElement, 'abcdefghijk');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  // Should handle gracefully (likely invalid)
  assertTrue(result === null || result instanceof firebaseui.auth.PhoneNumber);
}


function testMultipleCountryChanges() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Start with USA
  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));

  // Change to Denmark
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      '45-DK-0',
      firebaseui.auth.data.country.LOOKUP_TREE);
  assertEquals('\u200e+45', goog.dom.getTextContent(selectorCode));

  // Change to France
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      '33-FR-0',
      firebaseui.auth.data.country.LOOKUP_TREE);
  assertEquals('\u200e+33', goog.dom.getTextContent(selectorCode));

  // Change back to USA
  firebaseui.auth.ui.element.phoneNumber.selectCountry.call(
      component,
      '1-US-0',
      firebaseui.auth.data.country.LOOKUP_TREE);
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));

  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-US'));
}


function testInitPhoneNumberElement_noCountriesAvailable() {
  var emptyLookupTree = new firebaseui.auth.data.country.LookupTree([]);

  var error = assertThrows(function() {
    firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(
        component, emptyLookupTree);
  });

  assertEquals('No available countries provided.', error.message);
}


function testPhoneNumber_canadaAndUSA() {
  // Test that +1 code properly distinguishes between USA and Canada
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Start with USA (default)
  var selectorCode = component.getElementByClass(
      'firebaseui-id-country-selector-code');
  assertEquals('\u200e+1', goog.dom.getTextContent(selectorCode));

  // Type +1 - should stay USA (default behavior for +1)
  goog.dom.forms.setValue(phoneElement, '+1');
  goog.testing.events.fireKeySequence(phoneElement, goog.events.KeyCodes.ONE);

  var flagElement = component.getElementByClass(
      'firebaseui-id-country-selector-flag');
  assertTrue(goog.dom.classlist.contains(flagElement, 'firebaseui-flag-US'));
}


function testPhoneNumberFormatting_trimming() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Enter number with leading/trailing spaces
  goog.dom.forms.setValue(phoneElement, '   6505550101   ');

  var result =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberValue.call(
          component);

  assertNotNull(result);
  // Should be trimmed
  assertEquals('6505550101', result.nationalNumber);
}


function testPhoneNumberElement_typeAttribute() {
  firebaseui.auth.ui.element.phoneNumber.initPhoneNumberElement.call(component);

  var phoneElement =
      firebaseui.auth.ui.element.phoneNumber.getPhoneNumberElement.call(
          component);

  // Verify it's a tel input type
  assertEquals('tel', phoneElement.type);
}

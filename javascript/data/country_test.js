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
 * @fileoverview Tests for country.js
 */
goog.provide('firebaseui.auth.data.countryTest');
goog.setTestOnly('firebaseui.auth.data.countryTest');

goog.require('firebaseui.auth.data.country');
goog.require('firebaseui.auth.data.country.LookupTree');
goog.require('goog.array');
goog.require('goog.testing.jsunit');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');


/**
 * Asserts that the given countries are sorted by sortCountryListForLocale.
 * @param {!Array<string>} sortedNames
 * @param {!Array<string>} inputNames
 * @param {string} locale
 */
function assertSortCountryListForLocale(sortedNames, inputNames, locale) {
  var countryList = goog.array.map(inputNames, function(name) {
    return {
      name: name,
      e164_key: '',
      e164_cc: '',
      iso2_cc: ''
    };
  });
  firebaseui.auth.data.country.sortCountryListForLocale(countryList, locale);
  var actualSortedNames = goog.array.map(countryList, function(country) {
    return country.name;
  });
  assertArrayEquals(sortedNames, actualSortedNames);
}


/**
 * @param {!Array<!firebaseui.auth.data.country.Country>} countries The list of
 *     country objects.
 * @return {!Array<string>} List of country iso2_cc names.
 */
function getCountryCodesForList(countries) {
  return goog.array.map(countries, function(country) {
    return country.iso2_cc;
  });
}


function testSortCountryListForLocale_french() {
  // Make sure diacritics are ignored.
  assertSortCountryListForLocale(
      ['Åland (Îles)', 'Égypte', 'Espagne', 'États-Unis', 'France'],
      ['France', 'Égypte', 'Åland (Îles)', 'États-Unis', 'Espagne'],
      'fr');
}


function testSortCountryListForLocale_chinese() {
  var isPhantomJS = window.navigator && window.navigator.userAgent &&
      window.navigator.userAgent.indexOf('PhantomJS') !== -1;
  if ((goog.userAgent.IE && !goog.userAgent.isDocumentModeOrHigher(11)) ||
      isPhantomJS || goog.userAgent.product.SAFARI ||
      goog.userAgent.product.IPHONE) {
    // TODO: See if we can make this work in IE<=10/Safari<=9. These browsers
    // don't support the additional parameter to localeCompare that specifies
    // the current locale. The default localeCompare behavior works for French
    // (above) but not for Chinese.
    return;
  }

  // The list should be sorted in alphabetical order by pinyin.
  assertSortCountryListForLocale(
      ['阿富汗', '阿根廷', '不丹', '美国', '日本', '中国'],
      ['日本', '美国', '阿根廷', '不丹', '中国', '阿富汗'],
      'zh-CN');
}


function testSortCountryListForLocale_arabic() {
  assertSortCountryListForLocale(
      ['تركيا', 'فرنسا', 'كندا', 'لبنان', 'مصر', 'هولندا'],
      ['فرنسا', 'مصر', 'هولندا', 'لبنان', 'كندا', 'تركيا'],
      'ar');
}


function testCountryLookupByPhoneNumber() {
  var plusOneCountryCodes = [
    'AS', 'AI', 'AG', 'BS', 'BB', 'BM', 'VG', 'CA', 'KY', 'DM', 'DO', 'GD',
    'GU', 'JM', 'MS', 'MP', 'PR', 'KN', 'LC', 'VC', 'SX', 'TT', 'TC', 'VI',
    'US'];
  // Initialize lookup tree.
  var lookupTree = new firebaseui.auth.data.country.LookupTree(
      firebaseui.auth.data.country.COUNTRY_LIST);
  // Empty string.
  assertSameElements([], lookupTree.search(''));
  // Invalid country code that starts with 0.
  assertSameElements([], lookupTree.search('+01'));
  // Country code without +.
  assertSameElements([], lookupTree.search('1'));
  // Invalid country code prefix.
  assertSameElements([], lookupTree.search('1+1'));
  // Incomplete code.
  assertSameElements([], lookupTree.search('+'));
  // Code only for US.
  assertSameElements(
      plusOneCountryCodes,
      getCountryCodesForList(lookupTree.search('+1')));
  // Code + more characters should still resolve to US.
  assertSameElements(
      plusOneCountryCodes,
      getCountryCodesForList(lookupTree.search('+123...')));
  // Partial prefix of a country code.
  assertSameElements([], lookupTree.search('+9'));
  // Partial prefix of a country code with invalid character in between.
  assertSameElements([], lookupTree.search('+9a61'));
  // Partial prefix of a country code.
  assertSameElements([], lookupTree.search('+96'));
  // Valid country code for LB only.
  assertSameElements(
      ['LB'],
      getCountryCodesForList(lookupTree.search('+961')));
  // Valid country code for LB and other characters.
  assertSameElements(
      ['LB'],
      getCountryCodesForList(lookupTree.search('+9611....')));
}


function testGetCountriesByIso2() {
  var countries = firebaseui.auth.data.country.getCountriesByIso2('GB');
  assertEquals(1, countries.length);
  assertEquals('United Kingdom', countries[0].name);
  assertEquals('44', countries[0].e164_cc);
}


/**
 * Tests that getCountriesByIso2 works correctly if multiple entries have the
 * same ISO2 code.
 */
function testGetCountriesByIso2_multiple() {
  var countries = firebaseui.auth.data.country.getCountriesByIso2('xk');
  var actualCodes = goog.array.map(countries, function(country) {
    return country.e164_cc;
  });
  assertSameElements(['377', '381', '386'], actualCodes);
}


function testGetCountriesByIso2_notFound() {
  var countries = firebaseui.auth.data.country.getCountriesByIso2('zz');
  assertEquals(0, countries.length);
}

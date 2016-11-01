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
 * @fileoverview Tests for sni.js.
 */

goog.provide('firebaseui.auth.sniTest');

goog.require('firebaseui.auth.sni');
goog.require('goog.testing.jsunit');

goog.setTestOnly('firebaseui.auth.utilTest');

function support(userAgent) {
  assertTrue(firebaseui.auth.sni.isSupported(userAgent));
}

function notSupport(userAgent) {
  assertFalse(firebaseui.auth.sni.isSupported(userAgent));
}

function testMSIE() {
  // IE10 on Windows 7
  support('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
  // IE9 on Windows 7
  support('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)');
  // IE9 on Windows Vista
  support('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.0; Trident/5.0)');
  // IE8 on Windows 7
  support('Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0)');
  // IE8 on Windows Vista
  support('Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0)');
  // IE7 on Windows Vista
  support('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)');
  // IE7 on Windows Server 2003
  notSupport('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.2)');
  // IE7 on Windows XP
  notSupport('Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)');
  // IE6 on Windows Server 2003
  notSupport('Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.2)');
  // IE6 on Windows XP
  notSupport('Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.1)');
  // IE6 on Windows Server 2003
  notSupport('Mozilla/4.0 (Windows; MSIE 6.0; Windows NT 5.0)');
}

function testFirefox() {
  // Firefox 10
  support('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:10.0.1)' +
      ' Gecko/20100101 Firefox/10.0.1');
  // Firefox 9
  support('Mozilla/5.0 (Windows NT 6.2; rv:9.0.1)' +
      ' Gecko/20100101 Firefox/9.0.1');
  // Firefox 6
  support('Mozilla/5.0 (X11; Linux i686; rv:6.0) Gecko/20100101 Firefox/6.0');
  // Firefox 5
  support('Mozilla/5.0 (Windows NT 6.2; WOW64; rv:5.0)' +
      ' Gecko/20100101 Firefox/5.0');
  // Firefox 4
  support('Mozilla/5.0 (Windows NT 6.1; rv:2.0) Gecko/20110319 Firefox/4.0');
  // Firefox 3
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6;en-US; rv:1.9.2.9)' +
      ' Gecko/20100824 Firefox/3.6.9');
  // Firefox 2
  support('Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US; rv:1.8.1.7)' +
      ' Gecko/20070914 Firefox/2.0.0.7');
  // Firefox 1.x
  notSupport('Mozilla/5.0 (X11; U; Linux i686 (x86_64); en-US; rv:1.8.0.6)' +
      ' Gecko/20060728 Firefox/1.5.0.6');
}

function testOperaMini() {
  notSupport('Opera/9.80 (J2ME/MIDP; Opera Mini/6.24288/25.729; U; en)' +
      ' Presto/2.5.25 Version/10.54');
  notSupport('Opera/9.80 (Series 60; Opera Mini/5.1.22784/23.334; U; en)' +
      ' Presto/2.5.25 Version/10.54');
}

function testOperaMobile() {
  // Opera Mobile 11 on Android
  support('Opera/9.80 (Android 2.3.3; Linux; Opera Mobi/ADR-1111101157; U;' +
        ' es-ES) Presto/2.9.201 Version/11.50');
  // Opera Mobile 11 on Symbian
  notSupport('Opera/9.80 (S60; SymbOS; Opera Mobi/SYB-1107071606; U; en)' +
      ' Presto/2.8.149 Version/11.10');
  // Opera Mobile 10 on Android
  support('Opera/9.80 (Android; Linux; Opera Mobi/ADR-1012221546; U; pl)' +
      ' Presto/2.7.60 Version/10.5');
  support('Opera/9.80 (Android; Linux; Opera Mobi/ADR-1011151731; U; de)' +
      ' Presto/2.5.28 Version/10.1');
  notSupport('Opera/9.80 (Android; Linux; Opera Mobi/27; U; en)' +
      ' Presto/2.4.18 Version/10.00');
  // Opera Mobile 10 on Symbian
  notSupport('Opera/9.80 (S60; SymbOS; Opera Mobi/1209; U; sk)' +
      ' Presto/2.5.28 Version/10.1');
}

function testOpera() {
  // Opera 12
  support('Opera/9.80 (Windows NT 6.1; U; es-ES) Presto/2.9.181 Version/12.00');
  // Opera 11
  support('Opera/9.80 (Macintosh; Intel Mac OS X 10.6.8; U; fr)' +
      ' Presto/2.9.168 Version/11.52');
  support('Opera/9.80 (X11; Linux i686; U; hu) Presto/2.9.168 Version/11.50');
  support('Opera/9.80 (Windows NT 6.0; U; en) Presto/2.8.99 Version/11.10');
  // Opera 10
  support('Opera/9.80 (Windows NT 6.1; U; pl) Presto/2.6.31 Version/10.70');
  support('Opera/9.80 (X11; Linux i686; U; pl) Presto/2.6.30 Version/10.61');
  // Opera 9
  support('Opera/9.70 (Linux ppc64 ; U; en) Presto/2.2.1');
  support('Opera/9.64 (Windows NT 5.1; U; en) Presto/2.1.1');
  // Opera 8
  support('Opera/8.54 (X11; Linux i686; U; pl)');
  support('Opera/8.50 (Windows NT 5.0; U; en)');
  support('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; en) Opera 8.02');
  // Opera 7
  notSupport('Opera/7.54 (X11; Linux i686; U) [en]');
  notSupport('Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1)' +
      ' Opera 7.11 [ru]');
}

function testChrome() {
  // Chrome 6+
  support('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/535.21' +
      ' (KHTML, like Gecko) Chrome/19.0.1042.0 Safari/535.21');
  support('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/535.19' +
      '(KHTML, like Gecko) Chrome/18.0.1025.11 Safari/535.19');
  support('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/535.11' +
      ' (KHTML, like Gecko) Chrome/17.0.963.56 Safari/535.11');
  support('Mozilla/5.0 (X11; CrOS i686 1193.158.0) AppleWebKit/535.7' +
      ' (KHTML, like Gecko) Chrome/16.0.912.75 Safari/535.7');
  support('Mozilla/5.0 (Windows NT 6.0) AppleWebKit/535.2 ' +
      ' (KHTML, like Gecko) Chrome/15.0.874.120 Safari/535.2');
  support('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_2) AppleWebKit/535.1' +
      ' (KHTML, like Gecko) Chrome/14.0.835.186 Safari/535.1');
  support('Mozilla/5.0 (Windows NT 5.1) AppleWebKit/535.1' +
      ' (KHTML, like Gecko) Chrome/13.0.782.41 Safari/535.1');
  support('Mozilla/5.0 ArchLinux (X11; U; Linux x86_64; en-US) AppleWebKit' +
      '/534.30 (KHTML, like Gecko) Chrome/12.0.742.60 Safari/534.30');
  support('Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.24' +
      ' (KHTML, like Gecko) Chrome/11.0.697.0 Safari/534.24');
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_5; en-US)' +
      ' AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.204');
  support('Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit/534.14' +
      ' (KHTML, like Gecko) Chrome/9.0.600.0 Safari/534.14');
  support('Mozilla/5.0 (X11; U; CrOS i686 0.9.128; en-US) AppleWebKit/534.10' +
      ' (KHTML, like Gecko) Chrome/8.0.552.339 Safari/534.10');
  support('Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US) AppleWebKit/534.10' +
      ' (KHTML, like Gecko) Chrome/7.0.540.0 Safari/534.10');
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_1; en-US)' +
      ' AppleWebKit/534.3 (KHTML, like Gecko) Chrome/6.0.472.63 Safari/534.3');
  // old Chrome
  notSupport('Mozilla/5.0 (X11; U; Linux x86_64; en-US) AppleWebKit/533.4' +
      ' (KHTML, like Gecko) Chrome/5.0.375.99 Safari/533.4');
  notSupport('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US)' +
      ' AppleWebKit/532.8 (KHTML, like Gecko) Chrome/4.0.302.2 Safari/532.8');
  notSupport('Mozilla/5.0 (Windows; U; Windows NT 5.0; en-US)' +
      ' AppleWebKit/532.0 (KHTML, like Gecko) Chrome/3.0.198 Safari/532.0');
}

function testSafari() {
  // Safari 5 on Windows 7/Vista
  support('Mozilla/5.0 (Windows; U; Windows NT 6.1; tr-TR) AppleWebKit' +
      '/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27');
  support('Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit' +
      '/533.20.25 (KHTML, like Gecko) Version/5.0.4 Safari/533.20.27');
  // Safari 5 on Windows XP
  notSupport('Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US) AppleWebKit' +
      '/533.20.25 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4');
  // Safari 5 on Mac OS X 10.5.6 or higher
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at)' +
      ' AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5' +
      ' Safari/533.21.1');
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; ja-jp)' +
      ' AppleWebKit/533.20.25 (KHTML, like Gecko) Version/5.0.4' +
      ' Safari/533.20.27');
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; zh-tw)' +
      ' AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16');
  // Safari 4 on Windows7/Vista
  support('Mozilla/5.0 (Windows; U; Windows NT 6.1; es-ES) AppleWebKit' +
      '/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7');
  support('Mozilla/5.0 (Windows; U; Windows NT 6.0; en-US) AppleWebKit' +
      '/533.18.1 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7');
  // Safari 4 on Windows XP
  notSupport('Mozilla/5.0 (Windows; U; Windows NT 5.1; cs-CZ) AppleWebKit' +
      '/531.22.7 (KHTML, like Gecko) Version/4.0.5 Safari/531.22.7');
  // Safari 4 on Mac OS X 10.5.6 or higher
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_2; ja-jp)' +
      ' AppleWebKit/531.22.7 (KHTML, like Gecko) Version/4.0.5' +
      ' Safari/531.22.7');
  support('Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_5_8; en-us) AppleWebKit' +
      '/532.0+ (KHTML, like Gecko) Version/4.0.3 Safari/531.9.2009');
  // Safari 4 on old Mac OS X
  notSupport('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_5; en-us)' +
      ' AppleWebKit/528.1 (KHTML, like Gecko) Version/4.0 Safari/528.1');
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; en)' +
      ' AppleWebKit/528.4+ (KHTML, like Gecko) Version/4.0 Safari/528.1');
  // Safari 3 on Windows 7/Vista
  support('Mozilla/5.0 (Windows; U; Windows NT 6.1; de-DE) AppleWebKit' +
      '/525.28 (KHTML, like Gecko) Version/3.2.2 Safari/525.28.1');
  support('Mozilla/5.0 (Windows; U; Windows NT 6.0; sv-SE) AppleWebKit' +
      '/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1');
  // Safari 3 on Windows XP
  notSupport('Mozilla/5.0 (Windows; U; Windows NT 5.1; ja-JP) AppleWebKit' +
      '/525.27.1 (KHTML, like Gecko) Version/3.2.1 Safari/525.27.1');
  // Safari 3 on Mac OS X 10.5.6 or higher
  support('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_7; de-de)' +
      ' AppleWebKit/525.28.3 (KHTML, like Gecko) Version/3.2.3' +
      ' Safari/525.28.3');
  // Safari 3 on old Mac OS X
  notSupport('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_5; ja-jp)' +
      ' AppleWebKit/525.26.2 (KHTML, like Gecko) Version/3.2 Safari/525.26.12');
  notSupport('Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_2; en-us)' +
      ' AppleWebKit/526.1+ (KHTML, like Gecko) Version/3.1 Safari/525.13');
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X 10_4_11; sv-se)' +
      ' AppleWebKit/525.27.1 (KHTML, like Gecko) Version/3.2.1' +
      ' Safari/525.27.1');
  // Safari 1 & 2
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X; sv-se)' +
      ' AppleWebKit/419 (KHTML, like Gecko) Safari/419.3');
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en_US)' +
      ' AppleWebKit/412 (KHTML, like Gecko) Safari/412');
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X; de-de)' +
      ' AppleWebKit/312.8 (KHTML, like Gecko) Safari/312.5');
  notSupport('Mozilla/5.0 (Macintosh; U; PPC Mac OS X; en-us)' +
      ' AppleWebKit/85.7 (KHTML, like Gecko) Safari/85.6');
}

function testAndroid() {
  // on Android 3.0+
  support('Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39)' +
      ' AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13');
  support('Mozilla/5.0 (Linux; U; Android 4.0; en-us; Galaxy Nexus Build' +
      '/IFL10C) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile' +
      ' Safari/534.30');
  // on platform prior to Android 3.0
  notSupport('Mozilla/5.0 (Linux; U; Android 2.3.5; en-us; HTC Vision Build' +
      '/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile' +
      ' Safari/533.1');
  notSupport('Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile myTouch' +
      ' 3G Slide Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko)' +
      ' Version/4.0 Mobile Safari/533.1');
  notSupport('Mozilla/5.0 (Linux; U; Android 2.3.3; en-us; HTC_DesireS_S510e' +
      ' Build/GRI40) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0' +
      ' Mobile Safari/533.1');
  notSupport('Mozilla/5.0 (Linux; U; Android 2.2; fr-lu; HTC Legend Build' +
      '/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile' +
      ' Safari/533.1');
  notSupport('Mozilla/5.0 (Linux; U; Android 1.6; ar-us; SonyEricssonX10i' +
      ' Build/R2BA026) AppleWebKit/528.5+ (KHTML, like Gecko) Version/3.1.2' +
      ' Mobile Safari/525.20.1');
}

function testMobileSafari() {
  // iOS 4+
  support('Mozilla/5.0 (iPod; U; CPU iPhone OS 4_3_3 like Mac OS X; ja-jp)' +
      ' AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8J2' +
      ' Safari/6533.18.5');
  support('Mozilla/5.0 (iPhone; U; fr; CPU iPhone OS 4_2_1 like Mac OS X; fr)' +
      ' AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8C148a' +
      ' Safari/6533.18.5');
  support('Mozilla/5.0 (iPad; U; CPU OS 4_3 like Mac OS X; en-gb)' +
      ' AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8F190' +
      ' Safari/6533.18.5');
  // prior to iOS 4
  notSupport('Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us)' +
      ' AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4' +
      ' Mobile/7B314 Safari/123');
  notSupport('Mozilla/5.0 (iPhone; U; CPU OS 3_2 like Mac OS X; en-us)' +
      ' AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4' +
      ' Mobile/7B334b Safari/531.21.10');
}

function testKonqueror() {
  // Konqueror 4.7
  support('Mozilla/5.0 (X11; Linux; en_US) KHTML/4.7.0 (like Gecko)' +
      ' Konqueror/4.7');
  // prior to 4.7
  notSupport('Mozilla/5.0 (X11; U; Linux x86_64; C) AppleWebKit/533.3' +
      ' (KHTML, like Gecko) Konqueror/4.6.3 Safari/533.3');
}

function testMobileMSIE() {
  // Mobile MSIE 7.0 on Windows Phone 7.0
  support('Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0;' +
      ' Trident/3.1; IEMobile/7.0) HTC;WP7');
  // Mobile MSIE 9.0 on Windows Phone 7.5
  support('Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5;' +
      ' Trident/5.0; IEMobile/9.0; Microsoft; XDeviceEmulator)');
}

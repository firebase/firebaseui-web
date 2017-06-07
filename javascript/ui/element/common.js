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
 * @fileoverview Common utilities for UI element.
 */

goog.provide('firebaseui.auth.ui.element');

goog.require('goog.dom');
goog.require('goog.dom.classlist');
goog.require('goog.dom.forms');
goog.require('goog.events.ActionHandler');
goog.require('goog.events.ActionHandler.EventType');
goog.require('goog.events.FocusHandler');
goog.require('goog.events.FocusHandler.EventType');
goog.require('goog.events.InputHandler');
goog.require('goog.events.InputHandler.EventType');
goog.require('goog.events.KeyCodes');
goog.require('goog.events.KeyHandler');
goog.require('goog.events.KeyHandler.EventType');
goog.require('goog.ui.Component');


/**
 * Sets the valid state of the element.
 * @param {Element} e The element.
 * @param {boolean} valid Whether the element is valid or not.
 */
firebaseui.auth.ui.element.setValid = function(e, valid) {
  // The parent textfield element, if applicable.
  var textfield = goog.dom.getAncestorByClass(e, 'firebaseui-textfield');

  if (valid) {
    goog.dom.classlist.addRemove(
        e, 'firebaseui-input-invalid', 'firebaseui-input');
    if (textfield) {
      goog.dom.classlist.remove(textfield, 'firebaseui-textfield-invalid');
    }
  } else {
    goog.dom.classlist.addRemove(
        e, 'firebaseui-input', 'firebaseui-input-invalid');
    if (textfield) {
      goog.dom.classlist.add(textfield, 'firebaseui-textfield-invalid');
    }
  }
};


/**
 * @param {goog.ui.Component} component The component containing the element.
 * @param {Element} e The input element.
 * @param {function(this:SCOPE, EVENTOBJ)} cb Callback to invoke when the event
 *     is fired.
 * @template SCOPE,EVENTOBJ
 * @suppress {accessControls}
 */
firebaseui.auth.ui.element.listenForInputEvent = function(component, e, cb) {
  var handler = new goog.events.InputHandler(e);
  component.registerDisposable(handler);
  component.getHandler().listen(
      handler, goog.events.InputHandler.EventType.INPUT, cb);
};


/**
 * @param {goog.ui.Component} component The component containing the element.
 * @param {Element} e The input element.
 * @param {function(this:SCOPE, EVENTOBJ)} cb Callback to invoke when the event
 *     is fired.
 * @template SCOPE,EVENTOBJ
 * @suppress {accessControls}
 */
firebaseui.auth.ui.element.listenForEnterEvent = function(component, e, cb) {
  var handler = new goog.events.KeyHandler(e);
  component.registerDisposable(handler);
  component.getHandler().listen(
      handler, goog.events.KeyHandler.EventType.KEY, function(e) {
        if (e.keyCode == goog.events.KeyCodes.ENTER) {
          // Stop event propagation and disable the default action since it
          // could cause a form submission.
          e.stopPropagation();
          e.preventDefault();
          cb(e);
        }
      });
};


/**
 * @param {goog.ui.Component} component The component containing the element.
 * @param {Element} e The input element.
 * @param {function(this:SCOPE, EVENTOBJ)} cb Callback to invoke when the
 *     element is focused.
 * @template SCOPE,EVENTOBJ
 * @suppress {accessControls}
 */
firebaseui.auth.ui.element.listenForFocusInEvent = function(component, e, cb) {
  var handler = new goog.events.FocusHandler(e);
  component.registerDisposable(handler);
  component.getHandler().listen(
      handler, goog.events.FocusHandler.EventType.FOCUSIN, cb);
};


/**
 * @param {goog.ui.Component} component The component containing the element.
 * @param {Element} e The input element.
 * @param {function(this:SCOPE, EVENTOBJ)} cb Callback to invoke when the
 *     element is blurred.
 * @template SCOPE,EVENTOBJ
 * @suppress {accessControls}
 */
firebaseui.auth.ui.element.listenForFocusOutEvent = function(component, e, cb) {
  var handler = new goog.events.FocusHandler(e);
  component.registerDisposable(handler);
  component.getHandler().listen(
      handler, goog.events.FocusHandler.EventType.FOCUSOUT, cb);
};


/**
 * @param {goog.ui.Component} component The component containing the element.
 * @param {Element} e The actionable element.
 * @param {function(this:SCOPE, EVENTOBJ)} cb Callback to invoke when the event
 *     is fired.
 * @template SCOPE,EVENTOBJ
 * @suppress {accessControls}
 */
firebaseui.auth.ui.element.listenForActionEvent = function(component, e, cb) {
  var handler = new goog.events.ActionHandler(e);
  component.registerDisposable(handler);
  component.getHandler().listen(
      handler, goog.events.ActionHandler.EventType.ACTION, function(e) {
        // Stop event propagation and disable the default action since it
        // could cause a form submission.
        e.stopPropagation();
        e.preventDefault();
        cb(e);
      });
};


/**
 * @param {Element} e The input element.
 * @return {?string} The text in the input.
 */
firebaseui.auth.ui.element.getInputValue = function(e) {
  return /** @type {?string} */ (goog.dom.forms.getValue(e));
};


/**
 * Hides the element.
 * @param {Element} e The element to hide.
 */
firebaseui.auth.ui.element.hide = function(e) {
  goog.dom.classlist.add(e, 'firebaseui-hidden');
};


/**
 * Shows the element.
 * @param {Element} e The element to show.
 * @param {string=} opt_text The text to show.
 */
firebaseui.auth.ui.element.show = function(e, opt_text) {
  if (opt_text) {
    goog.dom.setTextContent(e, opt_text);
  }
  goog.dom.classlist.remove(e, 'firebaseui-hidden');
};


/**
 * Checks if the element is shown or not. The element is considered shown if it
 * doesn't have 'firebaseui-hidden' class or 'display:none' style.
 * @param {Element} e The element to check.
 * @return {boolean} True if the element is shown.
 */
firebaseui.auth.ui.element.isShown = function(e) {
  return !goog.dom.classlist.contains(e, 'firebaseui-hidden') &&
      e.style.display != 'none';
};


/**
 * Checks if the element is deeply hidden because it or one of its ancestors is
 * hidden.
 * @param {Element} e The element to check.
 * @return {boolean} True if the element is hidden.
 */
firebaseui.auth.ui.element.isDeeplyHidden = function(e) {
  while (e) {
    if (!firebaseui.auth.ui.element.isShown(e)) {
      return true;
    }
    e = e.parentElement;
  }
  return false;
};

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
 * @fileoverview Base UI component for all pages.
 */

goog.provide('firebaseui.auth.ui.page.Base');
goog.provide('firebaseui.auth.ui.page.CustomEvent');

goog.require('firebaseui.auth.EventRegister');
goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.ui.element');
goog.require('firebaseui.auth.ui.element.dialog');
goog.require('firebaseui.auth.ui.element.infoBar');
goog.require('firebaseui.auth.ui.element.progressDialog');
goog.require('firebaseui.auth.ui.mdl');
goog.require('goog.dom');
goog.require('goog.events.Event');
goog.require('goog.object');
goog.require('goog.soy');
goog.require('goog.ui.Component');


/**
 * @define {string} The base URL of images.
 */
goog.define('firebaseui.auth.ui.page.IMAGE_BASE',
    'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/');


/**
 * @private @const {number} The delay, in milliseconds, before the busy
 *     indicator is shown.
 */
firebaseui.auth.ui.page.SHOW_PROCESSING_DELAY_ = 500;


/**
 * @const {Object}
 * @private
 */
firebaseui.auth.ui.page.IJ_DATA_ = {
  googleLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'google.svg',
  githubLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'github.svg',
  facebookLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'facebook.svg',
  twitterLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'twitter.svg',
  passwordLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'mail.svg',
  phoneLogo: firebaseui.auth.ui.page.IMAGE_BASE + 'phone.svg'
};



/**
 * Base page custom event.
 * @param {string} type The event type.
 * @param {!Element} target The target element where the event was triggered.
 * @param {Object=} opt_properties The optional properties to set to the custom
 *     event using same keys as object provided.
 * @constructor
 * @extends {goog.events.Event}
 */
firebaseui.auth.ui.page.CustomEvent = function(type, target, opt_properties) {
  goog.events.Event.call(this, type, target);
  // If optional properties provided.
  // Add each property to custom event.
  for (var key in opt_properties) {
    this[key] = opt_properties[key];
  }
};
goog.inherits(firebaseui.auth.ui.page.CustomEvent, goog.events.Event);



/**
 * Base UI component.
 * @param {function(ARG_TYPES, null=, Object.<string, *>=):*} template The Soy
 *     template for the component.
 * @param {ARG_TYPES=} opt_templateData The data for the template.
 * @param {goog.dom.DomHelper=} opt_domHelper Optional DOM helper.
 * @param {string=} opt_pageId Optional page ID used to identify the page.
 * @param {?Object=} opt_injectedData Optional injected data.
 * @constructor
 * @extends {goog.ui.Component}
 * @template ARG_TYPES
 */
firebaseui.auth.ui.page.Base = function(
    template, opt_templateData, opt_domHelper, opt_pageId, opt_injectedData) {
  firebaseui.auth.ui.page.Base.base(this, 'constructor', opt_domHelper);
  this.template_ = template;
  this.templateData_ = opt_templateData;
  this.inProcessing_ = false;
  this.pageId_ = opt_pageId || null;
  this.showProcessingTimeout_ = null;
  this.busyIndicator_ = null;
  this.injectedData_ = goog.object.clone(firebaseui.auth.ui.page.IJ_DATA_);
  goog.object.extend(
      this.injectedData_, opt_injectedData || {});
};
goog.inherits(firebaseui.auth.ui.page.Base, goog.ui.Component);


/**
 * Events dispatched by pages on containers.
 * @enum {string}
 */
firebaseui.auth.ui.page.Base.EventType = {
  /** Dispatched after page enters document. */
  PAGE_ENTER: 'pageEnter',

  /** Dispatched after page exits document. */
  PAGE_EXIT: 'pageExit'
};


/**
 * @return {?string} The identifier for the urrent page.
 */
firebaseui.auth.ui.page.Base.prototype.getPageId = function() {
  return this.pageId_;
};


/** @override */
firebaseui.auth.ui.page.Base.prototype.createDom = function() {
  var element = goog.soy.renderAsElement(
      this.template_,
      this.templateData_,
      this.injectedData_,
      this.getDomHelper());
  firebaseui.auth.ui.mdl.upgrade(element);
  this.setElementInternal(element);
};


/** @override */
firebaseui.auth.ui.page.Base.prototype.enterDocument = function() {
  firebaseui.auth.ui.page.Base.base(this, 'enterDocument');
  // Dispatch page enter event on parent container.
  // Container should be defined at this point.
  firebaseui.auth.EventRegister.dispatchEvent(
      /** @type {!Element} */ (this.getContainer()),
      new firebaseui.auth.ui.page.CustomEvent(
          firebaseui.auth.ui.page.Base.EventType.PAGE_ENTER,
          /** @type {!Element} */ (this.getContainer()),
          {
            'pageId': this.getPageId()
          }));
};


/** @override */
firebaseui.auth.ui.page.Base.prototype.exitDocument = function() {
  // Dispatch page exit event on parent container.
  // Container should be defined at this point.
  firebaseui.auth.EventRegister.dispatchEvent(
      /** @type {!Element} */ (this.getContainer()),
      new firebaseui.auth.ui.page.CustomEvent(
          firebaseui.auth.ui.page.Base.EventType.PAGE_EXIT,
          /** @type {!Element} */ (this.getContainer()),
          {
            'pageId': this.getPageId()
          }));
  firebaseui.auth.ui.page.Base.base(this, 'exitDocument');
};


/** @override */
firebaseui.auth.ui.page.Base.prototype.disposeInternal = function() {
  this.clearProcessingTimeout_();

  this.template_ = null;
  this.templateData_ = null;
  this.inProcessing_ = false;
  this.busyIndicator_ = null;
  firebaseui.auth.ui.mdl.downgrade(this.getElement());
  firebaseui.auth.ui.page.Base.base(this, 'disposeInternal');
};


/**
 * Indicates to the UI component that a request is started.
 * @private
 */
firebaseui.auth.ui.page.Base.prototype.startProcessing_ = function() {
  // After a short delay, show the busy indicator. The delay is there so that
  // pages that load quickly do not display the indicator.
  var self = this;
  this.inProcessing_ = true;
  this.showProcessingTimeout_ = window.setTimeout(function() {
    if (!self.getElement() || self.busyIndicator_ !== null) {
      return;
    }
    self.busyIndicator_ = goog.soy.renderAsElement(
        firebaseui.auth.soy2.element.busyIndicator, null, null,
        self.getDomHelper());
    self.getElement().appendChild(self.busyIndicator_);
    firebaseui.auth.ui.mdl.upgrade(self.busyIndicator_);
  }, firebaseui.auth.ui.page.SHOW_PROCESSING_DELAY_);
};


/**
 * Indicates to the UI component that a request is finished.
 * @private
 */
firebaseui.auth.ui.page.Base.prototype.stopProcessing_ = function() {
  this.inProcessing_ = false;

  this.clearProcessingTimeout_();

  if (this.busyIndicator_) {
    firebaseui.auth.ui.mdl.downgrade(this.busyIndicator_);
    goog.dom.removeNode(this.busyIndicator_);
    this.busyIndicator_ = null;
  }
};


/**
 * Clears the timeout that displays the busy indicator.
 * @private
 */
firebaseui.auth.ui.page.Base.prototype.clearProcessingTimeout_ = function() {
  window.clearTimeout(this.showProcessingTimeout_);
  this.showProcessingTimeout_ = null;
};


/**
 * Executes an API promise based request.
 * @param {function(...):!goog.Promise} executor The request executor.
 * @param {!Array} parameters The API request array of parameters.
 * @param {function(*)} onSuccess The response
 *     handling success callback.
 * @param {function(*)} onError The response handling
 *     error callback.
 * @return {?goog.Promise} The pending promise.
 */
firebaseui.auth.ui.page.Base.prototype.executePromiseRequest =
    function(executor, parameters, onSuccess, onError) {
  var self = this;
  // One request at a time.
  if (self.inProcessing_) {
    return null;
  }
  self.startProcessing_();

  var onCompletion = function() {
    // Ignore it if the component is destroyed before getting a response.
    if (self.isDisposed()) {
      return null;
    }
    self.stopProcessing_();
  };
  return executor.apply(null, parameters)
      .then(onSuccess, onError)
      .then(onCompletion, onCompletion);
};


/**
 * @return {Element} The container element.
 */
firebaseui.auth.ui.page.Base.prototype.getContainer = function() {
  // Use parentNode for Firefox 7. (parentElement was added in Firefox 9).
  return this.getElement().parentElement || /** @type {Element} */ (
      this.getElement().parentNode);
};


/**
 * Moves the focus from the current to the next element when ENTER is pressed.
 * @param {Element} element The current element.
 * @param {Element} nextElement The next element to focus.
 * @protected
 */
firebaseui.auth.ui.page.Base.prototype.focusToNextOnEnter = function(
    element, nextElement) {
  firebaseui.auth.ui.element.listenForEnterEvent(this, element, function(e) {
    nextElement.focus();
  });
};


/**
 * Submits the form when ENTER is pressed on the element.
 * @param {Element} element The current focused element.
 * @param {function()} onSubmit Callback to invoke when the form is submitted.
 * @protected
 */
firebaseui.auth.ui.page.Base.prototype.submitOnEnter =
    function(element, onSubmit) {
  firebaseui.auth.ui.element.listenForEnterEvent(this, element, function(e) {
    onSubmit();
  });
};


/**
 * Checks that the next element is hidden when ENTER is pressed in the current
 * element. If so, the form is submitted, otherwise no action is taken.
 * @param {Element} element The current element.
 * @param {Element} nextElement The next element to check for visibility status.
 * @param {function()} onSubmit Callback to invoke when the form is submitted.
 * @protected
 */
firebaseui.auth.ui.page.Base.prototype.submitIfNextHiddenOnEnter = function(
    element, nextElement, onSubmit) {
  firebaseui.auth.ui.element.listenForEnterEvent(this, element, function(e) {
    // If next element is hidden, run submit function.
    if (firebaseui.auth.ui.element.isDeeplyHidden(nextElement)) {
      onSubmit();
    }
  });
};


/**
 * Moves the focus from the current to the next element when ENTER is pressed
 * and the next one is focusable. Otherwise the form is submitted.
 * @param {Element} element The current element.
 * @param {Element} nextElement The next element to focus.
 * @param {function()} onSubmit Callback to invoke when the form is submitted.
 * @protected
 */
firebaseui.auth.ui.page.Base.prototype.focusToNextOrSubmitOnEnter = function(
    element, nextElement, onSubmit) {
  firebaseui.auth.ui.element.listenForEnterEvent(this, element, function(e) {
    if (!firebaseui.auth.ui.element.isDeeplyHidden(nextElement)) {
      nextElement.focus();
    } else {
      onSubmit();
    }
  });
};


goog.mixin(
    firebaseui.auth.ui.page.Base.prototype,
    /** @lends {firebaseui.auth.ui.page.Base.prototype} */
    {
      // For info bar.
      showInfoBar:
          firebaseui.auth.ui.element.infoBar.showInfoBar,
      dismissInfoBar:
          firebaseui.auth.ui.element.infoBar.dismissInfoBar,
      getInfoBarElement:
          firebaseui.auth.ui.element.infoBar.getInfoBarElement,
      getInfoBarDismissLinkElement:
          firebaseui.auth.ui.element.infoBar.getInfoBarDismissLinkElement,

      // For dialogs.
      showProgressDialog:
          firebaseui.auth.ui.element.progressDialog.showProgressDialog,
      dismissDialog:
          firebaseui.auth.ui.element.dialog.dismissDialog,
      getDialogElement:
          firebaseui.auth.ui.element.dialog.getDialogElement
    });

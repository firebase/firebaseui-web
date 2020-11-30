/*
 * Copyright 2016 Google Inc. All Rights Reserved.
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
 * @fileoverview Tests for element.soy
 */

goog.provide('firebaseui.auth.soy2.elementTest');
goog.setTestOnly('firebaseui.auth.soy2.elementTest');

goog.require('firebaseui.auth.soy2.element');
goog.require('firebaseui.auth.soy2.strings');
/** @suppress {extraRequire} Required for initViewer helper function. */
goog.require('firebaseui.auth.soy2.viewHelper');
goog.require('goog.dom');
goog.require('goog.dom.classes');
goog.require('goog.soy');
goog.require('goog.testing.jsunit');


var IJ_DATA_ = {
  'defaultIconUrls': {
    'google.com': '../image/google.svg',
    'github.com': '../image/github.svg',
    'facebook.com': '../image/facebook.svg',
    'twitter.com': '../image/twitter.svg',
    'password': '../image/mail.svg',
    'phone': '../image/phone.svg',
    'anonymous': '../image/anonymous.svg',
    'microsoft.com': '../image/microsoft.svg',
    'yahoo.com': '../image/yahoo.svg',
    'apple.com': '../image/apple.svg',
    'saml': '../image/saml.svg',
    'oidc': '../image/oidc.svg',
  },
  'defaultButtonColors': {
    'google.com': '#ffffff',
    'github.com': '#333333',
    'facebook.com': '#3b5998',
    'twitter.com': '#55acee',
    'password': '#db4437',
    'phone': '#02bd7e',
    'anonymous': '#f4b400',
    'microsoft.com': '#2F2F2F',
    'yahoo.com': '#720E9E',
    'apple.com': '#000000',
    'saml': '#007bff',
    'oidc': '#007bff',
  },
  'defaultProviderNames': {
    'google.com': 'Google',
    'github.com': 'GitHub',
    'facebook.com': 'Facebook',
    'twitter.com': 'Twitter',
    'password': 'Password',
    'phone': 'Phone',
    'anonymous': 'Guest',
    'microsoft.com': 'Microsoft',
    'yahoo.com': 'Yahoo',
    'apple.com': 'Apple',
  },
  'tosCallback': function() {
    window.location.assign('/tos');
  },
  'privacyPolicyCallback': function() {
    window.location.assign('/privacyPolicy');
  },
};


function setUpPage() {
  initViewer('elements.soy');

  // Add a dialog polyfill if not provided in the bootstrap code.
  if (!window['dialogPolyfill'] ||
      !window['dialogPolyfill']['registerDialog']) {
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
  }
}


function tearDownPage() {
  if (window['componentHandler'] &&
      window['componentHandler']['upgradeAllRegistered']) {
    window['componentHandler']['upgradeAllRegistered']();
  }
}

function testEmail() {
  var root = goog.dom.getElement('email');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.email);
}


function testEmail_withEmail() {
  var root = goog.dom.getElement('email-with-email');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.email, {'email': 'user@example.com'});
}


function testEmail_withEmailDisabled() {
  var root = goog.dom.getElement('email-with-email-disabled');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.email,
      {'email': 'user@example.com', 'disabled': true});
}


function testEmail_error() {
  var root = goog.dom.getElement('email-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.email, null);
  setInvalid(root, 'firebaseui-id-email');
  setError(
      root, 'firebaseui-id-email-error',
      firebaseui.auth.soy2.strings.errorMissingEmail().toString());
}


function testPhone() {
  var root = goog.dom.getElement('phone-number');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.phoneNumber);
}


function testPhoneNumber_error() {
  var root = goog.dom.getElement('phone-number-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.phoneNumber, null);
  setInvalid(root, 'firebaseui-id-phone-number');
  setError(root, 'firebaseui-id-phone-number-error', 'Invalid phone number.');
}


function testPhoneConfirmationCode() {
  var root = goog.dom.getElement('phone-confirmation-code');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.phoneConfirmationCode);
}


function testPhoneConfirmationCode_error() {
  var root = goog.dom.getElement('phone-confirmation-code-error');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.phoneConfirmationCode, null);
  setInvalid(root, 'firebaseui-id-phone-confirmation-code');
  setError(
      root, 'firebaseui-id-phone-confirmation-code-error',
      'Invalid phone confirmation code.');
}


function testResend() {
  var root = goog.dom.getElement('resend-countdown');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.resend);
  var countdown = goog.dom.getElementByClass(
      'firebaseui-id-resend-countdown', root);
  goog.dom.setTextContent(countdown, 'Resend code in 0:11');
}


function testResendLink() {
  var root = goog.dom.getElement('resend-link');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.resend);
  var countdown = goog.dom.getElementByClass(
      'firebaseui-id-resend-countdown', root);
  goog.dom.classes.add(countdown, 'firebaseui-hidden');
  var link = goog.dom.getElementByClass('firebaseui-id-resend-link', root);
  goog.dom.classes.remove(link, 'firebaseui-hidden');
}


function testIdpButton() {
  var idpConfigs = [
    {
      providerId: 'password',
    },
    {
      providerId: 'phone',
    },
    {
      providerId: 'google.com',
    },
    {
      providerId: 'github.com',
    },
    {
      providerId: 'facebook.com',
    },
    {
      providerId: 'twitter.com',
    },
    {
      providerId: 'anonymous',
    },
    {
      providerId: 'microsoft.com',
      providerName: 'Microsoft',
      buttonColor: '#FFB6C1',
      iconUrl: 'icon-url',
    },
    {
      providerId: 'yahoo.com',
    },
    {
      providerId: 'saml.provider',
    },
    {
      providerId: 'saml.idp',
      providerName: 'MySamlIdp',
      fullLabel: 'Contractor Portal',
    },
    {
      providerId: 'oidc.provider',
    },
    {
      providerId: 'oidc.idp',
      providerName: 'MyOidcIdp',
      fullLabel: 'Employee Login',
    }];
  var root = goog.dom.getElement('idp-button');
  for (var i = 0; i < idpConfigs.length; i++) {
    var button = goog.soy.renderAsElement(
        firebaseui.auth.soy2.element.idpButton,
        {
          providerConfig: idpConfigs[i]
        },
        IJ_DATA_);
    root.appendChild(button);
    var separator = goog.dom.createElement('div');
    goog.dom.setProperties(separator, {'style': 'height:15px'});
    root.appendChild(separator);
  }
}


function testSubmitButton() {
  var root = goog.dom.getElement('submit-button');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.submitButton);
}


function testSubmitButton_customLabel() {
  var root = goog.dom.getElement('submit-button-custom-label');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.submitButton,
      {'label': 'Sign in with Google'});
}


function testName() {
  var root = goog.dom.getElement('name');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.name);
}


function testName_withName() {
  var root = goog.dom.getElement('name-with-name');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.name, {'name': 'John Doe'});
}


function testName_error() {
  var root = goog.dom.getElement('name-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.name);
  setInvalid(root, 'firebaseui-id-name');
  setError(
      root, 'firebaseui-id-name-error',
      firebaseui.auth.soy2.strings.errorMissingName().toString());
}


function testNewPassword() {
  var root = goog.dom.getElement('new-password');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);
}


function testNewPassword_toggled() {
  var root = goog.dom.getElement('new-password-toggled');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);

  // Simulate toggle button clicked.
  var newPassword =
      goog.dom.getElementByClass('firebaseui-id-new-password', root);
  newPassword['type'] = 'text';

  var toggle =
      goog.dom.getElementByClass('firebaseui-id-password-toggle', root);
  goog.dom.classes.remove(toggle, 'firebaseui-input-toggle-on');
  goog.dom.classes.add(toggle, 'firebaseui-input-toggle-off');
}


function testNewPassword_error() {
  var root = goog.dom.getElement('new-password-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.newPassword);
  setInvalid(root, 'firebaseui-id-new-password');
  setError(
      root, 'firebaseui-id-new-password-error',
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
}


function testPassword() {
  var root = goog.dom.getElement('password');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.password);
}


function testPassword_current() {
  var root = goog.dom.getElement('password-current');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.password, {'current': true});
}


function testPassword_error() {
  var root = goog.dom.getElement('password-error');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.password);
  setInvalid(root, 'firebaseui-id-password');
  setError(
      root, 'firebaseui-id-password-error',
      firebaseui.auth.soy2.strings.errorMissingPassword().toString());
}


function testPasswordRecoveryButton() {
  var root = goog.dom.getElement('password-recovery-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.passwordRecoveryButton);
}


function testTroubleGettingEmailButton() {
  var root = goog.dom.getElement('trouble-getting-email-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.troubleGettingEmailButton);
}


function testResendEmailLinkButton() {
  var root = goog.dom.getElement('resend-email-link-button');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.resendEmailLinkButton);
}


function testCancelButton() {
  var root = goog.dom.getElement('cancel-button');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.cancelButton);
}


function testCancelButton_customLabel() {
  var root = goog.dom.getElement('cancel-button-custom-label');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.cancelButton,
      {'label': 'back'});
}


function testInfoBar() {
  var root = goog.dom.getElement('info-bar');
  var infoBar = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.infoBar, {'message': 'This is an error.'});
  root.appendChild(infoBar);
}


function testTosPpLink() {
  var root = goog.dom.getElement('tos-pp-link');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.tosPpLink,
      {}, IJ_DATA_);
}


function testPhoneTosPp() {
  var root = goog.dom.getElement('phone-tos-pp');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.phoneTosPp,
      {}, IJ_DATA_);
}


function testFullMessageTosPp() {
  var root = goog.dom.getElement('full-message-tos-pp');
  goog.soy.renderElement(root, firebaseui.auth.soy2.element.fullMessageTosPp,
      {}, IJ_DATA_);
}


function testBusyIndicator() {
  var root = goog.dom.getElement('busy-indicator');
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator, null);
  root.appendChild(busy);
}


function testBusyIndicator_spinner() {
  var root = goog.dom.getElement('busy-indicator-spinner');
  var busy = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.busyIndicator, {useSpinner: true});
  root.appendChild(busy);
}


function testRecaptcha() {
  var root = goog.dom.getElement('recaptcha');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.recaptcha, {}, IJ_DATA_);
  loadRecaptcha(root);
}


function testRecaptcha_error() {
  var root = goog.dom.getElement('recaptcha-error');
  goog.soy.renderElement(
      root, firebaseui.auth.soy2.element.recaptcha, {}, IJ_DATA_);
  loadRecaptcha(root);
  setError(
      root, 'firebaseui-id-recaptcha-error',
      'Please click the checkbox above.');
}


/**
 * Makes a button, identified by ID, open the passed in HTML dialog.
 * @param {string} buttonId The HTML ID of the button that triggers the dialog.
 * @param {!Element} dialog The dialog element to show.
 */
function attachShowDialogListener(buttonId, dialog) {
  document.body.appendChild(dialog);
  window['dialogPolyfill']['registerDialog'](dialog);
  var button = goog.dom.getElement(buttonId);
  button.addEventListener('click', function() {
    dialog.showModal();
  });
  document.addEventListener('click', function(event) {
    // Close the dialog if the click is not on the button itself.
    if (event.target !== button && dialog.open) {
      dialog.close();
    }
  });
}


function testLoadingDialog() {
  var data = {
    iconClass: 'mdl-spinner mdl-spinner--single-color mdl-js-spinner ' +
        'firebaseui-progress-dialog-loading-icon is-active',
    message: 'Loading...',
  };
  var dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.progressDialog, data, IJ_DATA_);
  attachShowDialogListener('show-loading-dialog', dialog);
}


function testLoadingDialogLongText() {
  var data = {
    iconClass: 'mdl-spinner mdl-spinner--single-color mdl-js-spinner ' +
        'firebaseui-progress-dialog-loading-icon is-active',
    message: 'I am loading dialog that has very long text. Seriously, the ' +
        'text is really really long.',
  };
  var dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.progressDialog, data, IJ_DATA_);
  attachShowDialogListener('show-loading-dialog-long', dialog);
}


function testDoneDialog() {
  var data = {
    iconClass: 'firebaseui-icon-done',
    message: 'Done.',
  };
  var dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.progressDialog, data, IJ_DATA_);
  attachShowDialogListener('show-done-dialog', dialog);
}


function testListboxDialog() {
  var data = {
    items: [
      {id: '1', label: 'Item one'}, {id: '2', label: 'Item two'},
      {id: '3', label: 'Item three'}
    ]
  };
  var dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.listBoxDialog, data, IJ_DATA_);
  attachShowDialogListener('show-list-box', dialog);
}


function testListboxDialogWithIcons() {
  var data = {
    items: [
      {
        id: 'france',
        label: 'France',
        iconClass: 'firebaseui-flag firebaseui-flag-FR'
      },
      {
        id: 'usa',
        label: 'USA I am testing how a really long label looks in the UI',
        iconClass: 'firebaseui-flag firebaseui-flag-US'
      },
      {
        id: 'denmark',
        label: 'Denmark',
        iconClass: 'firebaseui-flag firebaseui-flag-DK'
      }
    ]
  };
  var dialog = goog.soy.renderAsElement(
      firebaseui.auth.soy2.element.listBoxDialog, data, IJ_DATA_);
  attachShowDialogListener('show-list-box-with-icons', dialog);
}


function testTenantSelectionButton() {
  const tenantConfigs = [
    {
      tenantId: 'TENANT_ID',
      displayName: 'Contractor A',
      buttonColor: '#FFB6C1',
      iconUrl: 'icon-url',
    },
    {
      tenantId: null,
      displayName: 'ACME',
      buttonColor: '#53B2BF',
      iconUrl: 'icon-url',
    },
    {
      tenantId: 'TENANT_1',
      fullLabel: 'Contractor Login',
      displayName: 'OIDC',
      buttonColor: '#4666FF',
      iconUrl: 'icon-url',
    },
    {
      tenantId: 'TENANT_2',
      fullLabel: null,
      displayName: 'ACME Corp',
      buttonColor: '#2F2B2E',
      iconUrl: 'icon-url',
    }
  ];
  const root = goog.dom.getElement('tenant-selection-button');
  for (let i = 0; i < tenantConfigs.length; i++) {
    const button = goog.soy.renderAsElement(
        firebaseui.auth.soy2.element.tenantSelectionButton,
        {
          tenantConfig: tenantConfigs[i]
        },
        IJ_DATA_);
    root.appendChild(button);
    const separator = goog.dom.createElement('div');
    goog.dom.setProperties(separator, {'style': 'height:15px'});
    root.appendChild(separator);
  }
}


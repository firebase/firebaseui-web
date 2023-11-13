/*
 * Copyright 2019 Google Inc. All Rights Reserved.
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

/** @fileoverview Tests for uihandlerconfig.js */

goog.module('firebaseui.auth.widget.UiHandlerConfigTest');
goog.setTestOnly();

const FakeUtil = goog.require('firebaseui.auth.testing.FakeUtil');
const PropertyReplacer = goog.require('goog.testing.PropertyReplacer');
const UiHandlerConfig = goog.require('firebaseui.auth.widget.UiHandlerConfig');
const log = goog.require('firebaseui.auth.log');
const recordFunction = goog.require('goog.testing.recordFunction');
const testSuite = goog.require('goog.testing.testSuite');
const util = goog.require('firebaseui.auth.util');

const stub = new PropertyReplacer();
let testUtil;
let uiHandlerConfig;
// The plain config object.
let configObject;


testSuite({
  setUp() {
    configObject = {
      authDomain: 'project-id1.firebaseapp.com',
      displayMode: 'optionsFirst',
      tenants: {
        tenantId1: {
          fullLabel: 'Contractor A Portal',
          displayName: 'Contractor A',
          buttonColor: '#FFB6C1',
          iconUrl: '<icon-url-of-sign-in-button>',
          signInOptions: [
            {
              hd: 'acme.com',
              provider: 'microsoft.com',
              providerName: 'Microsoft',
              buttonColor: '#2F2F2F',
              iconUrl: '<icon-url-of-sign-in-button>',
              loginHintKey: 'login_hint',
            },
            {
              hd: 'sub-acme.com',
              provider: 'password',
              fullLabel: 'Sign in as Employee',
              requireDisplayName: false,
            },
          ],
          immediateFederatedRedirect: true,
          signInFlow: 'redirect',
          tosUrl: '/tos',
          privacyPolicyUrl: '/privacypolicy',
        },
        tenantId2: {
          displayName: 'Contractor B',
          buttonColor: '#2F2F2F',
          iconUrl: '<icon-url-of-sign-in-button>',
          signInOptions: [
            {
              hd: 'ocp-supplier1.com',
              provider: 'saml.my-provider1',
              fullLabel: 'Contractor Portal',
              providerName: 'SAML provider',
              buttonColor: '#4413AD',
              iconUrl: 'https://www.example.com/photos/my_idp/saml.png',
            },
            {
              provider: 'oidc.my-provider2',
              providerName: 'OIDC provider',
              buttonColor: '#3566AF',
              iconUrl: 'https://www.example.com/photos/my_idp/oidc.png',
            },
          ],
          credentialHelper: 'none',
        },
        _: {
          fullLabel: 'ACME.COM',
          displayName: 'ACME',
          buttonColor: '#53B2BF',
          iconUrl: '<icon-url-of-sign-in-button>',
          signInOptions: [
            'google.com',
            'password',
          ]
        },
      }
    };
    uiHandlerConfig = new UiHandlerConfig(configObject);
    testUtil = new FakeUtil().install();
    stub.replace(log, 'error', recordFunction());
  },

  tearDown() {
    stub.reset();
    configObject = null;
  },

  testGetAuthDomain() {
    // Test that the expected Auth domain is returned.
    assertEquals(configObject['authDomain'], uiHandlerConfig.getAuthDomain());

    // Test that error is thrown if Auth domain is not provided in the config.
    configObject['authDomain'] = undefined;
    uiHandlerConfig.setConfig(configObject);
    const error = assertThrows(() => {
      uiHandlerConfig.getAuthDomain();
    });
    assertEquals(
        'Invalid project configuration: authDomain is required!',
        error.message);
  },

  testGetDisplayMode() {
    // Test that the expected optionFirst display mode is returned.
    assertEquals('optionFirst', uiHandlerConfig.getDisplayMode());

    // Test that the expected identifierFirst display mode is returned.
    configObject['displayMode'] = 'identifierFirst';
    uiHandlerConfig.setConfig(configObject);
    assertEquals('identifierFirst', uiHandlerConfig.getDisplayMode());

    // Test that default mode is returned if invalid display mode is provided.
    configObject['displayMode'] = 'invalid_mode';
    uiHandlerConfig.setConfig(configObject);
    assertEquals('optionFirst', uiHandlerConfig.getDisplayMode());

    // Test that default mode is returned if no display mode is provided.
    configObject['displayMode'] = undefined;
    uiHandlerConfig.setConfig(configObject);
    assertEquals('optionFirst', uiHandlerConfig.getDisplayMode());
  },

  testGetCallbacks() {
    // Test when no callbacks are configured.
    assertNull(uiHandlerConfig.getSignInUiShownCallback());
    assertNull(uiHandlerConfig.getSelectTenantUiShownCallback());
    assertNull(uiHandlerConfig.getSelectTenantUiHiddenCallback());
    assertNull(uiHandlerConfig.getBeforeSignInSuccessCallback());

    // Test when empty callbacks are configured.
    configObject['callbacks'] = {};
    uiHandlerConfig.setConfig(configObject);

    assertNull(uiHandlerConfig.getSignInUiShownCallback());
    assertNull(uiHandlerConfig.getSelectTenantUiShownCallback());
    assertNull(uiHandlerConfig.getSelectTenantUiHiddenCallback());
    assertNull(uiHandlerConfig.getBeforeSignInSuccessCallback());

    // Test that the correct callbacks are returned.
    const signInUiShownCallback = (tenantId) => {};
    const selectTenantUiShownCallback = () => {};
    const selectTenantUiHiddenCallback = () => {};
    const beforeSignInSuccessCallback = (user) => {};
    configObject['callbacks'] = {
      signInUiShown: signInUiShownCallback,
      selectTenantUiShown: selectTenantUiShownCallback,
      selectTenantUiHidden: selectTenantUiHiddenCallback,
      beforeSignInSuccess: beforeSignInSuccessCallback,
    };
    uiHandlerConfig.setConfig(configObject);
    assertEquals(signInUiShownCallback,
                 uiHandlerConfig.getSignInUiShownCallback());
    assertEquals(selectTenantUiShownCallback,
                 uiHandlerConfig.getSelectTenantUiShownCallback());
    assertEquals(selectTenantUiHiddenCallback,
                 uiHandlerConfig.getSelectTenantUiHiddenCallback());
    assertEquals(beforeSignInSuccessCallback,
                 uiHandlerConfig.getBeforeSignInSuccessCallback());
  },

  testGetTosUrl() {
    // Verify null is returned if tosUrl is not provided.
    assertNull(uiHandlerConfig.getTosUrl());

    // Verify null is returned if tosUrl is provided but privacyPolicyUrl is
    // not.
    configObject['tosUrl'] = 'http://localhost/tos';
    uiHandlerConfig.setConfig(configObject);
    assertNull(uiHandlerConfig.getTosUrl());

    // Verify tos callback is returned if both tosUrl and privacyPolicyUrl are
    // provided.
    configObject['privacyPolicyUrl'] = 'http://localhost/privacy_policy';
    uiHandlerConfig.setConfig(configObject);
    let tosCallback = uiHandlerConfig.getTosUrl();
    tosCallback();
    testUtil.assertOpen('http://localhost/tos', '_blank');
    // Test for Cordova environment.
    // Mock that Cordova InAppBrowser plugin is installed.
    stub.replace(
        util,
        'isCordovaInAppBrowserInstalled',
        () => true);
    tosCallback = uiHandlerConfig.getTosUrl();
    tosCallback();
    // Target should be _system if Cordova InAppBrowser plugin is installed.
    testUtil.assertOpen('http://localhost/tos', '_system');

    // Test if callback function is passed to tosUrl config.
    tosCallback = () => {};
    configObject['tosUrl'] = tosCallback;
    uiHandlerConfig.setConfig(configObject);
    assertEquals(tosCallback, uiHandlerConfig.getTosUrl());

    // Test when invalid type is passed to tosUrl config.
    configObject['tosUrl'] = 123456;
    uiHandlerConfig.setConfig(configObject);
    assertNull(uiHandlerConfig.getTosUrl());
  },

  testGetPrivacyPolicyUrl() {
    // Verify null is returned if privacyPolicyUrl is not provided.
    assertNull(uiHandlerConfig.getPrivacyPolicyUrl());

    // Verify null is returned if privacyPolicyUrl is provided but tosUrl is
    // not.
    configObject['privacyPolicyUrl'] = 'http://localhost/privacy_policy';
    uiHandlerConfig.setConfig(configObject);
    assertNull(uiHandlerConfig.getPrivacyPolicyUrl());

    // Verify privacy policy callback is returned if both tosUrl and
    // privacyPolicyUrl are provided.
    configObject['tosUrl'] = 'http://localhost/tos';
    uiHandlerConfig.setConfig(configObject);
    let privacyPolicyUrlCallback = uiHandlerConfig.getPrivacyPolicyUrl();
    privacyPolicyUrlCallback();
    testUtil.assertOpen('http://localhost/privacy_policy', '_blank');
    // Test for Cordova environment.
    // Mock that Cordova InAppBrowser plugin is installed.
    stub.replace(
        util,
        'isCordovaInAppBrowserInstalled',
        () => true);
    privacyPolicyUrlCallback = uiHandlerConfig.getPrivacyPolicyUrl();
    privacyPolicyUrlCallback();
    // Target should be _system if Cordova InAppBrowser plugin is installed.
    testUtil.assertOpen('http://localhost/privacy_policy', '_system');

    // Test if callback function is passed to privacyPolicyUrl config.
    privacyPolicyUrlCallback = () => {};
    configObject['privacyPolicyUrl'] = privacyPolicyUrlCallback;
    uiHandlerConfig.setConfig(configObject);
    assertEquals(
        privacyPolicyUrlCallback, uiHandlerConfig.getPrivacyPolicyUrl());

    // Test when invalid type is passed to privacyPolicyUrl config.
    configObject['privacyPolicyUrl'] = 123456;
    uiHandlerConfig.setConfig(configObject);
    assertNull(uiHandlerConfig.getPrivacyPolicyUrl());
  },

  testValidateTenantId() {
    assertNotThrows(() => {
      uiHandlerConfig.validateTenantId('tenantId1');
    });

    const error = assertThrows(() => {
      uiHandlerConfig.validateTenantId('invalid_tenant_id');
    });
    assertEquals(
        'Invalid tenant configuration!',
        error.message);

    // Provide default config keyed by '*'. No error should be thrown.
    configObject['tenants']['*'] = {
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'google.com',
        'password',
      ],
    };
    assertNotThrows(() => {
      uiHandlerConfig.validateTenantId('arbitrary_tenant_id');
    });
  },

  testGetProvidersForTenant() {
    // Verify that the expected providers are returned for tenant.
    assertArrayEquals(['microsoft.com', 'password'],
                      uiHandlerConfig.getProvidersForTenant('tenantId1'));

    // Verify that the expected providers are returned for top-level project.
    assertArrayEquals(['google.com', 'password'],
                      uiHandlerConfig.getProvidersForTenant('_'));

    // Verify that invalid signInOption is skipped.
    const invalidOption = {
      'provider': 123456,
    };
    configObject['tenants']['tenantId1']['signInOptions'][0] = invalidOption;
    assertEquals(0, log.error.getCallCount());
    assertArrayEquals(['password'],
                      uiHandlerConfig.getProvidersForTenant('tenantId1'));
    assertEquals(1, log.error.getCallCount());
    assertEquals(
        `Invalid tenant configuration: signInOption `+
        `${JSON.stringify(invalidOption)} is invalid!`,
        log.error.getLastCall().getArgument(0));

    // Verify that error is thrown if signInOptions are not configured.
    delete configObject['tenants']['tenantId1']['signInOptions'];
    let error = assertThrows(() => {
      uiHandlerConfig.getProvidersForTenant('tenantId1');
    });
    assertEquals('Invalid tenant configuration: signInOptions are invalid!',
                 error.message);

    // Verify that empty array is returned if the tenant ID is invalid.
    assertEquals(1, log.error.getCallCount());
    assertArrayEquals(
        [],
        uiHandlerConfig.getProvidersForTenant('invalid_tenant_id'));
    assertEquals(2, log.error.getCallCount());
    assertEquals(
        'Invalid tenant configuration: invalid_tenant_id is not configured!',
        log.error.getLastCall().getArgument(0));

    // Verify the default configuration is returned for arbitrary tenant.
    configObject['tenants']['*'] = {
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'microsoft.com',
        'google.com',
      ],
    };
    assertArrayEquals(
        ['microsoft.com', 'google.com'],
        uiHandlerConfig.getProvidersForTenant('arbitrary_tenant_id'));

    // Verify the default configuration is returned for top level project.
    delete configObject['tenants']['_'];
    assertArrayEquals(
        ['microsoft.com', 'google.com'],
        uiHandlerConfig.getProvidersForTenant('_'));
  },

  testGetProvidersForTenant_emailMatch() {
    // Test getProvidersForTenant when email is provided for matching.
    // Verify that expected matching providers are returned when hd is string.
    let providers =
        uiHandlerConfig.getProvidersForTenant(
            'tenantId1', 'user@acme.com');
    assertArrayEquals(['microsoft.com'], providers);

    // Verify that expected matching providers are returned when hd is regex.
    configObject['tenants']['tenantId1']['signInOptions'][0]['hd'] =
        /@acme\.com$/;
    providers =
        uiHandlerConfig.getProvidersForTenant(
            'tenantId1', 'user@acme.com');
    assertArrayEquals(['microsoft.com'], providers);

    // Verify that multiple providers are returned if they all match with the
    // email.
    configObject['tenants']['tenantId1']['signInOptions'].push({
      hd: 'acme.com',
      provider: 'google.com',
    });
    providers =
        uiHandlerConfig.getProvidersForTenant(
            'tenantId1', 'user@acme.com');
    assertArrayEquals(['microsoft.com', 'google.com'], providers);

    // Verify that empty array is returned if there is no matching providers.
    providers =
        uiHandlerConfig.getProvidersForTenant(
            'tenantId1', 'user@acme.com123');
    assertArrayEquals([], providers);

    // Verify that if hd is not specified, the associated provider is still
    // returned.
    // oidc.my-provider2 doesn't have hd configured but is still returned.
    providers =
        uiHandlerConfig.getProvidersForTenant(
             'tenantId2', 'user@ocp-supplier1.com');
    assertArrayEquals(['saml.my-provider1', 'oidc.my-provider2'], providers);

    // Verify that the provider is returned if signInOption is string.
    providers =
        uiHandlerConfig.getProvidersForTenant(
            '_', 'user@example.com');
    assertArrayEquals(['google.com', 'password'], providers);

    // Verify that invalid signInOption is skipped.
    const invalidOption = {
      'provider': 123456,
    };
    configObject['tenants']['tenantId1']['signInOptions'][0] = invalidOption;
    assertEquals(0, log.error.getCallCount());
    assertArrayEquals(
        ['google.com'],
        uiHandlerConfig.getProvidersForTenant('tenantId1', 'user@acme.com'));
    assertEquals(1, log.error.getCallCount());
    assertEquals(
        `Invalid tenant configuration: signInOption `+
        `${JSON.stringify(invalidOption)} is invalid!`,
        log.error.getLastCall().getArgument(0));

    // Verify that empty array is returned if signInOptions are not configured.
    delete configObject['tenants']['tenantId1']['signInOptions'];
    let error = assertThrows(() => {
      uiHandlerConfig.getProvidersForTenant('tenantId1', 'user@example.com');
    });
    assertEquals('Invalid tenant configuration: signInOptions are invalid!',
                 error.message);

    // Verify that empty array is returned if the tenant ID is invalid.
    assertEquals(1, log.error.getCallCount());
    assertArrayEquals(
        [],
        uiHandlerConfig.getProvidersForTenant(
            'invalid_tenant_id', 'user@acme.com'));
    assertEquals(2, log.error.getCallCount());
    assertEquals(
        'Invalid tenant configuration: invalid_tenant_id is not configured!',
        log.error.getLastCall().getArgument(0));
  },

  testGetSignInConfigForTenant() {
    // Test that the sign-in related configs for the tenant are returned.
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant('tenantId1');
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['tenantId1']) {
        assertObjectEquals(
            configObject['tenants']['tenantId1'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties are copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
  },

  testGetSignInConfigForTenant_eligibleProviders() {
    // Test that the sign-in related configs with only eligible providers are
    // returned if eligible providers are passed.
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant(
            'tenantId1', ['microsoft.com']);
    // Remove password provider from the expected configs.
    configObject['tenants']['tenantId1']['signInOptions'].splice(1, 1);
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['tenantId1']) {
        assertObjectEquals(
            configObject['tenants']['tenantId1'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties are copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
  },

  testGetSignInConfigForTenant_topLevelProject() {
    // Test that the sign-in related configs are returned for top-level project.
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant('_');
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['_']) {
        assertObjectEquals(
            configObject['tenants']['_'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties are copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
  },

  testGetSignInConfigForTenant_defaultConfig() {
    // Test that the default sign-in related configs are returned for arbitrary
    // tenant if default configuration is provided.
    configObject['tenants']['*'] = {
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'microsoft.com',
        'google.com',
      ],
    };
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant('arbitrary_tenant_id');
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['*']) {
        assertObjectEquals(
            configObject['tenants']['*'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties are copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
  },

  testGetSignInConfigForTenant_defaultConfig_topLevelProject() {
    // Test that the default sign-in related configs are returned for top level
    // project if default configuration is provided.
    delete configObject['tenants']['_'];
    configObject['tenants']['*'] = {
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'microsoft.com',
        'google.com',
      ],
    };
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant('_');
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['*']) {
        assertObjectEquals(
            configObject['tenants']['*'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties are copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
  },

  testGetSignInConfigForTenant_unsupportedConfig() {
    // Test that additional unsupported configs, eg. 'credentialHelper' are
    // removed from the returned object.
    const tenantSignInConfig =
        uiHandlerConfig.getSignInConfigForTenant('tenantId2');
    // All sign-in related properties in the original config object should be
    // copied over to the returned sign-in config object.
    UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.forEach((key) => {
      if (key in configObject['tenants']['tenantId2']) {
        assertObjectEquals(
            configObject['tenants']['tenantId2'][key],
            tenantSignInConfig[key]);
      }
    });
    // Verify that no unrelated properties would be copied over.
    for (let key in tenantSignInConfig) {
      assertTrue(UiHandlerConfig.SUPPORTED_SIGN_IN_CONFIG_KEYS.includes(key));
    }
    assertUndefined(tenantSignInConfig['credentialHelper']);
  },

  testGetSignInConfigForTenant_invalidTenantId() {
    // Verify that error is thrown if invalid tenant ID is provided.
    const error = assertThrows(() => {
      uiHandlerConfig.getSignInConfigForTenant('invalid_tenant_id');
    });
    assertEquals(
        'Invalid tenant configuration!',
        error.message);
  },

  testGetSelectionButtonConfigForTenant() {
    // Test that the option first tenant selection related configs are returned.
    const tenantButtonConfig =
        uiHandlerConfig.getSelectionButtonConfigForTenant('tenantId1');
    assertObjectEquals(
        {
          tenantId: 'tenantId1',
          fullLabel: 'Contractor A Portal',
          displayName: 'Contractor A',
          buttonColor: '#FFB6C1',
          iconUrl: '<icon-url-of-sign-in-button>',
        },
        tenantButtonConfig);
  },

  testGetSelectionButtonConfigForTenant_topLevelProject() {
    // Test that the option first tenant selection related configs are returned
    // for top-level project.
    const tenantButtonConfig =
        uiHandlerConfig.getSelectionButtonConfigForTenant('_');
    assertObjectEquals(
        {
          tenantId: null,
          fullLabel: 'ACME.COM',
          displayName: 'ACME',
          buttonColor: '#53B2BF',
          iconUrl: '<icon-url-of-sign-in-button>',
        },
        tenantButtonConfig);
  },

  testGetSelectionButtonConfigForTenant_defaultConfig() {
    // Test that the default option first tenant selection related configs are
    // returned for arbitrary tenant if default configuration is provided.
    configObject['tenants']['*'] = {
      fullLabel: 'Dealership Login',
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'microsoft.com',
        'google.com',
      ],
    };
    const tenantButtonConfig =
        uiHandlerConfig.getSelectionButtonConfigForTenant(
            'arbitrary_tenant_id');
    assertObjectEquals(
        {
          tenantId: 'arbitrary_tenant_id',
          fullLabel: 'Dealership Login',
          displayName: 'DEALER',
          buttonColor: '#37D2AC',
          iconUrl: '<icon-url-of-sign-in-button>',
        },
        tenantButtonConfig);
  },

  testGetSelectionButtonConfigForTenant_defaultConfig_topLevelProject() {
    // Test that the default option first tenant selection related configs are
    // returned for top level project if default configuration is provided.
    delete configObject['tenants']['_'];
    configObject['tenants']['*'] = {
      fullLabel: 'Dealership Login',
      displayName: 'DEALER',
      buttonColor: '#37D2AC',
      iconUrl: '<icon-url-of-sign-in-button>',
      signInOptions: [
        'microsoft.com',
        'google.com',
      ],
    };
    const tenantButtonConfig =
        uiHandlerConfig.getSelectionButtonConfigForTenant('_');
    assertObjectEquals(
        {
          tenantId: null,
          fullLabel: 'Dealership Login',
          displayName: 'DEALER',
          buttonColor: '#37D2AC',
          iconUrl: '<icon-url-of-sign-in-button>',
        },
        tenantButtonConfig);
  },

  testGetSelectionButtonConfigForTenant_tenantNotConfigured() {
    // Verify that null is returned if the tenant button is not configured.
    assertEquals(0, log.error.getCallCount());
    assertNull(
        uiHandlerConfig.getSelectionButtonConfigForTenant('unknown_tenant_id'));
    assertEquals(1, log.error.getCallCount());
    assertEquals(
        'Invalid tenant configuration: unknown_tenant_id is not configured!',
        log.error.getLastCall().getArgument(0));
  },
});

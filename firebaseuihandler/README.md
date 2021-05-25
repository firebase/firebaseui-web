# IAP External Identities Support with FirebaseUI

To use external identities with
[IAP](https://cloud.google.com/iap/docs/external-identities), your app needs a
page for authenticating users. IAP will redirect any unauthenticated
requests to this page.

The `FirebaseUiHandler` API in `firebaseui` module provides simple, customizable
elements that help reduce boilerplate code when building the authentication UI.
It handles the UI flows for tenant selection, user authentication,
token refreshes and sign-out.

FirebaseUiHandler implements the
[`AuthenticationHandler`](https://cloud.google.com/iap/docs/create-custom-auth-ui)
interface that
[`gcip-iap`](https://github.com/GoogleCloudPlatform/iap-gcip-web-toolkit)
defines. You just need to provide a UI configuration object and pass it to a
`gcip-iap` Authentication instance.

## Table of Contents

1. [Prerequisite](#Prerequisite)
2. [Installation](#installation)
3. [Configuring your authentication UI](#configuring-your-authentication-ui)
4. [API references](#api-reference)
5. [Configuring Authentication URL](#configuring-authentication-url)

## Prerequisite

A [Google Cloud Identity Platform](https://cloud.google.com/identity-platform/)
project is required. Firebase projects can upgrade to GCIP projects through the
[Cloud Console](https://console.cloud.google.com/customer-identity).

Ensure you've configured IAP to use external identities and set up providers
with Identity Platform. See
[Enabling external identities](https://cloud.google.com/iap/docs/enable-external-identities)
to learn how.

## Installation

Install `gcip-iap`, `firebaseui` and its peer-dependency firebase via npm using
the following commands:

```bash
$ npm install firebase --save
$ npm install firebaseui --save
$ npm install gcip-iap --save
```

The `gcip-iap` module is not available via CDN.

You can then `import` the following modules within your source files:

```javascript
// Import firebase modules.
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
// Import firebaseui module.
import * as firebaseui from 'firebaseui'
// Import gcip-iap module.
import * as ciap from 'gcip-iap';
```

Or use cjs `require` to include the modules:

```javascript
// Require firebase modules.
var firebase = require('firebase/compat/app');
require('firebase/compat/auth');
// Require firebaseui module.
var firebaseui = require('firebaseui');
// Require gcip-iap module.
var ciap = require('gcip-iap');
```

Localization is supported by FirebaseUI. You need to build and import the
localized versions following the
[instructions](https://github.com/firebase/firebaseui-web#building-firebaseui).


## Configuring your authentication UI
`FirebaseUiHandler` takes a configuration object that specifies the tenants and
providers to use for authentication. A full configuration can be very long,
and might look something like this:
```javascript
// The project configurations.
const configs = {
  // Configuration for project identified by API key API_KEY1.
  API_KEY1: {
    authDomain: 'project-id1.firebaseapp.com',
    // Decide whether to ask user for identifier to figure out what tenant to
    // select or whether to present all the tenants to select from.
    displayMode: 'optionFirst', // Or identifierFirst
    callbacks: {
      // The callback to trigger when the selection tenant page
      // or enter email for tenant matching page is shown.
      selectTenantUiShown: () => {
        // Show title and additional display info.
      },
      // The callback to trigger when the selection tenant page
      // or enter email for tenant matching page is hidden.
      selectTenantUiHidden: () => {
        // Hide title and additional display info.
      },
      // The callback to trigger when the sign-in page
      // is shown.
      signInUiShown: (tenantId) => {
        // Show tenant title and additional display info.
      },
      beforeSignInSuccess: (user) => {
        // Do additional processing on user before sign-in is
        // complete.
        return Promise.resolve(user);
      }
    },
    tenants: {
      // Tenant configuration for tenant ID tenantId1.
      tenantId1: {
        // To customize the full tenant selection button label:
        // fullLabel: 'ACME Portal',
        // Display name, button color and icon URL of the
        // tenant selection button.
        displayName: 'ACME',
        buttonColor: '#2F2F2F',
        iconUrl: '<icon-url-of-sign-in-button>',
         // Sign-in providers enabled for tenantId1.
        signInOptions: [
          // Microsoft sign-in.
          {
            provider: 'microsoft.com',
          },
          // Email/password sign-in.
          {
            provider: 'password',
            // Do not require display name on sign up.
            requireDisplayName: false
          },
          // SAML provider.
          {
            provider: 'saml.my-provider1',
            providerName: 'SAML provider',
            // To customize the full label:
            // fullLabel: 'ACME Portal',
            buttonColor: '#4666FF',
            iconUrl: 'https://www.example.com/photos/my_idp/saml.png'
          },
        ],
        signInFlow: 'redirect', // Or popup
      },
      // Tenant configuration for tenant ID tenantId2.
      tenantId2: {
        // To customize the full tenant selection button label:
        // fullLabel: 'OCP Portal',
        displayName: 'OCP',
        buttonColor: '#2F2F2F',
        iconUrl: '<icon-url-of-sign-in-button>',
        // Tenant2 supports SAML, OIDC sign-in.
        signInOptions: [
          // SAML provider. (multiple SAML providers can be passed)
          {
            provider: 'saml.my-provider2',
            providerName: 'SAML provider',
            buttonColor: '#4666FF',
            iconUrl: 'https://www.example.com/photos/my_idp/saml.png'
          },
          // OIDC provider. (multiple OIDC providers can be passed)
          {
            provider: 'oidc.my-provider1',
            providerName: 'OIDC provider',
            // To customize the full label:
            // fullLabel: 'Contractor Login',
            buttonColor: '#4666FF',
            iconUrl: 'https://www.example.com/photos/my_idp/oidc.png'
          },
        ],
      },
    },
  },
};

// Create a FirebaseUiHandler instance.
const handler = new firebaseui.auth.FirebaseUiHandler(
    '#firebaseui-auth-container', configs);
// Initialize a ciap.Authentication instance using the FirebaseUiHandler
// instance.
const ciapInstance = new ciap.Authentication(handler);

// Start the authentication flow.
ciapInstance.start();
```

### Getting the authentication domain
Set the `authdomain` field to the domain provisioned to facilitate federated
sign-in. You can retrieve this field from the
[Identity Platform page](https://console.cloud.google.com/customer-identity)
in the Cloud Console.

### Configuring tenants and providers
A configuration requires a list of tenants and providers that users can
authenticate with. Each tenant has a list of providers; these are specified in
the `signInOptions` field. See
[Configuring sign-in providers in the FirebaseUI](https://github.com/firebase/firebaseui-web#configuring-sign-in-providers)
to learn how to configure providers.

### Choosing a tenant selection mode
Users can select a tenant in two ways: `optionsFirst` mode, or
`identifierFirst` mode.

In options mode, the user begins by selecting a tenant from a list.
In identifier mode, the user enters their email first. The system then
automatically selects the first tenant with an identity provider matching the
email's domain.

To use options mode, set `displayMode` to `optionFirst`. You'll then need to
provide configuration information for each tenant's button, including
`displayName`, `buttonColor`, and `iconUrl`.

The following is an example of a tenant configured to use options mode:

```javascript
tenantId1: {
  // To customize the full tenant selection button label:
  // fullLabel: 'ACME Portal',
  displayName: 'ACME',
  buttonColor: '#2F2F2F',
  iconUrl: '<icon-url-of-sign-in-button>',
  // ...
```

To use identifier mode, each sign-in option must specify an `hd` field
indicating what domain it supports. This can be either a regex
(such as `/@example\.com$/`) or the domain string (e.g., `example.com`).

The code below shows a tenant configured to use identifier mode:

```javascript
tenantId1: {
  signInOptions: [
    // Email/password sign-in.
    {
      hd: 'acme.com', // using regex: /@acme\.com$/
      // ...
    },
```

### Setting up callbacks
The configuration object contains a set of optional callbacks that are invoked
at various points during the authentication flow. This allows you to
additionally customize the UI. The following hooks are available:

|Callback          | Description                                          |
|------------------|------------------------------------------------------|
|selectTenantUiShown()|Triggered when the UI to select a tenant is shown. Use this if you want to modify the UI with a customized title or theme.|
|selectTenantUiHidden()|Triggered when the UI to select a tenant is hidden, which is always before `signInUiShown` is triggered (if applicable). Use this if you want to hide the UI displayed in `selectTenantUiShown`.|
|signInUiShown(tenantId)|Triggered when a tenant is selected and the UI for the user to enter their credentials is shown. Use this if you want to modify the UI with a customized title or theme.|
|beforeSignInSuccess(user)|Triggered before sign-in completes. Use this to modify a signed in user before redirecting back to the IAP resource.|

The following example code shows how you might implement these callbacks:

```javascript
callbacks: {
  selectTenantUiShown: () => {
    // Show info of the IAP resource.
    showUiTitle(
        'Select your employer to access your Health Benefits');
  },
  selectTenantUiHidden: () => {
    // Hide the previous displayed title.
    hideUiTitle();
  },
  signInUiShown: (tenantId) => {
    // Show tenant title and additional display info.
    const tenantName = getTenantNameFromId(tenantId);
    showUiTitle(`Sign in to access your ${tenantName} Health Benefits`);
  },
  beforeSignInSuccess: (user) => {
    // Do additional processing on user before sign-in is
    // complete.
    // For example update the user profile.
    return user.updateProfile({
      photoURL: 'https://example.com/profile/1234/photo.png',
    }).then(function() {
      // To reflect updated photoURL in the ID token, force token
      // refresh.
      return user.getIdToken(true);
    }).then(function() {
      return user;
    });
  }
}
```

### Configuring a single federated provider
If you only have one tenant/top-level project configured for the IAP resouce and
only one provider enabled for the tenant/project, FirebaseUI will act as a proxy
between the IAP resource and the federated IdP without showing any UI before
redirecting to the IdP sign-in page:

```javascript
// The project configurations for a single Facebook identity provider.
const configs = {
  // Configuration for project identified by API key API_KEY1.
  API_KEY1: {
    authDomain: 'project-id1.firebaseapp.com',
    tenants: {
      // The '*' key is used as a fallback when the tenant ID is not found. So
      // you can use it for single tenant/top-level project flow to replace the
      // hardcoded tenant ID or '_'.
      '*': {
        displayName: 'My Organization',
        signInOptions: [
          // Replace Facebook with another provider ID or provider configuration
          // object if you want to use a different IdP.
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        ],
        immediateFederatedRedirect: true,
      },
    },
  },
};
```

### Configuring providers for multiple projects
In most cases, you only need to specify a single API key. However, if you want
to use a single authentication URL across multiple projects, you can include
multiple API keys in a single configuration object.

```javascript
const configs = {
  API_KEY1: {
    // Config goes here
  },
  API_KEY2: {
    // Config goes here
  },
}
```

### API reference

```typescript
// The type of the configuration object for FirebaseUiHandler. The key of the
// object is the API key of the project.
type CIAPHandlerConfig = {[key: string]: GCIPProjectConfig};

// Interface that represents the project-level configuration.
interface GCIPProjectConfig {
  // The Auth domain of the project. Retrieve it from
  // https://console.cloud.google.com/customer-identity
  authDomain: string;
  // The display mode of for tenant selection: `optionFirst` or
  // `identifierFirst`. Default: `optionFirst`
  displayMode?: string;
  // The URL of the Terms of Service page or a callback function to be invoked
  // when Terms of Service link is clicked in tenant selection page for
  // optionFirst mode or enter email for tenant matching page for
  // identifierFirst mode.
  tosUrl?: (() => void) | string;
  // The URL of the Privacy Policy page or a callback function to be invoked
  // when Privacy Policy link is clicked in tenant selection page for
  // optionFirst mode or enter email for tenant matching page for
  // identifierFirst mode.
  privacyPolicyUrl?: (() => void) | string;
  // The object of developers callbacks after specific events.
  callbacks?: Callbacks;
  // The tenant-level configurations object. The key of the object is the
  // tenant ID. If using non-tenant flow, use `_` for the key.
  tenants: {[key: string]: TenantConfig};
}

// Interface that represents the available developer callbacks.
interface Callbacks {
  // The callback to trigger when the tenant selection page for optionFirst
  // mode or enter email for tenant matching page for identifierFirst mode
  // is shown.
  selectTenantUiShown?(): void;
  // The callback to trigger when the tenant selection page for optionFirst
  // mode or enter email for tenant matching page for identifierFirst mode
  // is hidden.
  selectTenantUiHidden?(): void;
  // The callback to trigger when the sign-in page is shown. The tenant ID is
  // passed to the callback.
  signInUiShown?(string): void;
  // The callback to triggered before sign-in completes. The signed in user is
  // passed to the callback.
  beforeSignInSuccess?(currentUser: firebase.User): Promise<firebase.User>;
}

// Interface that represents the tenant-level configurations.
interface TenantConfig {
  // The full label for the tenant in the tenant selection buttion. Only needed
  // if you are using the option first mode.
  // When not provided, the "Sign in to $displayName" label is used.
  fullLabel?: string;
  // The display name for tenant in the tenant selection button. Only needed if
  // you are using the option first mode.
  displayName?: string;
  // The color of the tenant selection button. Only needed if you are
  // using the option first mode.
  buttonColor?: string;
  // The URL of the icon for tenant selection button. Only needed
  // if you are using the option first mode.
  iconUrl?: string;
  // A boolean which determines whether to immediately redirect to the
  // provider's site or instead show the default 'Sign in with Provider' button
  // when there is only a single federated provider in signInOptions. In order
  // for this option to take effect, the signInOptions must only hold a single
  // federated provider (like 'google.com') and signInFlow must be set to
  // `redirect`.
  immediateFederatedRedirect?: boolean;
  // The sign-in flow to use for IDP providers: `redirect` or `popup`.
  // Default: `redirect`
  signInFlow?: string;
  // The list of providers enabled for signing into your app. The order you
  // specify them will be the order they are displayed on the sign-in provider
  // selection screen.
  signInOptions: Array<string|SignInOption>;
  // The URL of the Terms of Service page or a callback function to be invoked
  // when Terms of Service link is clicked after the tenant is determind.
  tosUrl?: (() => void) | string;
  // The URL of the Terms of Service page or a callback function to be invoked
  // when Terms of Service link is clicked after the tenant is determind.
  privacyPolicyUrl?: (() => void) | string;
}

// Interface the represent the sign-in provider configuration. Additional
// configurations might be available according to different providers.
interface SignInOption {
  // The provider ID.
  provider: string;
  // The domain string or a regex to match email address. Only needed if you
  // are using the identifier first mode.
  hd?: string;
  // The provider name displayed to end users (sign in button/linking prompt).
  providerName?: string;
  // The color of sign in button.
  buttonColor?: string;
  // The URL of the Identity Provider's icon. This will be displayed on the
  // provider's sign-in button, etc.
  iconUrl?: string;
}

// The FirebaseUI handler to handle the UI flows for tenant selection,
// user authentication, token refreshes and sign-out.
class FirebaseUiHandler {
  constructor(
      element: Element|string,
      configs: {[key: string]: firebaseui.auth.CIAPHandlerConfig});
}
```

## Configuring Authentication URL
You can host your authentication UI using Firebase Hosting or other web hosting
services. Once it's done, register the URL of the authentication UI in the
side panel of [IAP page](https://console.cloud.google.com/security/iap)
in the Cloud Console.
You need to select whether to use `project providers` or `tenants`, and check
the boxes of the providers or tenants to enable.

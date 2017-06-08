[![Build Status](https://travis-ci.org/firebase/firebaseui-web.svg?branch=master)](https://travis-ci.org/firebase/firebaseui-web)

# FirebaseUI for Web — Auth

FirebaseUI is an open-source JavaScript library for Web that provides simple,
customizable UI bindings on top of [Firebase](https://firebase.google.com) SDKs
to eliminate boilerplate code and promote best practices.

FirebaseUI Auth provides a drop-in auth solution that handles the UI flows for
signing in users with email addresses and passwords, and Identity Provider Sign
In using Google, Facebook and others. It is built on top of
[Firebase Auth](https://firebase.google.com/docs/auth).

The FirebaseUI component implements best practices for authentication on mobile
devices and websites, helping to sign-in and sign-up conversion for your app. It
also handles cases like account recovery and account linking that can be
security sensitive and error-prone to handle.

FirebaseUI Auth clients are also available for
[iOS](https://github.com/firebase/firebaseui-ios) and
[Android](https://github.com/firebase/firebaseui-android).

FirebaseUI fully supports all recent browsers. Signing in with federated
providers (Google, Facebook, Twitter, Github) is also supported in
Cordova/Ionic environments. Additional non-browser environments (React
Native...) or Chrome extensions will be added once the underlying Firebase core
SDK supports them in a way that is compatible with FirebaseUI.

## Table of Contents

1. [Demo](#demo)
2. [Installation](#installation)
3. [Usage instructions](#using-firebaseui-for-authentication)
4. [Configuration](#configuration)
5. [Customization](#customizing-firebaseui-for-authentication)
6. [Advanced](#advanced)
7. [Developer Setup](#developer-setup)
8. [Cordova Setup](#cordova-setup)
9. [Known issues](#known-issues)
10. [Release Notes](#release-notes)

## Demo

Accessible here:
[https://fir-ui-demo-84a6c.firebaseapp.com](https://fir-ui-demo-84a6c.firebaseapp.com).

## Installation

### Option 1: CDN

You just need to include the following script and CSS file in the `<head>` tag
of your page, below the initialization snippet from the Firebase Console:

```html
<script src="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.js"></script>
<link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.css" />
```

### Option 2: npm Module

Install FirebaseUI and its dependencies via npm using the following command:

```bash
$ npm install firebaseui --save
```

You can then `require` the following modules within your source files:

```javascript
var firebase = require('firebase');
var firebaseui = require('firebaseui');
```

Or include the required files in your HTML, if your HTTP Server serves the files
within `node_modules/`:

```html
<script src="node_modules/firebaseui/dist/firebaseui.js"></script>
<link type="text/css" rel="stylesheet" href="node_modules/firebaseui/dist/firebaseui.css" />
```

### Option 3: Bower component

Install FirebaseUI and its dependencies via Bower using the following command:

```bash
$ bower install firebaseui --save
```

You can then include the required files in your HTML, if your HTTP Server serves
the files within `bower_components/`:

```html
<script src="bower_components/firebaseui/dist/firebaseui.js"></script>
<link type="text/css" rel="stylesheet" href="bower_components/firebaseui/dist/firebaseui.css" />
```

## Using FirebaseUI for Authentication

FirebaseUI includes the following flows:

1. Interaction with Identity Providers such as Google and Facebook
2. Phone number based authentication
3. Sign-up and sign-in with email accounts
4. Password reset
5. Prevention of account duplication (activated when
*"One account per email address"* setting is enabled in the
[Firebase console](https://console.firebase.google.com). This setting is enabled
by default.)
6. [Account Chooser](https://www.accountchooser.com/learnmore.html?lang=en) for
remembering emails

### Configuring sign-in providers

To use FirebaseUI to authenticate users you first need to configure each
provider you want to use in their own developer app settings. Please read the
*Before you begin* section of Firebase Authentication at the following links:

- [Phone number](https://firebase.google.com/docs/auth/web/phone-auth)
- [Email and password](https://firebase.google.com/docs/auth/web/password-auth#before_you_begin)
- [Google](https://firebase.google.com/docs/auth/web/google-signin#before_you_begin)
- [Facebook](https://firebase.google.com/docs/auth/web/facebook-login#before_you_begin)
- [Twitter](https://firebase.google.com/docs/auth/web/twitter-login#before_you_begin)
- [Github](https://firebase.google.com/docs/auth/web/github-auth#before_you_begin)

### Starting the sign-in flow

You first need to initialize your
[Firebase app](https://firebase.google.com/docs/web/setup#prerequisites). The
`firebase.auth.Auth` instance should be passed to the constructor of
`firebaseui.auth.AuthUI`. You can then call the `start` method with the CSS
selector that determines where to create the widget, and a configuration object.

The following example shows how to set up a sign-in screen with all supported
providers. Please refer to the [demo application in the examples folder](demo/)
for a more in-depth example, showcasing a Single Page Application mode.

> Firebase and FirebaseUI do not work when executed directly from a file (i.e.
> opening the file in your browser, not through a web server). Always run
> `firebase serve` (or your preferred local server) to test your app locally.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <!-- *******************************************************************************************
       * TODO(DEVELOPER): Paste the initialization snippet from:
       * Firebase Console > Overview > Add Firebase to your web app. *
       ***************************************************************************************** -->
    <script src="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.css" />
    <script type="text/javascript">
      // FirebaseUI config.
      var uiConfig = {
        signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID,
          firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>'
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    </script>
  </head>
  <body>
    <!-- The surrounding HTML is left untouched by FirebaseUI.
         Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to My Awesome App</h1>
    <div id="firebaseui-auth-container"></div>
  </body>
</html>
```

Here is how you would track the Auth state across all your pages:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <!-- *******************************************************************************************
       * TODO(DEVELOPER): Paste the initialization snippet from:
       * Firebase Console > Overview > Add Firebase to your web app. *
       ***************************************************************************************** -->
    <script type="text/javascript">
      initApp = function() {
        firebase.auth().onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            user.getToken().then(function(accessToken) {
              document.getElementById('sign-in-status').textContent = 'Signed in';
              document.getElementById('sign-in').textContent = 'Sign out';
              document.getElementById('account-details').textContent = JSON.stringify({
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                phoneNumber: phoneNumber,
                photoURL: photoURL,
                uid: uid,
                accessToken: accessToken,
                providerData: providerData
              }, null, '  ');
            });
          } else {
            // User is signed out.
            document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('sign-in').textContent = 'Sign in';
            document.getElementById('account-details').textContent = 'null';
          }
        }, function(error) {
          console.log(error);
        });
      };

      window.addEventListener('load', function() {
        initApp()
      });
    </script>
  </head>
  <body>
    <h1>Welcome to My Awesome App</h1>
    <div id="sign-in-status"></div>
    <div id="sign-in"></div>
    <div id="account-details"></div>
  </body>
</html>

```

## Configuration

FirebaseUI supports the following configuration parameters.

<table>
<thead>
<tr>
<table>
<thead>
<tr>
<th>Name</th>
<th>Required</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>callbacks</td>
<td>No</td>
<td>
  A list of developers <a href="#available-callbacks">callbacks</a> after
  specific events.
  <br/>
  <em>Default:</em> <code>[]</code>
</td>
</tr>
<tr>
<td>credentialHelper</td>
<td>No</td>
<td>
  The Credential Helper to use.
  See <a href="#credential-helper">Credential Helper</a>.
  <br/>
  <em>Default:</em>
  <code>firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM</code>
</td>
</tr>
<tr>
<td>queryParameterForSignInSuccessUrl</td>
<td>No</td>
<td>
  The redirect URL parameter name for the sign-in success URL. See
  <a href="#overwriting-the-sign-in-success-url">Overwriting the sign-in success URL</a>.
  <br/>
  <em>Default:</em> <code>"signInSuccessUrl"</code>
</td>
</tr>
<tr>
<td>queryParameterForWidgetMode</td>
<td>No</td>
<td>
  The redirect URL parameter name for the “mode” of the Widget.
  See <a href="#firebaseui-widget-modes">FirebaseUI widget modes</a>.
  <br/>
  <em>Default:</em> <code>"mode"</code>
</td>
</tr>
<tr>
<tr>
<td>signInFlow</td>
<td>No</td>
<td>
  The sign-in flow to use for IDP providers: <code>redirect</code> or
  <code>popup</code>.
  <br/>
  <em>Default:</em> <code>"redirect"</code>
</td>
</tr>
<tr>
<tr>
<td>signInOptions</td>
<td>Yes</td>
<td>
  The list of <a href="#available-providers">providers</a> enabled for signing
  into your app. The order you specify them will be the order they are displayed
  on the sign-in provider selection screen.
</td>
</tr>
<tr>
<tr>
<td>signInSuccessUrl</td>
<td>No</td>
<td>
  The URL where to redirect the user after a successful sign-in.
  <strong>Required</strong> when the <code>signInSuccess</code> callback is not
  used or when it returns <code>true</code>.
</td>
</tr>
<tr>
<td>tosUrl</td>
<td>Yes</td>
<td>The URL of the Terms of Service page.</td>
</tr>
</tbody>
</table>

### Credential Helper

The role of a credential helper is to help your users sign into you website.
When one is enabled, your users will be prompted with email addresses and
usernames they have saved from your app or other applications. To achieve this,
[accountchooser.com](https://www.accountchooser.com/learnmore.html) is
available. Upon signing in or signing up with email, the user will be redirected
to the accountchooser.com website and will be able to select one of their saved
accounts. It is recommended to use this, but you can also disable it by
specifying the value below. This feature is always disabled for non HTTP/HTTPS
environments.

|Credential Helper |Value                                                 |
|------------------|------------------------------------------------------|
|accountchooser.com|`firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM`|
|None (disable)    |`firebaseui.auth.CredentialHelper.NONE`               |

### Available providers

|Provider          |Value                                           |
|------------------|------------------------------------------------|
|Google            |`firebase.auth.GoogleAuthProvider.PROVIDER_ID`  |
|Facebook          |`firebase.auth.FacebookAuthProvider.PROVIDER_ID`|
|Twitter           |`firebase.auth.TwitterAuthProvider.PROVIDER_ID` |
|Github            |`firebase.auth.GithubAuthProvider.PROVIDER_ID`  |
|Email and password|`firebase.auth.EmailAuthProvider.PROVIDER_ID`   |
|Phone number      |`firebase.auth.PhoneAuthProvider.PROVIDER_ID`   |

### Configure OAuth providers

To specify custom scopes, or custom OAuth parameters per provider, you can pass
an object instead of just the provider value:

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions = [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: [
        'https://www.googleapis.com/auth/plus.login'
      ],
      customParameters: {
        // Forces account selection even when one account
        // is available.
        prompt: 'select_account'
      }
    },
    {
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      scopes: [
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ],
      customParameters: {
        // Forces password re-entry.
        auth_type: 'reauthenticate'
      }
    },
    firebase.auth.TwitterAuthProvider.PROVIDER_ID, // Twitter does not support scopes.
    firebase.auth.EmailAuthProvider.PROVIDER_ID // Other providers don't need to be given as object.
  ]
});
```

### Configure Email Provider

The `EmailAuthProvider` can be configured to require the user to enter a display name (defaults to `true`).

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions = [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    }
  ]
});
```

### Configure Phone Provider

The `PhoneAuthProvider` can be configured with custom reCAPTCHA parameters
whether reCAPTCHA is visible or invisible (defaults to `normal`). Refer to the
[reCAPTCHA API docs](https://developers.google.com/recaptcha/docs/display) for
more details.

The default country to select in the phone number input can also be set.
[List of supported country codes](javascript/data/README.md). If unspecified,
the phone number input will default to the United States (+1).

The following options are currently supported. Any other
parameters will be ignored.

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions = [
    {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      recaptchaParameters: {
        type: 'image', // 'audio'
        size: 'normal', // 'invisible' or 'compact'
        badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
      },
      defaultCountry: 'GB' // Set default country to the United Kingdom (+44).
    }
  ]
});
```

### Sign In Flows

Two sign in flows are available:

- `redirect`, the default, will perform a full page redirect to the sign-in page
of the provider (Google, Facebook...). This is recommended for mobile apps.
- The `popup` flow will open a popup to the sign-in page of the provider. If the
popup is blocked by the browser, it will fall back to a full page redirect.

### Available callbacks

#### `signInSuccess(currentUser, credential, redirectUrl)`

**Parameters:**

|Name         |Type                          | Optional|Description                                                                                                                                                              |
|-------------|------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`currentUser`|`firebase.User`               |No       |The logged in user.                                                                                                                                                      |
|`credential` |`firebase.auth.AuthCredential`|Yes      |The credential used to sign in the user.                                                                                                                                  |
|`redirectUrl`|`string`                      |Yes      |The URL where the user is redirected after the callback finishes. It will only be given if you [overwrite the sign-in success URL](#overwriting-the-sign-in-success-url).|

**Should return: `boolean`**

If the callback returns `true`, then the page is automatically redirected
depending on the case:

- If no `signInSuccessUrl` parameter was given in the URL (See:
[Overwriting the sign-in success URL](#overwriting-the-sign-in-success-url))
then the default `signInSuccessUrl` in config is used.
- If the value is provided in the URL, that value will be used instead of the
static `signInSuccessUrl` in config.

If the callback returns `false` or nothing, the page is not automatically
redirected.

#### `uiShown()`

This callback is triggered the first time the widget UI is rendered. This is
useful for cases where the application should display a custom loader before
FirebaseUI is displayed.

### Example with all parameters used

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <!-- *******************************************************************************************
       * TODO(DEVELOPER): Paste the initialization snippet from:
       * Firebase Console > Overview > Add Firebase to your web app. *
       ***************************************************************************************** -->
    <script src="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/2.1.1/firebaseui.css" />
    <script type="text/javascript">
      // FirebaseUI config.
      var uiConfig = {
        callbacks: {
          signInSuccess: function(currentUser, credential, redirectUrl) {
            // Do something.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
        // Query parameter name for mode.
        queryParameterForWidgetMode: 'mode',
        // Query parameter name for sign in success url.
        queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: '<url-to-redirect-to-on-success>',
        signInOptions: [
          // Leave the lines as is for the providers you want to offer your users.
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            // Whether the display name should be displayed in the Sign Up page.
            requireDisplayName: true
          },
          {
            provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
            // Invisible reCAPTCHA with image challenge and bottom left badge.
            recaptchaParameters: {
              type: 'image',
              size: 'invisible',
              badge: 'bottomleft'
            }
          }
        ],
        // Terms of service url.
        tosUrl: '<your-tos-url>'
      };

      var ui = new firebaseui.auth.AuthUI(firebase.auth());
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    </script>
  </head>
  <body>
    <!-- The surrounding HTML is left untouched by FirebaseUI.
         Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to My Awesome App</h1>
    <div id="firebaseui-auth-container"></div>
    <div id="loader">Loading...</div>
  </body>
</html>
```

## Customizing FirebaseUI for authentication

Currently, FirebaseUI does not offer customization out of the box. However, the
HTML around the widget is not affected by it so you can display everything you
want around the widget container.

## Advanced

### FirebaseUI widget modes

Upon initialization, FirebaseUI will look for the `mode` parameter in the URL.
Depending on the value of this parameter, it will trigger a specific mode. When
no `mode` parameter is found, it will default to the sign-in mode.

You can change the name of this parameter with the `queryParameterForWidgetMode`
configuration parameter.

|Query parameter value|Description |
|---------------------|------------|
|`?mode=select`       |Sign-in mode|

**Example:**

    https://<url-of-the-widget>?mode=select

### Overwriting the sign-in success URL

You can pass a query parameter to the widget's URL that will overwrite the URL
the user is redirected to after a successful sign-in. If you do so, you must set
the configuration `signInSuccessUrl` value (even if it will be overwritten).
When passing the redirect URL this way, the `signInSuccess` callback will
receive the value as the `redirectUrl` argument.

You **must include the mode explicitly** in the URL when using the
`signInSuccessUrl` parameter, otherwise FirebaseUI will directly redirect to the
URL specified.

You can change the name of this parameter with the
`queryParameterForSignInSuccessUrl` configuration parameter.

**Example:**

`https://<url-of-the-widget>?mode=select&signInSuccessUrl=signedIn.html` will
redirect the user to `https://<url-of-the-widget>/signedIn.html` after a
successful sign-in flow.

## Developer Setup

### Dependencies

To set up a development environment to build FirebaseUI from source, you must
have the following installed:
- Node.js (>= 6.0.0)
- npm (should be included with Node.js)
- Java Runtime Environment

In order to run the demo and tests, you must also have:
- Python (2.7)

Download the FirebaseUI source and its dependencies with:

```bash
git clone https://github.com/firebase/firebaseui-web.git
cd firebaseui-web
npm install
```

### Building FirebaseUI

To build the library, run:
```bash
npm run build
```

This will create output files in the `dist/` folder.

### Running the demo app

To run the demo app, you must have a Firebase project set up on the
[Firebase Console](https://firebase.google.com/console). Copy
`demo/public/sample-config.js` to `demo/public/config.js`:

```bash
cp demo/public/sample-config.js demo/public/config.js
```

Copy the data from the "Add Firebase to your web app" flow in Firebase Console.
Next, run

```bash
npm run demo
```

This will start a local server serving a FirebaseUI demo app with all local
changes. More details can be found in the [demo app folder](demo/), covering
how to configure the app to be deployed on a Firebase Hosting instance.

### Running unit tests.

All unit tests can be run on the command line (via PhantomJS) with:

```bash
npm test
```

Alternatively, the unit tests can be run manually by running

```bash
npm run serve
```

Then, all unit tests can be run at: http://localhost:4000/buildtools/all_tests.html
You can also run tests individually by accessing each HTML file under
`generated/tests`, for example: http://localhost:4000/generated/tests/javascript/widgets/authui_test.html

### Run tests using SauceLabs

*You need a [SauceLabs](https://saucelabs.com/) account to run tests on
SauceLabs.*

Go to your SauceLab account, under "My Account", and copy paste the access key.
Now export the following variables, *in two Terminal windows*:

```bash
export SAUCE_USERNAME=<your username>
export SAUCE_ACCESS_KEY=<the copy pasted access key>
```

 Then, in one Terminal window, start SauceConnect:

 ```bash
./buildtools/sauce_connect.sh
```

Take note of the "Tunnel Identifier" value logged in the terminal,at the top. In
the other terminal that has the exported variables, run the tests:

```bash
npm test -- --saucelabs --tunnelIdentifier=<the tunnel identifier>
```

## Cordova Setup

### Introduction

FirebaseUI sign-in widget supports Cordova applications. This includes
email/password and all OAuth providers (Google, Facebook, Twitter and GitHub).
Phone authentication is not supported due to the limitation in the underlying
Firebase core SDK.

### Available providers

|Provider          |Value                                           |
|------------------|------------------------------------------------|
|Google            |`firebase.auth.GoogleAuthProvider.PROVIDER_ID`  |
|Facebook          |`firebase.auth.FacebookAuthProvider.PROVIDER_ID`|
|Twitter           |`firebase.auth.TwitterAuthProvider.PROVIDER_ID` |
|Github            |`firebase.auth.GithubAuthProvider.PROVIDER_ID`  |
|Email and password|`firebase.auth.EmailAuthProvider.PROVIDER_ID`   |

### Setup and Usage

In order to integrate FirebaseUI with your Cordova application, you need to
follow these steps:

- Install the necessary Cordova plugins, make the necessary Firebase Console
changes and update your config.xml file as documented in
[OAuth Sign-In for Cordova](https://firebase.google.com/docs/auth/web/cordova)
- After you have successfully configured your application, you can use
FirebaseUI in your Cordova application just like any other traditional browser
applications.

Keep in mind the following while you set up the app:
- Only `redirect` `signInFlow` is supported as Firebase Auth does not support
`popup` mode for Cordova.
- `firebase.auth.PhoneAuthProvider.PROVIDER_ID` is not currently supported.
- As the application runs within an embedded webview, `accountchooser.com` will
always be disabled.
- If you are providing a `Content-Security-Policy` make sure you add the
appropriate exceptions for FirebaseUI resources (`style-src`, `media-src`,
`img-src`, `script-src`, etc.) and underlying Firebase JS SDK.

## Known issues

### Firebase Auth does not work in Safari private browsing

When a user has enabled the private browsing mode in Safari, the web storage is
disabled. This currently results in an error being thrown upon Firebase Auth
initialization. Therefore, when following the snippets above, FirebaseUI will
never get initialized and no UI will be displayed.

### Tips for Single Page apps (`UI Widget is already rendered on the page` warning)

When re-rendering the FirebaseUI Auth widget (for instance after signing in a
user, signing her out and trying to sign her in again), it will sometimes log a
warning:

> UI Widget is already rendered on the page and is pending some user
> interaction. Only one widget instance can be rendered per page. The previous
> instance has been automatically reset.

This happens when the UI widget was in a pending state, i.e. the user was in the
middle of performing a sign-in flow. You should generally avoid re-rendering the
widget in the middle of an action, but if you do, to avoid the warning, you
should use the `reset()` method before re-rendering the widget.

### FirebaseUI is broken in IE11 when deployed on a local server accessed through `localhost` (but works when deployed on a remote server)

Several developers reported issues with IE11 when testing the widget integration on a server deployed locally, accessing the application through a `localhost` address. However, it doesn't impact applications deployed on a server (as you can verify in the [demo app](https://fir-ui-demo-84a6c.firebaseapp.com/)).

## Release Notes

**Latest**: https://github.com/firebase/firebaseui-web/releases/latest

**For v1.0.0 and superior:** https://github.com/firebase/firebaseui-web/releases

### 0.5.0

See the milestone [0.5.0](https://github.com/firebase/firebaseui-web/milestone/1)
for the issues covered in this release. Below is a summary of the most important
ones:

- FirebaseUI now supports **Single Page Application**: a `reset` method was
added to allow to dispose of the widget. When the user leaves a page where the
FirebaseUI widget was rendered (for instance in the `componentWillUnmount`
method of a React component), call the `reset` method of the
`firebaseui.auth.AuthUI` instance you created. Also, call the `reset` method
before rendering again the widget if one has already been rendered on the page.
Please refer to the [demo app](demo/) for guidance on how to use FirebaseUI in a
Single Page Application context.
- **Custom scopes** can now be added for each provider. See [Configure OAuth providers](configure-oauth-providers).
- Several issues, different but related to the `displayName` not being present
after sign up with email and password, have been fixed.
- A new config parameter has been added: `signInFlow`. It allows to specify
whether the Identity Providers sign in flows should be done through `redirect`
(the default) or `popup`. See [Sign In Flows](sign-in-flows).

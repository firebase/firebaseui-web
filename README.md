[![Build Status](https://travis-ci.org/firebase/firebaseui-web.svg?branch=master)](https://travis-ci.org/firebase/firebaseui-web)

# FirebaseUI for Web — Auth

FirebaseUI is an open-source JavaScript library for Web that provides simple,
customizable UI bindings on top of [Firebase](https://firebase.google.com) SDKs
to eliminate boilerplate code and promote best practices.

FirebaseUI Auth provides a drop-in auth solution that handles the UI flows for
signing in users with email addresses and passwords, phone numbers, Identity
Provider Sign In including Google, Facebook, GitHub, Twitter, Apple, Microsoft,
Yahoo, OpenID Connect (OIDC) providers and SAML providers. It is built on top of
[Firebase Auth](https://firebase.google.com/docs/auth).

The FirebaseUI component implements best practices for authentication on mobile
devices and websites, helping to sign-in and sign-up conversion for your app. It
also handles cases like account recovery and account linking that can be
security sensitive and error-prone to handle.

FirebaseUI Auth clients are also available for
[iOS](https://github.com/firebase/firebaseui-ios) and
[Android](https://github.com/firebase/firebaseui-android).

FirebaseUI fully supports all recent browsers. Signing in with federated
providers (Google, Facebook, Twitter, GitHub, Apple, Microsoft, Yahoo, OIDC,
SAML) is also supported in Cordova/Ionic environments. Additional non-browser
environments(React Native...) or Chrome extensions will be added once the
underlying Firebase core SDK supports them in a way that is compatible with
FirebaseUI.

## Table of Contents

1. [Demo](#demo)
2. [Installation](#installation)
3. [Usage instructions](#using-firebaseui-for-authentication)
4. [Configuration](#configuration)
5. [Customization](#customizing-firebaseui-for-authentication)
6. [Advanced](#advanced)
7. [Developer Setup](#developer-setup)
8. [IAP External Identities Support with FirebaseUI](#iap-external-identities-support-with-firebaseui)
9. [Cordova Setup](#cordova-setup)
10. [React DOM Setup](#react-dom-setup)
11. [Angular Setup](#angular-setup)
12. [Known issues](#known-issues)
13. [Deprecated APIs](#deprecated-apis)
14. [Release Notes](#release-notes)

## Demo

Accessible here:
[https://fir-ui-demo-84a6c.firebaseapp.com](https://fir-ui-demo-84a6c.firebaseapp.com).

<p align="center">
  <img src="demo/screenshot.png" width="300" title="Screenshot">
</p>

## Installation

### Option 1: CDN

You just need to include the following script and CSS file in the `<head>` tag
of your page, below the initialization snippet from the Firebase Console:

```html
<script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
<link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
```

#### Localized Widget

Localized versions of the widget are available through the CDN. To use a
localized widget, load the localized JS library instead of the default library:

```html
<script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth__{LANGUAGE_CODE}.js"></script>
<link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
```

where `{LANGUAGE_CODE}` is replaced by the code of the language you want. For example, the French
version of the library is available at
`https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth__fr.js`. The list of available
languages and their respective language codes can be found at [LANGUAGES.md](LANGUAGES.md).

Right-to-left languages also require the right-to-left version of the stylesheet, available at
`https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth-rtl.css`, instead of the default
stylesheet. The supported right-to-left languages are Arabic (ar), Farsi (fa), and Hebrew (iw).

### Option 2: npm Module

Install FirebaseUI and its peer-dependency Firebase via npm using the following
commands:

```bash
$ npm install firebase firebaseui --save
```

You can then `import` the following modules within your source files:

```javascript
import firebase from 'firebase/compat/app';
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'
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
3. Sign-up and sign-in with email accounts (email/password and email link)
4. Password reset
5. Prevention of account duplication (activated when
*"One account per email address"* setting is enabled in the
[Firebase console](https://console.firebase.google.com). This setting is enabled
by default.)
6. Integration with
[one-tap sign-up](https://developers.google.com/identity/one-tap/web/)
7. Ability to upgrade anonymous users through sign-in/sign-up.
8. Sign-in as a guest

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
- [Anonymous](https://firebase.google.com/docs/auth/web/anonymous-auth#before_you_begin)
- [Email link](https://firebase.google.com/docs/auth/web/email-link-auth#before_you_begin)
- [Apple](https://firebase.google.com/docs/auth/web/apple)
- [Microsoft](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Yahoo](https://firebase.google.com/docs/auth/web/yahoo-oauth)

For [Google Cloud's Identity Platform (GCIP)](https://cloud.google.com/identity-cp/)
developers, you can also enable SAML and OIDC providers following the
instructions:

- [SAML](https://cloud.google.com/identity-cp/docs/how-to-enable-application-for-saml)
- [OIDC](https://cloud.google.com/identity-cp/docs/how-to-enable-application-for-oidc)

### Starting the sign-in flow

You first need to initialize your
[Firebase app](https://firebase.google.com/docs/web/setup). The
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
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-auth-compat.js"></script>
    <!-- *******************************************************************************************
       * TODO(DEVELOPER): Paste the initialization snippet from this dialog box:
       * Firebase Console > Project Settings > Add App > Web.
       ***************************************************************************************** -->
    <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
    <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
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
          firebase.auth.PhoneAuthProvider.PROVIDER_ID,
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: '<your-tos-url>',
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
          window.location.assign('<your-privacy-policy-url>');
        }
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

**This is only relevant for single page apps or apps where the sign-in UI is
rendered conditionally (e.g. button click)**

When redirecting back from Identity Providers like Google
and Facebook or email link sign-in, `start()` method needs to be called to
finish the sign-in flow.
If it requires a user interaction to start the initial sign-in process, you need
to check if there is a pending redirect operation going on on page load to check
whether `start()` needs to be called.

To check if there is a pending redirect operation to complete a sign-in attempt,
check `isPendingRedirect()` before deciding whether to render FirebaseUI
via `start()`.

```javascript
if (ui.isPendingRedirect()) {
  ui.start('#firebaseui-auth-container', uiConfig);
}
```

Here is how you would track the Auth state across all your pages:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-auth-compat.js"></script>
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
            user.getIdToken().then(function(accessToken) {
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
    <pre id="account-details"></pre>
  </body>
</html>

```

## Configuration

FirebaseUI supports the following configuration parameters.

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
<td>autoUpgradeAnonymousUsers</td>
<td>No</td>
<td>
  Whether to automatically upgrade existing anonymous users on sign-in/sign-up.
  See <a href="#upgrading-anonymous-users">Upgrading anonymous users</a>.
  <br/>
  <em>Default:</em>
  <code>false</code>
  When set to <code>true</code>, <code>signInFailure</code> callback is
  required to be provided to handle merge conflicts.
</td>
</tr>
<tr>
<td>callbacks</td>
<td>No</td>
<td>
  An object of developers <a href="#available-callbacks">callbacks</a> after
  specific events.
  <br/>
  <em>Default:</em> <code>{}</code>
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
  <code>firebaseui.auth.CredentialHelper.NONE</code>
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
<td>immediateFederatedRedirect</td>
<td>No</td>
<td>
  A boolean which determines whether to immediately redirect to the provider's
  site or instead show the default 'Sign in with Provider' button when there is
  only a single federated provider in <code>signInOptions</code>. In order for
  this option to take effect, the <code>signInOptions</code> must only hold a
  single federated provider (like 'google.com') and signInFlow must be set to
  'redirect'.
</td>
</tr>
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
<td>signInSuccessUrl</td>
<td>No</td>
<td>
  The URL where to redirect the user after a successful sign-in.
  <strong>Required</strong> when the <code>signInSuccessWithAuthResult</code>
  callback is not used or when it returns <code>true</code>.
</td>
</tr>
<tr>
<td>tosUrl</td>
<td>Yes</td>
<td>
  The URL of the Terms of Service page or a callback function to be invoked
  when Terms of Service link is clicked.
</td>
</tr>
<tr>
<td>privacyPolicyUrl</td>
<td>Yes</td>
<td>
  The URL of the Privacy Policy page or a callback function to be invoked
  when Privacy Policy link is clicked.
</td>
</tr>
<tr>
<td>adminRestrictedOperation</td>
<td>No</td>
<td>
  This setting is only applicable to "Google Cloud Identity Platform" projects.
  Learn more about [GCIP](https://cloud.google.com/identity-platform/).
  The object for configuring `adminRestrictedOperation` options, contains 3
  fields:
  `status(boolean)`: This flag should mirror the project user actions
  ("Enable create") settings. When sign-up is disabled in the project settings,
  this should be set to `true`. Setting this to `true` without disabling sign-up
  in the project settings will not have any effect. For GCIP projects, this is
  done by going to the "Settings" page in the "Identity Platform" section in the
  Cloud Console. Under the "USERS" tab, go to "User actions". Uncheck "Enable
  create (sign-up)" and click "SAVE".
  This does not enforce the policy but is rather useful for providing additional
  instructions to the end user when a user tries to create a new user account
  and the Auth server blocks the operation. This boolean works on all providers
  (federated, email/password, email link and phone number).
  `adminEmail(string|undefined)`: The optional site administrator email to
  contact for access when sign up is disabled, for example: `admin@example.com`.
  `helpLink(string|undefined)`: The optional help link to provide information
  on how to get access to the site when sign up is disabled. For example:
  `https://www.example.com/trouble_signing_in`.
</td>
</tr>
</tbody>
</table>

### Credential Helper

The role of a credential helper is to help your users sign into your website.
When one is enabled, your users will be prompted with email addresses and
usernames they have saved from your app or other applications.
FirebaseUI supports the one-tap sign-up credential helper. `accountchooser.com`
is no longer supported.

#### One-tap sign-up

[One-tap sign-up](https://developers.google.com/identity/one-tap/web/)
provides seamless authentication flows to
your users with Google's one tap sign-up and automatic sign-in APIs.
With one tap sign-up, users are prompted to create an account with a dialog
that's inline with FirebaseUI NASCAR screen. With just one tap, they get a
secure, token-based, passwordless account with your service, protected by their
Google Account. As the process is frictionless, users are much more likely to
register.
Returning users are signed in automatically, even when they switch devices or
platforms, or after their session expires.
One-tap sign-up integrates with FirebaseUI and if you request Google OAuth
scopes, you will still get back the expected Google OAuth access token even if
the user goes through the one-tap flow. However, in that case 'redirect' flow is
always used even when 'popup' is specified.
In addition, if you choose to force prompt for Google sign-in, one-tap auto
sign-in will be automatically disabled.
One-tap is an additive feature and is only supported in the latest evergreen
modern browser environments.
For more information on how to configure one-tap sign-up, refer to the
[one-tap get started guide](https://developers.google.com/identity/one-tap/web/guides/get-google-api-clientid).

The following example shows how to configure one-tap sign-up with FirebaseUI.
Along with the corresponding one-tap `credentialHelper`, the  Google OAuth
`clientId` has to be provided with the Firebase Google provider:

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      // Google provider must be enabled in Firebase Console to support one-tap
      // sign-up.
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      // Required to enable ID token credentials for this provider.
      // This can be obtained from the Credentials page of the Google APIs
      // console. Use the same OAuth client ID used for the Google provider
      // configured with GCIP or Firebase Auth.
      clientId: 'xxxxxxxxxxxxxxxxx.apps.googleusercontent.com'
    },
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
  ],
  // Required to enable one-tap sign-up credential helper.
  credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
});
// Auto sign-in for returning users is enabled by default except when prompt is
// not 'none' in the Google provider custom parameters. To manually disable:
ui.disableAutoSignIn();
```

Auto sign-in for returning users can be disabled by calling
`ui.disableAutoSignIn()`. This may be needed if the FirebaseUI sign-in page is
being rendered after the user signs out.

To see FirebaseUI in action with one-tap sign-up, check out the FirebaseUI
[demo app](https://fir-ui-demo-84a6c.firebaseapp.com/).

|Credential Helper                 |Value                                                 |
|----------------------------------|------------------------------------------------------|
|One-tap sign-up                   |`firebaseui.auth.CredentialHelper.GOOGLE_YOLO`        |
|None (disable)                    |`firebaseui.auth.CredentialHelper.NONE`               |

### Available providers

|Provider          |Value                                           |
|------------------|------------------------------------------------|
|Google            |`firebase.auth.GoogleAuthProvider.PROVIDER_ID`  |
|Facebook          |`firebase.auth.FacebookAuthProvider.PROVIDER_ID`|
|Twitter           |`firebase.auth.TwitterAuthProvider.PROVIDER_ID` |
|Github            |`firebase.auth.GithubAuthProvider.PROVIDER_ID`  |
|Email and password|`firebase.auth.EmailAuthProvider.PROVIDER_ID`   |
|Phone number      |`firebase.auth.PhoneAuthProvider.PROVIDER_ID`   |
|Anonymous         |`firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID`|
|Apple             |`apple.com`                                 |
|Microsoft         |`microsoft.com`                                 |
|Yahoo             |`yahoo.com`                                     |
|SAML (GCIP only)  |`saml.*********`                               |
|OIDC (GCIP only)  |`oidc.*********`                               |

### Configure OAuth providers

To specify custom scopes, or custom OAuth parameters per provider, you can pass
an object instead of just the provider value:

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      scopes: [
        'https://www.googleapis.com/auth/contacts.readonly'
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
    // Twitter does not support scopes.
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    // Other providers don't need to be given as object.
    firebase.auth.EmailAuthProvider.PROVIDER_ID
  ]
});
```

#### Generic OAuth provider

You can let your users authenticate with FirebaseUI using OAuth providers like
[Apple](https://firebase.google.com/docs/auth/web/apple),
[Microsoft Azure Active Directory](https://firebase.google.com/docs/auth/web/microsoft-oauth)
and [Yahoo](https://firebase.google.com/docs/auth/web/yahoo-oauth)
by integrating generic OAuth Login into your app.

You just need to pass the provider ID in `signInOptions`, FirebaseUI provides
the default configurations for the sign in button(button color, icon and display
name):

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    'apple.com',
    'microsoft.com',
    'yahoo.com',
  ]
});
```

You can also override these default configurations with your own custom ones.
Generic OAuth providers' `signInOptions` support the following configuration
parameters.

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
<td>provider</td>
<td>Yes</td>
<td>The provider ID, eg. <code>microsoft.com</code>.</td>
</tr>
<tr>
<td>providerName</td>
<td>No</td>
<td>
  The provider name displayed to end users (sign in button/linking prompt),
  eg. "Microsoft"
  <em>Default:</em>
  <code>provider ID</code>
</td>
</tr>
<tr>
<td>fullLabel</td>
<td>No</td>
<td>
  The full label of the button. Instead of "Sign in with $providerName", this
  button label will be used.
  <em>Default:</em>
  <code>Sign in with $providerName</code>
</td>
</tr>
<tr>
<td>buttonColor</td>
<td>No</td>
<td>
  The color of sign in button. The css of the button can be overwritten with
  the attribute/value in the HTML element:
  <code>data-provider-id="providerId"</code>
</td>
</tr>
<tr>
<td>iconUrl</td>
<td>No</td>
<td>
  The URL of the Identity Provider's icon. This will be displayed on the
  provider's sign-in button, etc.
</td>
</tr>
<tr>
<td>scopes</td>
<td>No</td>
<td>
  The list of additional OAuth 2.0 scopes beyond basic profile that you want to
  request from the authentication provider.
</td>
</tr>
<tr>
<td>customParameters</td>
<td>No</td>
<td>
  The list of additional custom OAuth parameters that you want to send with the
  OAuth request.
</td>
</tr>
<tr>
<td>loginHintKey</td>
<td>No</td>
<td>
  The key of the custom parameter, with which the login hint can be passed to
  the provider. This is useful in case a user previously signs up with an IdP
  like Microsoft and then tries to sign in with email using the same Microsoft
  email. FirebaseUI can then ask the user to sign in with that email to the
  already registered account with Microsoft. For Microsoft and Yahoo,
  this field is `login_hint`.
</td>
</tr>
</tbody>
</table>

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: 'microsoft.com',
      providerName: 'Microsoft',
      // To override the full label of the button.
      // fullLabel: 'Login with Microsoft',
      buttonColor: '#2F2F2F',
      iconUrl: '<icon-url-of-sign-in-button>',
      loginHintKey: 'login_hint',
      scopes: [
        'mail.read'
      ],
      customParameters: {
        prompt: 'consent'
      }
    }
  ]
});
```

### OpenID Connect (OIDC) providers (GCIP only)

For [GCIP](https://cloud.google.com/identity-cp) customers, you can enable your
app for
[OpenID Connect (OIDC)](https://cloud.google.com/identity-cp/docs/how-to-enable-application-for-oidc)
authentication with FirebaseUI.

OIDC providers' `signInOptions` support the following configuration parameters.

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
<td>provider</td>
<td>Yes</td>
<td>The provider ID, eg. <code>oidc.myProvider</code>.</td>
</tr>
<tr>
<td>providerName</td>
<td>No</td>
<td>
  The provider name displayed to end users (sign in button/linking prompt).
  <em>Default:</em>
  <code>provider ID</code>
</td>
</tr>
<tr>
<td>fullLabel</td>
<td>No</td>
<td>
  The full label of the button. Instead of "Sign in with $providerName", this
  button label will be used.
  <em>Default:</em>
  <code>Sign in with $providerName</code>
</td>
</tr>
<tr>
<td>buttonColor</td>
<td>Yes</td>
<td>
  The color of sign in button. The css of the button can be overwritten with
  attribute/value in the HTML element:
  <code>data-provider-id="providerId"</code>
</td>
</tr>
<tr>
<td>iconUrl</td>
<td>Yes</td>
<td>
  The URL of the Identity Provider's icon. This will be displayed on the
  provider's sign-in button, etc.
</td>
</tr>
<tr>
<td>customParameters</td>
<td>No</td>
<td>
  The list of additional custom parameters that the OIDC provider supports.
</td>
</tr>
</tbody>
</table>

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: 'oidc.myProvider',
      providerName: 'MyOIDCProvider',
      // To override the full label of the button.
      // fullLabel: 'Employee Login',
      buttonColor: '#2F2F2F',
      iconUrl: '<icon-url-of-sign-in-button>',
      customParameters: {
        OIDCSupportedParameter: 'value'
      }
    }
  ]
});
```

### SAML providers (GCIP only)

For [GCIP](https://cloud.google.com/identity-cp) customers, you can enable your
app for
[SAML](https://cloud.google.com/identity-cp/docs/how-to-enable-application-for-saml)
authentication with FirebaseUI.

SAML providers' `signInOptions` support the following configuration parameters.

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
<td>provider</td>
<td>Yes</td>
<td>The provider ID, eg. <code>saml.myProvider</code>.</td>
</tr>
<tr>
<td>providerName</td>
<td>No</td>
<td>
  The provider name displayed to end users (sign in button/linking prompt).
  <em>Default:</em>
  <code>provider ID</code>
</td>
</tr>
<tr>
<td>fullLabel</td>
<td>No</td>
<td>
  The full label of the button. Instead of "Sign in with $providerName", this
  button label will be used.
  <em>Default:</em>
  <code>Sign in with $providerName</code>
</td>
</tr>
<tr>
<td>buttonColor</td>
<td>Yes</td>
<td>
  The color of sign in button. The css of the button can be overwritten with
  attribute/value in the HTML element:
  <code>data-provider-id="providerId"</code>
</td>
</tr>
<tr>
<td>iconUrl</td>
<td>Yes</td>
<td>
  The URL of the Identity Provider's icon. This will be displayed on the
  provider's sign-in button, etc.
</td>
</tr>
</tbody>
</table>

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: 'saml.myProvider',
      providerName: 'MySAMLProvider',
      // To override the full label of the button.
      // fullLabel: 'Constractor Portal',
      buttonColor: '#2F2F2F',
      iconUrl: '<icon-url-of-sign-in-button>'
    }
  ]
});
```

### Configure Email Provider

You can configure either email/password or email/link sign-in with FirebaseUI by
providing the relevant object in the configuration <code>signInOptions</code>
array.

You can disable new user sign up with email providers by setting the flag
`disableSignUp.status` to `true`. This will display an error message when new
users attempt to sign up.

Note that this flag will only disable sign up from the UI and will not prevent
sign up via REST API. It is highly recommended that Identity Platform projects
enforce this policy via one of these 2 mechanisms:

- Blocking functions: Set a `beforeCreate` trigger to disable sign up for email
  providers.
- In the Cloud Console / Settings / USERS tab, uncheck `Enable create (sign-up)`
  checkbox. Though for this setting, sign up for all providers will be disabled.

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Required</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>provider</td>
<td>string</td>
<td>Yes</td>
<td>
  For email sign-in, this should be
  <code>firebase.auth.EmailAuthProvider.PROVIDER_ID</code>.
</td>
</tr>
<tr>
<td>requireDisplayName</td>
<td>boolean</td>
<td>No</td>
<td>
  Defines whether to require the user to provide a display name during email
  and password sign up.
  <br/>
  <em>Default:</em> <code>true</code>
</td>
</tr>
<tr>
<td>signInMethod</td>
<td>string</td>
<td>No</td>
<td>
  Defines whether to use email and password or email link authentication.
  This should be
  <code>firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD</code>
  for email and password sign-in,
  <code>firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD</code> for
  email link authentication.
  <br/>
  <em>Default:</em>
  <code>firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD</code>
</td>
</tr>
<tr>
<td>forceSameDevice</td>
<td>boolean</td>
<td>No</td>
<td>
  Whether to force same device flow. If false, opening the link on a different
  device will display a message instructing the user to open the link on the
  same device or browser. This should be true when used with
  anonymous user upgrade flows. This is only relevant to email link sign-in.
  <em>Default:</em> <code>false</code>
</td>
</tr>
<tr>
<td>emailLinkSignIn</td>
<td>function</td>
<td>No</td>
<td>
  Defines the optional callback function to return
  <code>firebase.auth.ActionCodeSettings</code> configuration to use when
  sending the link. This provides the ability to specify how the link can be
  handled, custom dynamic link, additional state in the deep link, etc.
  When not provided, the current URL is used and a web only flow is triggered.
  This is only relevant to email link sign-in.
</td>
</tr>
<tr>
<td>disableSignUp</td>
<td><code>firebaseui.auth.DisableSignUpConfig</code></td>
<td>No</td>
<td>
  The object for configuring `disableSignUp` options, contains 3 fields:
  `status(boolean)`: Whether disable user from signing up with email providers
  (email/password or email link).
  `adminEmail(string|undefined)`: The optional site administrator email to
  contact for access when sign up is disabled, for example: `admin@example.com`.
  `helpLink(string|undefined)`: The optional help link to provide information
  on how to get access to the site when sign up is disabled. For example:
  `https://www.example.com/trouble_signing_in`.
</td>
</tr>
</tbody>
</table>

#### Email and Password

Email and password authentication is the default sign-in method for Email
providers.
The `EmailAuthProvider` with email and password can be configured to require the
user to enter a display name (defaults to `true`).

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      requireDisplayName: false
    }
  ]
});
```

#### Email Link Authentication

FirebaseUI supports sign-in and sign-up with email links.
Using email link sign-in with FirebaseUI comes with the following benefits:

- End to end support for email link sign-in with only a few configuration lines.
- Enforces security and privacy best practices.
- Ability to force same device flows or allow cross device flows where a user
  can start the flow on one device and end it on another. This also covers
  Android where email link sign-in is also supported with
  [FirebaseUI-android](https://github.com/firebase/firebaseui-android/) and
  [FirebaseUI-ios](https://github.com/firebase/firebaseui-ios/)
  for iOS support.
- Ability to switch to email link sign-in while continuing to sign-in existing
  users with email and password.
- Ability to support account linking, where an existing email link user signing
  in with Facebook for the first time using the same email will have
  both accounts merged so they can sign in with either (Facebook or email link)
  going forward.
- Ability to support anonymous user upgrade as long as the flow starts and ends
  on the same device. Users opening the link on a different device will be
  notified to open the link on the same device where the flow started.


The sample code below demonstrates how to configure email link sign-in with
FirebaseUI. In this example, cross device flows are allowed and additional state
is passed in the URL, as well as the ability to configure the link to open via
mobile application too.

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
      // Use email link authentication and do not require password.
      // Note this setting affects new users only.
      // For pre-existing users, they will still be prompted to provide their
      // passwords on sign-in.
      signInMethod: firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD,
      // Allow the user the ability to complete sign-in cross device, including
      // the mobile apps specified in the ActionCodeSettings object below.
      forceSameDevice: false,
      // Used to define the optional firebase.auth.ActionCodeSettings if
      // additional state needs to be passed along request and whether to open
      // the link in a mobile app if it is installed.
      emailLinkSignIn: function() {
        return {
          // Additional state showPromo=1234 can be retrieved from URL on
          // sign-in completion in signInSuccess callback by checking
          // window.location.href.
          // If you are using a fragment in the URL, additional FirebaseUI
          // parameters will be appended to the query string component instead
          // of the fragment.
          // So for a url: https://www.example.com/#/signin
          // The completion URL will take the form:
          // https://www.example.com/?uid_sid=xyz&ui_sd=0#/signin
          // This should be taken into account when using frameworks with "hash
          // routing".
          url: 'https://www.example.com/completeSignIn?showPromo=1234',
          // Custom FDL domain.
          dynamicLinkDomain: 'example.page.link',
          // Always true for email link sign-in.
          handleCodeInApp: true,
          // Whether to handle link in iOS app if installed.
          iOS: {
            bundleId: 'com.example.ios'
          },
          // Whether to handle link in Android app if opened in an Android
          // device.
          android: {
            packageName: 'com.example.android',
            installApp: true,
            minimumVersion: '12'
          }
        };
      }
    }
  ]
});
```

When rendering the sign-in UI conditionally (relevant for single page apps),
use `ui.isPendingRedirect()` to detect if the URL corresponds to a sign-in with
email link and the UI needs to be rendered to complete sign-in.
You can also just use
[firebase.auth().isSignInWithEmailLink(window.location.href)](https://firebase.google.com/docs/reference/js/firebase.auth.Auth#isSignInWithEmailLink).

```javascript
// Is there an email link sign-in?
if (ui.isPendingRedirect()) {
  ui.start('#firebaseui-auth-container', uiConfig);
}
// This can also be done via:
if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
  ui.start('#firebaseui-auth-container', uiConfig);
}
```

Additional state passed in the <code>url</code> can be retrieved on sign-in
completion via the signInSuccess callbacks.

If you are using a fragment in the URL, additional FirebaseUI parameters will be
appended to the query string component instead of the fragment.
So for a url `https://www.example.com/#/signin`, the completion URL will take
the form `https://www.example.com/?uid_sid=xyz&ui_sd=0#/signin`.
This should be taken into account when using frameworks with "hash routing".

```javascript
// ...
signInSuccessWithAuthResult: function(authResult, redirectUrl) {
  // If a user signed in with email link, ?showPromo=1234 can be obtained from
  // window.location.href.
  // ...
  return false;
}
```

FirebaseUI uses the
[history API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) to
clear the URL from query parameters related to email link sign-in after the
one-time code is processed. This prevents the user from re-triggering the
sign-in completion flow again on page reload or if the user signs out and tries
to sign in again in a single page application, etc.

When same device flows are not enforced, a user going through account linking
flow (eg. user signing in with Facebook with an email that belongs to an
existing email link user) opening the link on a different device would be given
the choice to continue sign-in with email link without merging the Facebook
credential or instructed to open the link on the same device where the flow was
initiated to successfully merge both accounts.

You cannot use email/password and email/link sign-in at the same time. Only one
mode can be configured at a time. However, if you previously signed up users
with passwords. Switching to email/link will only apply to new users and
existing password users will continue to be prompted for password on sign-in.

### Configure Phone Provider

The `PhoneAuthProvider` can be configured with custom reCAPTCHA parameters
whether reCAPTCHA is visible or invisible (defaults to `normal`). Refer to the
[reCAPTCHA API docs](https://developers.google.com/recaptcha/docs/display) for
more details.

The default country to select in the phone number input can also be set.
[List of supported country codes](javascript/data/README.md). If unspecified,
the phone number input will default to the United States (+1).

The countries to select can also be configured with `blacklistedCountries` or
`whitelistedCountries`. It accepts either ISO (alpha-2) or E164
(prefix with '+') formatted country code. Invalid country code will be ignored.
`whitelistedCountries` and `blacklistedCountries` cannot be specified at the
same time.

The following options are currently supported. Any other
parameters will be ignored.

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
      recaptchaParameters: {
        type: 'image', // 'audio'
        size: 'normal', // 'invisible' or 'compact'
        badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
      },
      defaultCountry: 'GB', // Set default country to the United Kingdom (+44).
      // For prefilling the national number, set defaultNationNumber.
      // This will only be observed if only phone Auth provider is used since
      // for multiple providers, the NASCAR screen will always render first
      // with a 'sign in with phone number' button.
      defaultNationalNumber: '1234567890',
      // You can also pass the full phone number string instead of the
      // 'defaultCountry' and 'defaultNationalNumber'. However, in this case,
      // the first country ID that matches the country code will be used to
      // populate the country selector. So for countries that share the same
      // country code, the selected country may not be the expected one.
      // In that case, pass the 'defaultCountry' instead to ensure the exact
      // country is selected. The 'defaultCountry' and 'defaultNationaNumber'
      // will always have higher priority than 'loginHint' which will be ignored
      // in their favor. In this case, the default country will be 'GB' even
      // though 'loginHint' specified the country code as '+1'.
      loginHint: '+11234567890',
      // You can provide a 'whitelistedCountries' or 'blacklistedCountries' for
      // countries to select. It takes an array of either ISO (alpha-2) or
      // E164 (prefix with '+') formatted country codes. If 'defaultCountry' is
      // not whitelisted or is blacklisted, the default country will be set to
      // the first country available (alphabetical order). Notice that
      // 'whitelistedCountries' and 'blacklistedCountries' cannot be specified
      // at the same time.
      whitelistedCountries: ['US', '+44']
    }
  ]
});
```

### Configure Anonymous Provider

The `AnonymousAuthProvider` can be enabled to let users continue as a guest. If
a user is already signed in anonymously, clicking this sign-in option will keep
the same current anonymous user. In addition, when auto-upgrade for anonymous
users is enabled in addition to this option and a user is already signed in
anonymously, clicking this sign-in option will also keep the same current
anonymous user.

```javascript
ui.start('#firebaseui-auth-container', {
  signInOptions: [
    {
      provider: firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
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

#### `signInSuccessWithAuthResult(authResult, redirectUrl)`

The `signInSuccessWithAuthResult` callback is invoked when user signs in
successfully.
The authResult provided here is a `firebaseui.auth.AuthResult` object, which
includes the current logged in user, the credential used to sign in the user,
additional user info indicating if the user is new or existing and operation
type like 'signIn' or 'link'. This callback will replace `signInSuccess` in
future.

**Parameters:**

|Name         |Type                          | Optional|Description                                                                                                                                                              |
|-------------|------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`authResult`|`firebaseui.auth.AuthResult`   |No       |The AuthResult of successful sign-in operation. The AuthResult object has same signature as `firebase.auth.UserCredential`.|
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

#### `signInSuccess(currentUser, credential, redirectUrl)`

This callback will be deprecated and will be replaced by
`signInSuccessWithAuthResult` which takes `firebaseui.auth.AuthResult`.

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

#### `signInFailure(error)`

The `signInFailure` callback is provided to handle any unrecoverable error
encountered during the sign-in process.
The error provided here is a `firebaseui.auth.AuthUIError` error with the
following properties.

**firebaseui.auth.AuthUIError properties:**

|Name     |Type            |Optional |Description            |
|---------|----------------|---------|-----------------------|
|`code`   |`string`        |No       |The corresponding error code. Currently the only error code supported is `firebaseui/anonymous-upgrade-merge-conflict`   |
|`credential` |`firebase.auth.AuthCredential`|Yes      |The existing non-anonymous user credential the user tried to sign in with.|

**Should return: `Promise<void>|void`**

FirebaseUI will wait for the returned promise to handle the reported error
before clearing the UI. If no promise is returned, the UI will be cleared on
completion. Even when this callback resolves, `signInSuccessWithAuthResult`
callback will not be triggered.

This callback is required when `autoUpgradeAnonymousUsers` is enabled.

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
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-auth-compat.js"></script>
    <!-- *******************************************************************************************
       * TODO(DEVELOPER): Paste the initialization snippet from:
       * Firebase Console > Overview > Add Firebase to your web app. *
       ***************************************************************************************** -->
    <script src="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.js"></script>
    <link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/6.0.1/firebase-ui-auth.css" />
    <script type="text/javascript">
      // FirebaseUI config.
      var uiConfig = {
        callbacks: {
          signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            var user = authResult.user;
            var credential = authResult.credential;
            var isNewUser = authResult.additionalUserInfo.isNewUser;
            var providerId = authResult.additionalUserInfo.providerId;
            var operationType = authResult.operationType;
            // Do something with the returned AuthResult.
            // Return type determines whether we continue the redirect
            // automatically or whether we leave that to developer to handle.
            return true;
          },
          signInFailure: function(error) {
            // Some unrecoverable error occurred during sign-in.
            // Return a promise when error handling is completed and FirebaseUI
            // will reset, clearing any UI. This commonly occurs for error code
            // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
            // occurs. Check below for more details on this.
            return handleUIError(error);
          },
          uiShown: function() {
            // The widget is rendered.
            // Hide the loader.
            document.getElementById('loader').style.display = 'none';
          }
        },
        credentialHelper: firebaseui.auth.CredentialHelper.NONE,
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
          },
          firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
        ],
        // Set to true if you only have a single federated provider like
        // firebase.auth.GoogleAuthProvider.PROVIDER_ID and you would like to
        // immediately redirect to the provider's site instead of showing a
        // 'Sign in with Provider' button first. In order for this to take
        // effect, the signInFlow option must also be set to 'redirect'.
        immediateFederatedRedirect: false,
        // tosUrl and privacyPolicyUrl accept either url string or a callback
        // function.
        // Terms of service url/callback.
        tosUrl: '<your-tos-url>',
        // Privacy policy url/callback.
        privacyPolicyUrl: function() {
          window.location.assign('<your-privacy-policy-url>');
        }
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

### Upgrading anonymous users

#### Enabling anonymous user upgrade

When an anonymous user signs in or signs up with a permanent account, you want
to be sure the user can continue with what they were doing before signing up.
For example, an anonymous user might have items in their shopping cart.
At check-out, you prompt the user to sign in or sign up. After the user is
signed in, the user's shopping cart should contain any items the user added
while signed in anonymously.

To support this behavior, FirebaseUI makes it easy to "upgrade" an anonymous
account to a permanent account. To do so, simply set `autoUpgradeAnonymousUsers`
to `true` when you configure the sign-in UI (this option is disabled by
default).

FirebaseUI links the new credential with the anonymous account using Firebase
Auth's `linkWithCredential` method:
```javascript
anonymousUser.linkWithCredential(permanentCredential);
```
The user will retain the same `uid` at the end of the flow and all data keyed
on that identifier would still be associated with that same user.

Anonymous user upgrade is also supported by email link sign-in in FirebaseUI.
An anonymous user triggering the email link option will, on return from clicking
the link, upgrade to an email link user.
However, `forceSameDevice` must be set to `true` in the email `signInOption`.
This is to ensure that when the user clicks the link, it is opened on the same
device/browser where the initial anonymous user exists.

#### Handling anonymous user upgrade merge conflicts

There are cases when a user, initially signed in anonymously, tries to
upgrade to an existing Firebase user. For example, a user may have signed up
with a Google credential on another device. When trying to upgrade to the
existing Google user, an error `auth/credential-already-in-use` will be thrown
by Firebase Auth as an existing user cannot be linked to another existing user.
No two users can share the same credential. In that case, both user data
have to be merged before one user is discarded (typically the anonymous user).
In the case above, the anonymous user shopping cart will be copied locally,
the anonymous user will be deleted and then the user is signed in with the
permanent credential. The anonymous user data in temporary storage will be
copied back to the non-anonymous user.

FirebaseUI will trigger the `signInFailure` callback with an error code
`firebaseui/anonymous-upgrade-merge-conflict` when the above occurs. The error
object will also contain the permanent credential.
Sign-in with the permanent credential should be triggered in the callback to
complete sign-in.
Before sign-in can be completed via
`auth.signInWithCredential(error.credential)`, the data of the anonymous user
must be copied and the anonymous user deleted. After sign-in completion, the
data has to be copied back to the non-anonymous user. An example below
illustrates how this flow would work if user data is persisted using Firebase
Realtime Database.

**Example:**

```javascript
// Temp variable to hold the anonymous user data if needed.
var data = null;
// Hold a reference to the anonymous current user.
var anonymousUser = firebase.auth().currentUser;
ui.start('#firebaseui-auth-container', {
  // Whether to upgrade anonymous users should be explicitly provided.
  // The user must already be signed in anonymously before FirebaseUI is
  // rendered.
  autoUpgradeAnonymousUsers: true,
  signInSuccessUrl: '<url-to-redirect-to-on-success>',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
      // Process result. This will not trigger on merge conflicts.
      // On success redirect to signInSuccessUrl.
      return true;
    },
    // signInFailure callback must be provided to handle merge conflicts which
    // occur when an existing credential is linked to an anonymous user.
    signInFailure: function(error) {
      // For merge conflicts, the error.code will be
      // 'firebaseui/anonymous-upgrade-merge-conflict'.
      if (error.code != 'firebaseui/anonymous-upgrade-merge-conflict') {
        return Promise.resolve();
      }
      // The credential the user tried to sign in with.
      var cred = error.credential;
      // If using Firebase Realtime Database. The anonymous user data has to be
      // copied to the non-anonymous user.
      var app = firebase.app();
      // Save anonymous user data first.
      return app.database().ref('users/' + firebase.auth().currentUser.uid)
          .once('value')
          .then(function(snapshot) {
            data = snapshot.val();
            // This will trigger onAuthStateChanged listener which
            // could trigger a redirect to another page.
            // Ensure the upgrade flow is not interrupted by that callback
            // and that this is given enough time to complete before
            // redirection.
            return firebase.auth().signInWithCredential(cred);
          })
          .then(function(user) {
            // Original Anonymous Auth instance now has the new user.
            return app.database().ref('users/' + user.uid).set(data);
          })
          .then(function() {
            // Delete anonymnous user.
            return anonymousUser.delete();
          }).then(function() {
            // Clear data in case a new user signs in, and the state change
            // triggers.
            data = null;
            // FirebaseUI will reset and the UI cleared when this promise
            // resolves.
            // signInSuccessWithAuthResult will not run. Successful sign-in
            // logic has to be run explicitly.
            window.location.assign('<url-to-redirect-to-on-success>');
          });

    }
  }
});
```

### Multi-tenancy support

For [GCIP](https://cloud.google.com/identity-platform) customers, you can build
a tenant-specific sign-in page with FirebaseUI. Make sure you've enabled
multi-tenancy for your project and configured your tenants. See the
[Multi-tenancy quickstart](https://cloud.google.com/identity-platform/docs/multi-tenancy-quickstart)
to learn how.

This feature requires [firebase](https://www.npmjs.com/package/firebase)
version 6.6.0 or higher.


To use FirebaseUI with multi-tenancy, you need to set the tenant ID on the
Auth instance being passed to FirebaseUI before calling `ui.start()`.

```javascript
// The Firebase Auth instance.
var auth = firebase.auth();
// Initialize FirebaseUI.
var ui = new firebaseui.auth.AuthUI(auth);
// Set the tenant ID on Auth instance.
auth.tenantId = selectedTenantId;
// Start the sign-in flow in selected tenant.
// All sign-in attempts will now use this tenant ID.
ui.start('#firebaseui-auth-container', selectedTenantConfig);
```

FirebaseUI only handles the sign-in flows for you, you will still need to build
your own UI to let the end users select a tenant to sign in with.
You can refer to the example in this
[guide](https://cloud.google.com/identity-platform/docs/multi-tenancy-ui).

There is also a
[quickstart](https://cloud.google.com/identity-platform/docs/multi-tenancy-quickstart)
app available to demonstrate how to build a single sign-in page with the
FirebaseUI for two tenants which have different sets of identity providers
enabled.


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
When passing the redirect URL this way, the `signInSuccessWithAuthResult`
callback will receive the value as the `redirectUrl` argument.

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
- Java SE Runtime Environment 8

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

To build a localized JavaScript binary, run:
```bash
npm run build build-js-{LANGUAGE_CODE}
```
where `{LANGUAGE_CODE}` is replaced by the
[code of the language you want](LANGUAGES.md). For example, the French binary
can be built with `npm run build build-js-fr`. This will create a binary
`firebaseui__fr.js` in the `dist/` folder.

Build names for language codes with underscores, eg. `zh_tw`, `zh_cn`, `pt_pt`
will be mapped to `zh-TW`, `xh-CN`, `pt-PT`. The underscore will be replaced by
a hyphen symbol and the subsequent characters will be capitalized.

```bash
npm run build build-js-zh-TW
```

This will create a binary `firebaseui__zh_tw.js` in the `dist/` folder.

To build a localized npm FirebaseUI module, run:

```bash
npm run build build-npm-{LANGUAGE_CODE}
```

Make sure all underscore symbols in the `LANGUAGE_CODE` are replaced with
dashes.
This will generate `dist/npm__{LANGUAGE_CODE}.js`.
You can then import/require it:
```javascript
import firebaseui from './npm__{LANGUAGE_CODE}';
```

Build names for language codes with underscores, eg. `zh_tw`, `zh_cn`, `pt_pt`
will be mapped to `zh-TW`, `xh-CN`, `pt-PT`. The underscore will be replaced by
a hyphen symbol and the subsequent characters will be capitalized.

```bash
npm run build build-npm-zh-TW
```

This will create a binary `npm__zh_tw.js` in the `dist/` folder.

To build a localized ES module of FirebaseUI, run:

```bash
npm run build build-esm-{LANGUAGE_CODE}
```

Make sure all underscore symbols in the `LANGUAGE_CODE` are replaced with
dashes.
This will generate `dist/esm__{LANGUAGE_CODE}.js`.
You can then import/require it:
```javascript
import firebaseui from './esm__{LANGUAGE_CODE}';
```

Build names for language codes with underscores, eg. `zh_tw`, `zh_cn`, `pt_pt`
will be mapped to `zh-TW`, `xh-CN`, `pt-PT`. The underscore will be replaced by
a hyphen symbol and the subsequent characters will be capitalized.

```bash
npm run build build-esm-zh-TW
```

This will create a binary `esm__zh_tw.js` in the `dist/` folder.

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

## IAP External Identities Support with FirebaseUI

You can use FirebaseUI to build the authentication page to use external
identities with
[Google Cloud IAP](https://cloud.google.com/iap/docs/external-identities).
The documentation can be found [here](firebaseuihandler/README.md).

## Cordova Setup

### Introduction

FirebaseUI sign-in widget supports Cordova applications. This includes
email/password and all OAuth providers (Google, Facebook, Twitter and GitHub).
Phone authentication is not supported due to the limitation in the underlying
Firebase core SDK.
Email link authentication is not yet supported due to the inability to detect
the incoming link when the user clicks it to complete sign-in.

### Available providers

|Provider          |Value                                           |
|------------------|------------------------------------------------|
|Google            |`firebase.auth.GoogleAuthProvider.PROVIDER_ID`  |
|Facebook          |`firebase.auth.FacebookAuthProvider.PROVIDER_ID`|
|Twitter           |`firebase.auth.TwitterAuthProvider.PROVIDER_ID` |
|Github            |`firebase.auth.GithubAuthProvider.PROVIDER_ID`  |
|Email and password|`firebase.auth.EmailAuthProvider.PROVIDER_ID`   |
|Anonymous         |`firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID`|
|Microsoft         |`microsoft.com`                                |
|Yahoo             |`yahoo.com`                                     |
|SAML (GCIP only)  |`saml.*********`                               |
|OIDC (GCIP only)  |`oidc.*********`                               |

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
- If you are providing a `Content-Security-Policy` make sure you add the
  appropriate exceptions for FirebaseUI resources (`style-src`, `media-src`,
  `img-src`, `script-src`, etc.) and underlying Firebase JS SDK.

## React DOM Setup

In React DOM applications you can use the [FirebaseUI Web React Wrapper](https://github.com/firebase/firebaseui-web-react).

## Angular Setup

In Angular applications you can use this [FirebaseUI Web Angular Wrapper](https://github.com/RaphaelJenni/firebaseui-angular) from the community.

## Known issues

### Firebase Auth does not work in Safari private browsing

When a user has enabled the private browsing mode in Safari, the web storage is
disabled. This currently results in an error being thrown upon Firebase Auth
initialization. Therefore, when following the snippets above, FirebaseUI will
never get initialized and no UI will be displayed.

### Tips for Single Page apps (`UI Widget is already rendered on the page`
warning)

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

### Tips for initializing a new UI instance with the same Auth instance

When trying to initialize a new UI widget with the same Auth instance, you will
get an `app/duplicate-app` error. In general, you should keep a reference to
the AuthUI instance and instead call `reset()` and then `start(...)` again to
re-render the widget.

If you don't keep a reference to that AuthUI instance, you can get the reference
by calling `firebaseui.auth.AuthUI.getInstance(appId)` where `appId` is the same
as the optional one used to initialize the AuthUI instance. If none was provided
just call `firebaseui.auth.AuthUI.getInstance()`.

This is the recommended way but you also have the option to delete the AuthUI
instance by calling `ui.delete()` which returns a promise that resolves on
successful deletion. You can then initialize a new UI instance with the same
Auth instance without getting the `app/duplicate-app` error. At any time, you
can only have one AuthUI instance with the same `appId` or the same Auth
instance.


### FirebaseUI is broken in IE11 when deployed on a local server accessed
through `localhost` (but works when deployed on a remote server)

Several developers reported issues with IE11 when testing the widget integration
on a server deployed locally, accessing the application through a `localhost`
address. However, it doesn't impact applications deployed on a server (as you
can verify in the [demo app](https://fir-ui-demo-84a6c.firebaseapp.com/)).

## Release Notes

**Latest**: https://github.com/firebase/firebaseui-web/releases/latest

**For v1.0.0 and superior:** https://github.com/firebase/firebaseui-web/releases

### 6.0.0

FirebaseUI-web v6.0.0 is intended to be used alongside Firebase JS SDK v9 compat.

If using the CDN, change your Firebase imports to:

```html
<script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.1.3/firebase-auth-compat.js"></script>
```

If NPM:

```ts
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
```

[See the Firebase upgrade guide for more information.](https://firebase.google.com/docs/web/modular-upgrade)

### 5.0.0

`accountchooser.com` has been operating in "universal opt-out" mode and was
shutdown on July 2021. FirebaseUI-web has stopped supporting this credential
helper and since version v5.0.0, all related configurations and enums have been
removed.

- If you are using `firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM`,
  you need to switch to `firebaseui.auth.CredentialHelper.NONE` or
  `firebaseui.auth.CredentialHelper.GOOGLE_YOLO`. Follow the instruction on
  [one-tap sign-up](#one-tap-sign-up) when switching to the latter.
- If you are configuring `acUiConfig` in the UI configurations, this is no
  longer supported and should not be used.
- `firebaseui.auth.FederatedSignInOption#authMethod` is no longer required to
  be provided by the latest
  [one-tap API](https://developers.google.com/identity/one-tap/web/reference/js-reference).

### 0.5.0

See the milestone [0.5.0](https://github.com/firebase/firebaseui-web/milestone/1)
for the issues covered in this release. Below is a summary of the most important
ones:

- FirebaseUI now supports **Single Page Application**: a `reset` method was
  added to allow to dispose of the widget. When the user leaves a page where the
  FirebaseUI widget was rendered (for instance in the `componentWillUnmount`
  method of a React component), call the `reset` method of the
  `firebaseui.auth.AuthUI` instance you created. Also, call the `reset` method
  before rendering again the widget if one has already been rendered on the
  page. Please refer to the [demo app](demo/) for guidance on how to use
  FirebaseUI in a Single Page Application context.
- **Custom scopes** can now be added for each provider. See
  [Configure OAuth providers](configure-oauth-providers).
- Several issues, different but related to the `displayName` not being present
  after sign up with email and password, have been fixed.
- A new config parameter has been added: `signInFlow`. It allows to specify
  whether the Identity Providers sign in flows should be done through `redirect`
  (the default) or `popup`. See [Sign In Flows](sign-in-flows).

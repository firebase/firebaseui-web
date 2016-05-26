# FirebaseUI for Web — Auth

FirebaseUI is an open-source JavaScript library for Web that provides simple, customizable UI
bindings on top of [Firebase](https://firebase.google.com) SDKs to eliminate boilerplate code and
promote best practices.

FirebaseUI Auth provides a drop-in auth solution that handles the UI flows for signing in users with
email addresses and passwords, and Identity Provider Sign In using Google, Facebook and others.
It is built on top of [Firebase Auth](https://firebase.google.com/docs/auth).

The FirebaseUI component implements best practices for authentication on mobile devices and
websites, helping to sign-in and sign-up conversion for your app. It also handles cases like account
recovery and account linking that can be security sensitive and error-prone to handle.

FirebaseUI Auth clients are also available for [iOS](https://github.com/firebase/firebaseui-ios) and
[Android](https://github.com/firebase/firebaseui-android).

## Table of Contents

1. [Installation](#installation)
2. [Usage instructions](#using-firebaseui-for-authentication)
3. [Configuration](#configuration)
4. [Customization](#customizing-firebaseui-for-authentication)
5. [Advanced](#advanced)

## Installation

You just need to include the following code in the `<head>` tag of your page:

```html
<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/live/3.0/firebase-auth.js"></script>
<script src="https://www.gstatic.com/firebasejs/ui/0.4.0/firebase-ui-auth.js"></script>
<link type="text/css" rel="stylesheet" href="https://www.gstatic.com/firebasejs/ui/0.4.0/firebase-ui-auth.css" />
```

## Using FirebaseUI for Authentication

FirebaseUI includes the following flows:

1. Interaction with Identity Providers such as Google and Facebook
2. Sign-up and sign-in with email accounts
3. Password reset
4. Prevention of account duplication (activated when *"One account per email adress"* setting is
enabled in the [Firebase console](https://console.firebase.google.com). This setting is enabled by
default.)
5. [Account Chooser](https://www.accountchooser.com/learnmore.html?lang=en) for remembering emails

### Configuring sign-in providers

To use FirebaseUI to authenticate users you first need to configure each provider you want to use in
their own developer app settings. Please read the *Before you begin* section of Firebase
Authentication at the following links:

- [Email and password](https://firebase.google.com/docs/auth/web/password-auth#before_you_begin)
- [Google](https://firebase.google.com/docs/auth/web/google-signin#before_you_begin)
- [Facebook](https://firebase.google.com/docs/auth/web/facebook-login#before_you_begin)
- [Twitter](https://firebase.google.com/docs/auth/web/twitter-login#before_you_begin)
- [Github](https://firebase.google.com/docs/auth/web/github-auth#before_you_begin)

### Starting the sign-in flow

You first need to initialize your
[Firebase app](https://firebase.google.com/docs/web/setup#prerequisites). The `firebase.auth.Auth`
instance should be passed to the constructor of `firebaseui.auth.AuthUI`. You can then call the
`start` method with the CSS selector that determines where to create the widget, and a configuration
object.

The following example shows how to set up a sign-in screen with all supported providers.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <script src="firebase-app.js"></script>
    <script src="firebase-auth.js"></script>
    <script src="firebase-ui-auth.js"></script>
    <script type="text/javascript">
      // Firebase config.
      var config = {
        'authDomain': '<your-firebase-project-domain>.firebaseapp.com',
        'apiKey': '<your-API-key>',
      };

      // FirebaseUI config.
      var uiConfig = {
        'signInSuccessUrl': '<url-to-redirect-to-on-success>',
        'signInOptions': [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.GithubAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        'tosUrl': '<your-tos-url>',
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var app = firebase.initializeApp(config);
      var auth = app.auth();
      var ui = new firebaseui.auth.AuthUI(auth);
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    </script>
    <link type="text/css" rel="stylesheet" href="firebase-ui-auth.css" />
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
    <script src="firebase-app.js"></script>
    <script src="firebase-auth.js"></script>
    <script type="text/javascript">
      // Firebase config.
      var config = {
        'authDomain': '<your-firebase-project-domain>.firebaseapp.com',
        'apiKey': '<your-API-key>',
      };

      // Instantiates the Firebase Auth instance.
      var app = firebase.initializeApp(config);
      var auth = app.auth();

      initApp = function() {
        auth.onAuthStateChanged(function(user) {
          if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var providerData = user.providerData;
            user.getToken().then(function(accessToken) {
              document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
              document.getElementById('quickstart-sign-in').textContent = 'Sign out';
              document.getElementById('quickstart-account-details').textContent = JSON.stringify({
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                photoURL: photoURL,
                uid: uid,
                accessToken: accessToken,
                providerData: providerData
              }, null, '  ');
            });
          } else {
            // User is signed out.
            document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
            document.getElementById('quickstart-sign-in').textContent = 'Sign in';
            document.getElementById('quickstart-account-details').textContent = 'null';
          }
        }, function(error) {
          console.log(error);
        });
      };

      window.onload = function() {
        initApp()
      };
    </script>
  </head>
  <body>
    <h1>Welcome to My Awesome App</h1>
    <div id="quickstart-sign-in-status"></div>
    <div id="quickstart-sign-in"></div>
    <div id="quickstart-account-details"></div>
  </body>
</html>

```

## Configuration

FirebaseUI supports the following configuration parameters.

|Name                             |Required|Default             |Description                                                                                                                                                                               |
|---------------------------------|--------|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|callbacks                        |No      |`[]`                |A list of developers [callbacks](#available-callbacks) after specific events.                                                                                                             |
|queryParameterForSignInSuccessUrl|No      |`"signInSuccessUrl"`|The redirect URL parameter name for the sign-in success URL. See [Overwriting the sign-in success URL](#overwriting-the-sign-in-success-url).                                             |
|queryParameterForWidgetMode      |No      |`"mode"`            |The redirect URL parameter name for the “mode” of the Widget. See [FirebaseUI widget modes](#firebaseui-widget-modes).                                                                    |
|signInOptions                    |Yes     |-                   |The list of [providers](#available-providers) enabled for signing into your app. The order you specify them will be the order they are displayed on the sign-in provider selection screen.|
|signInSuccessUrl                 |No      |-                   |The URL where to redirect the user after a successful sign-in. **Required** when the `signInSuccess` callback is not used or when it returns `true`.                                      |
|tosUrl                           |Yes     |-                   |The URL of the Terms of Service page.                                                                                                                                                     |

### Available providers

|Provider          |Value                                           |
|------------------|------------------------------------------------|
|Google            |`firebase.auth.GoogleAuthProvider.PROVIDER_ID`  |
|Facebook          |`firebase.auth.FacebookAuthProvider.PROVIDER_ID`|
|Twitter           |`firebase.auth.TwitterAuthProvider.PROVIDER_ID` |
|Github            |`firebase.auth.GithubAuthProvider.PROVIDER_ID`  |
|Email and password|`firebase.auth.EmailAuthProvider.PROVIDER_ID`   |

### Available callbacks

Currently only one callback is supported. Some will be added soon to monitor UI changes.

`signInSuccess(currentUser, credential, redirectUrl)`

**Parameters:**

|Name         |Type                          | Optional|Description                                                                                                                                                              |
|-------------|------------------------------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`currentUser`|`firebase.User`               |No       |The logged in user.                                                                                                                                                      |
|`credential` |`firebase.auth.AuthCredential`|Yes      |The credential used to sign in the user.                                                                                                                                  |
|`redirectUrl`|`string`                      |Yes      |The URL where the user is redirected after the callback finishes. It will only be given if you [overwrite the sign-in success URL](#overwriting-the-sign-in-success-url).|

**Should return: `boolean`**

If the callback returns `true`, then the page is automatically redirected depending on the case:

- If no `signInSuccessUrl` parameter was given in the URL (See:
[Overwriting the sign-in success URL](#overwriting-the-sign-in-success-url)) then the default
`signInSuccessUrl` in config is used.
- If the value is provided in the URL, that value will be used instead of the static
`signInSuccessUrl` in config.

If the callback returns `false` or nothing, the page is not automatically redirected.


### Example with all parameters used

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample FirebaseUI App</title>
    <script src="firebase-app.js"></script>
    <script src="firebase-auth.js"></script>
    <script src="firebase-ui-auth.js"></script>
    <script type="text/javascript">
      // Firebase config.
      var config = {
        'authDomain': '<your-firebase-project-domain>.firebaseapp.com',
        'apiKey': '<your-API-key>',
      };

      // FirebaseUI config.
      var uiConfig = {
        // Query parameter name for mode.
        'queryParameterForWidgetMode': 'mode',
        // Query parameter name for sign in success url.
        'queryParameterForSignInSuccessUrl': 'signInSuccessUrl',
        'signInSuccessUrl': '<url-to-redirect-to-on-success>',
        'signInOptions': [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
          firebase.auth.FacebookAuthProvider.PROVIDER_ID,
          firebase.auth.TwitterAuthProvider.PROVIDER_ID,
          firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        'tosUrl': '<your-tos-url>',
        'callbacks': {
          'signInSuccess': function(currentUser, credential, redirectUrl) {
            // Do something.
            // Return type determines whether we continue the redirect automatically
            // or whether we leave that to developer to handle.
            return true;
          }
        }
      };

      // Initialize the FirebaseUI Widget using Firebase.
      var app = firebase.initializeApp(config);
      var auth = app.auth();
      var ui = new firebaseui.auth.AuthUI(auth);
      // The start method will wait until the DOM is loaded.
      ui.start('#firebaseui-auth-container', uiConfig);
    </script>
    <link type="text/css" rel="stylesheet" href="firebase-ui-auth.css" />
  </head>
  <body>
    <!-- The surrounding HTML is left untouched by FirebaseUI.
         Your app may use that space for branding, controls and other customizations.-->
    <h1>Welcome to My Awesome App</h1>
    <div id="firebaseui-auth-container"></div>
  </body>
</html>
```

## Customizing FirebaseUI for authentication

Currently, FirebaseUI does not offer customization out of the box. However, the HTML around the
widget is not affected by it so you can display everything you want around the widget container.

## Advanced

### FirebaseUI widget modes

Upon initilization, FirebaseUI will look for the `mode` parameter in the URL. Depending on the value
of this parameter, it will trigger a specific mode. When no `mode` parameter is found, it will
default to the sign-in mode.

You can change the name of this parameter with the `queryParameterForWidgetMode` configuration
parameter.

|Query parameter value|Description |
|---------------------|------------|
|`?mode=select`       |Sign-in mode|

**Example:**

    https://<url-of-the-widget>?mode=select

### Overwriting the sign-in success URL

You can pass a query parameter to the widget's URL that will overwrite the URL the user is
redirected to after a successful sign-in. If you do so, you must set the configuration
`signInSuccessUrl` value (even if it will be overwritten). When passing the redirect URL this way,
the `signInSuccess` callback will receive the value as the `redirectUrl` argument.

You **must include the mode explicitly** in the URL when using the `signInSuccessUrl` parameter,
otherwise FirebaseUI will directly redirect to the URL specified.

You can change the name of this parameter with the `queryParameterForSignInSuccessUrl` configuration
parameter.

**Example:**

`https://<url-of-the-widget>?mode=select&signInSuccessUrl=signedIn.html` will redirect the user to
`https://<url-of-the-widget>/signedIn.html` after a successful sign-in flow.

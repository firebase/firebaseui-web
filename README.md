[![Build Status](https://img.shields.io/github/checks-status/firebase/firebaseui-web/master?style=flat-square)](https://travis-ci.org/firebase/firebaseui-web)
[![Bundle size](https://img.shields.io/bundlephobia/min/firebaseui?style=flat-square)](https://bundlephobia.com/result?p=firebaseui)
[![NPM Downloads](https://img.shields.io/npm/dm/firebaseui?style=flat-square)](https://www.npmjs.com/package/firebaseui)
[![NPM Version](https://img.shields.io/npm/v/firebaseui?style=flat-square)](https://www.npmjs.com/package/firebaseui)

# FirebaseUI for Web

FirebaseUI is an open-source JavaScript library for Web that provides simple,
customizable UI bindings on top of [Firebase](https://firebase.google.com) SDKs
to eliminate boilerplate code and promote best practices.

`TODO(jamesdaniels): reevaluate rest of README`

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

## Installation

`TODO(jamesdaniels): flush out`

### NPM

`npm install firebaseui-exp firebase@exp --save`


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

### Basic example

```ts
import { FirebaseSignInForm, GoogleAuthButton, EmailPasswordForm, defineCustomElements} from 'firebaseui-exp';
import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

// Bootstrap the firebase-sign-in-form custom element
defineCustomElements();

// Initialize Firebase with your web app credentials
const firebaseApp = initializeApp({
    // <your-firebase-config>
});

// Initialize Firebase Authentication, firebaseui handles loading dependencies for the
// desired authentication methods, so you don't have to pass any deps
const firebaseAuth = initializeAuth(firebaseApp);

// Create the custom element
const signInForm = new FirebaseSignInForm();
signInForm.auth = firebaseAuth; // attach the Firebase Auth instance
signInForm.signInOptions = [
    // Pass in the authentication methods you want to enable
    EmailPasswordForm,
    GoogleAuthButton,
];
signInForm.tosUrl = '<your-tos-url>';
signInForm.privacyPolicyUrl = '<your-privacy-policy-url>';

// Once the user has been authenticated, they will be redirected to the following URL
signInForm.signInSuccessUrl = '<url-to-redirect-to-on-success>';

// OR you can listen to the signInSuccessful event
signInForm.addEventListener('signInSuccessful', e => {
    e.preventDefault(); // this will prevent the redirect to signInSuccessUrl, if provided
    console.log('success!', e.detail); // the Firebase Credential is available on the event's detail attribute
});

// Attach the customElement to the DOM, in this case just append to the body
document.body.appendChild(signInForm);
```

## Documentation

* [`firebase-sign-in-form`](./docs/components/sign-in-form/readme.md)

## Use in web frameworks

### Angular

Our web-components and Angular directives can be accessed from the `firebaseui/angular` entry-point, however these are untested and should be considered expirimental. Instead you should check out the [AngularFire](https://github.com/angular/angularfire#angularfire) library, where we bundle FirebaseUI into a proper NgModule. (`TODO(jamesdaniels): do this`)

### React

While you can import from `firebaseui/react`, instead you should check out [ReactFire](https://github.com/FirebaseExtended/reactfire#reactfire). `TODO(jamesdaniels): should we bundle into reactfire? What about firebaseui-react?`

### Vue

Import from `firebaseui/vue`. `TODO(jamesdaniels): test and flust out docs`

### Svelte

Import from `firebaseui/svelte`. `TODO(jamesdaniels): test and flust out docs`

## Use in Node.js

`TODO(jamesdaniels): flust out`
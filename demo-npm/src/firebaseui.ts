import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';

const firebaseConfig = await fetch('/__/firebase/init.json').then(it => it.json());

export const app = firebase.initializeApp(firebaseConfig);

export const ui = new firebaseui.auth.AuthUI(app.auth());

const clientId = undefined;

const handleSignedInUser = (user: firebase.User) => {
  document.getElementById('user-signed-in')!.style.display = 'block';
  document.getElementById('user-signed-out')!.style.display = 'none';
  document.getElementById('name')!.textContent = user.displayName;
  document.getElementById('email')!.textContent = user.email;
  document.getElementById('phone')!.textContent = user.phoneNumber;
  if (user.photoURL) {
    var photoURL = user.photoURL;
    // Append size to the photo URL for Google hosted images to avoid requesting
    // the image with its original resolution (using more bandwidth than needed)
    // when it is going to be presented in smaller size.
    if ((photoURL.indexOf('googleusercontent.com') != -1) ||
        (photoURL.indexOf('ggpht.com') != -1)) {
      photoURL = photoURL + '?sz=' +
          document.getElementById('photo')!.clientHeight;
    }
    // TODO typing for the img element
    (document.getElementById('photo')! as any).src = photoURL;
    document.getElementById('photo')!.style.display = 'block';
  } else {
    document.getElementById('photo')!.style.display = 'none';
  }
}

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  document.getElementById('loading')!.style.display = 'none';
  document.getElementById('loaded')!.style.display = 'block';
  user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Displays the UI for a signed out user.
 */
 var handleSignedOutUser = function() {
  document.getElementById('user-signed-in')!.style.display = 'none';
  document.getElementById('user-signed-out')!.style.display = 'block';
  ui.start('#firebaseui-container', config);
};

const getRecaptchaMode = () => 'invisible';
const getEmailSignInMethod = () => 'password';
const getDisableSignUpStatus = () => false;

export const config: firebaseui.auth.Config = {
    'callbacks': {
      // Called when the user has been successfully signed in.
      'signInSuccessWithAuthResult': function(authResult, redirectUrl) {
        if (authResult.user) {
          handleSignedInUser(authResult.user);
        }
        if (authResult.additionalUserInfo) {
          document.getElementById('is-new-user')!.textContent =
              authResult.additionalUserInfo.isNewUser ?
              'New User' : 'Existing User';
        }
        // Do not redirect.
        return false;
      }
    },
    // Opens IDP Providers sign-in flow in a popup.
    'signInFlow': 'popup',
    'signInOptions': [
      // TODO(developer): Remove the providers you don't need for your app.
      {
        provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        // Required to enable ID token credentials for this provider.
        clientId
      },
      {
        provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        scopes :[
          'public_profile',
          'email',
          'user_likes',
          'user_friends'
        ]
      },
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      {
        provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
        // Whether the display name should be displayed in Sign Up page.
        requireDisplayName: true,
        signInMethod: getEmailSignInMethod(),
        disableSignUp: {
          status: getDisableSignUpStatus()
        }
      },
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          size: getRecaptchaMode()
        },
      },
      {
        provider: 'microsoft.com',
        loginHintKey: 'login_hint'
      },
      {
        provider: 'apple.com',
      },
      firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // Terms of service url.
    'tosUrl': 'https://www.google.com',
    // Privacy policy url.
    'privacyPolicyUrl': 'https://www.google.com',
    'credentialHelper': clientId ?
        firebaseui.auth.CredentialHelper.GOOGLE_YOLO :
        firebaseui.auth.CredentialHelper.NONE
};


/**
 * Deletes the user's account.
 */
export const deleteAccount = () => app.auth().currentUser!.delete().catch(async error => {
  if (error.code == 'auth/requires-recent-login') {
    // The user's credential is too old. She needs to sign in again.
    await app.auth().signOut();
    // The timeout allows the message to be displayed after the UI has
    // changed to the signed out state.
    setTimeout(function() {
      alert('Please sign in again to delete your account.');
    }, 1);
  }
});

export const signOut = () => app.auth().signOut();
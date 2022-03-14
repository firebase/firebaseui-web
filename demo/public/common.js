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
 * Common methods for both the main app page and standalone widget.
 */

/**
 * @return {string} The reCAPTCHA rendering mode from the configuration.
 */
function getRecaptchaMode() {
  var config = parseQueryString(location.hash);
  return config['recaptcha'] === 'invisible' ?
      'invisible' : 'normal';
}


/**
 * @return {string} The email signInMethod from the configuration.
 */
function getEmailSignInMethod() {
  var config = parseQueryString(location.hash);
  return config['emailSignInMethod'] === 'password' ?
      'password' : 'emailLink';
}


/**
 * Solution taken from:
 * https://firebase.googleblog.com/2016/10/authenticate-your-firebase-users-with.html
 */
 function getLinkedInSignInMethod() {
  // LinkedIn OAuth 2 setup
  const credentials = {
    client: {
      id: YOUR_LINKEDIN_CLIENT_ID, // Change this!
      secret: YOUR_LINKEDIN_CLIENT_SECRET, // Change this!
    },
    auth: {
      tokenHost: 'https://api.linkedin.com/v2/me',
      tokenPath: '/oauth/access_token'
    }
  };
  const oauth2 = require('simple-oauth2').create(credentials);
  

  app.get('/redirect', (req, res) => {
    // Generate a random state verification cookie.
    const state = req.cookies.state || crypto.randomBytes(20).toString('hex');
    // Allow unsecure cookies on localhost.
    const secureCookie = req.get('host').indexOf('localhost:') !== 0;
    res.cookie('state', state.toString(), {maxAge: 3600000, secure: secureCookie, httpOnly: true});
    const redirectUri = oauth2.authorizationCode.authorizeURL({
      redirect_uri: `${req.protocol}://${req.get('host')}/linkedin-callback`,
      scope: 'basic',
      state: state
    });
    res.redirect(redirectUri);
  });


  function onSignInButtonClick() {
    // Open the Auth flow in a popup.
    window.open('/redirect', 'firebaseAuth', 'height=315,width=400');
  };


  app.get('/linkedin-callback',(req, res) => {
    // Check that we received a State Cookie.
    if (!req.cookies.state) {
      res.status(400).send('State cookie not set or expired. Maybe you took too long to authorize. Please try again.');
    // Check the State Cookie is equal to the state parameter.
    } else if (req.cookies.state !== req.query.state) {
      res.status(400).send('State validation failed');
    }
  
    // Exchange the auth code for an access token.
    oauth2.authorizationCode.getToken({
      code: req.query.code,
      redirect_uri: `${req.protocol}://${req.get('host')}/linkedin-callback`
    }).then(results => {
      // We have an linkedin access token and the user identity now.
      const accessToken = results.access_token;
      const linkedinUserID = results.user.id;
      const profilePic = results.user.profile_picture;
      const userName = results.user.full_name;
  
      // ...

      // Create a Firebase custom auth token.
    const firebaseToken = createFirebaseToken(linkedinUserID);

    // Serve an HTML page that signs the user in and updates the user profile.
    res.send(
        signInFirebaseTemplate(firebaseToken, userName, profilePic, accessToken));  
    });
  });


  const firebase = require('firebase');
  const serviceAccount = require('./service-account.json');
  firebase.initializeApp({
    serviceAccount: serviceAccount
  });


  function createFirebaseToken(linkedinID) {
    // The uid we'll assign to the user.
    const uid = `linkedin:${linkedinID}`;
  
    // Create the custom token.
    return firebase.auth().createCustomToken(uid);
  }
}


function signInFirebaseTemplate(token, displayName, photoURL, linkedinAccessToken) {
  return `
    <script src="https://www.gstatic.com/firebasejs/3.4.0/firebase.js"></script>
    <script src="promise.min.js"></script><!-- Promise Polyfill for older browsers -->
    <script>
      var token = '${token}';
      var config = {
        apiKey: MY_FIREBASE_API_KEY, // Change this!
        databaseURL: MY_DATABASE_URL // Change this!
      };
      // We sign in via a temporary Firebase app to update the profile.
      var tempApp = firebase.initializeApp(config, '_temp_');
      tempApp.auth().signInWithCustomToken(token).then(function(user) {
     
        // Saving the linkedin API access token in the Realtime Database.
        const tasks = [tempApp.database().ref('/linkedinAccessToken/' + user.uid)
            .set('${linkedinAccessToken}')];
   
        // Updating the displayname and photoURL if needed.
        if ('${displayName}' !== user.displayName || '${photoURL}' !== user.photoURL) {
          tasks.push(user.updateProfile({displayName: '${displayName}', photoURL: '${photoURL}'}));
        }
   
        // Wait for completion of above tasks.
        return Promise.all(tasks).then(function() {
          // Delete temporary Firebase app and sign in the default Firebase app, then close the popup.
          var defaultApp = firebase.initializeApp(config);
          Promise.all([
              defaultApp.auth().signInWithCustomToken(token),
              tempApp.delete()]).then(function() {
            window.close(); // We’re done! Closing the popup.
          });
        });
      });
    </script>`;
 }


/**
 * @return {boolean} The disable sign up status from the configuration.
 */
function getDisableSignUpStatus() {
  var config = parseQueryString(location.hash);
  return config['disableEmailSignUpStatus'] === 'true';
}


/**
 * @return {boolean} The admin restricted operation status from the configuration.
 */
function getAdminRestrictedOperationStatus() {
  var config = parseQueryString(location.hash);
  return config['adminRestrictedOperationStatus'] === 'true';
}


/**
 * @param {string} queryString The full query string.
 * @return {!Object<string, string>} The parsed query parameters.
 */
function parseQueryString(queryString) {
  // Remove first character if it is ? or #.
  if (queryString.length &&
      (queryString.charAt(0) == '#' || queryString.charAt(0) == '?')) {
    queryString = queryString.substring(1);
  }
  var config = {};
  var pairs = queryString.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    if (pair.length == 2) {
      config[pair[0]] = pair[1];
    }
  }
  return config;
}

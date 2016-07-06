/**
 * Redirects to the FirebaseUI widget.
 */
var signInWithRedirect = function() {
  window.location.assign('/widget');
};


/**
 * Open a popup with the FirebaseUI widget.
 */
var signInWithPopup = function() {
  window.open('/widget', 'Sign In', 'width=985,height=735');
};


/**
 * Displays the UI for a signed in user.
 */
var handleSignedInUser = function(user) {
  document.getElementById('user-signed-in').style.display = 'block';
  document.getElementById('user-signed-out').style.display = 'none';
  document.getElementById('name').textContent = user.displayName;
  document.getElementById('email').textContent = user.email;
  if (user.photoURL){
    document.getElementById('photo').src = user.photoURL;
    document.getElementById('photo').style.display = 'block';
  } else {
    document.getElementById('photo').style.display = 'none';
  }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
  document.getElementById('user-signed-in').style.display = 'none';
  document.getElementById('user-signed-out').style.display = 'block';
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
  user ? handleSignedInUser(user) : handleSignedOutUser();
});


/**
 * Initializes the app.
 */
var initApp = function() {
  document.getElementById('sign-in-with-redirect').addEventListener(
      'click', signInWithRedirect);
  document.getElementById('sign-in-with-popup').addEventListener(
      'click', signInWithPopup);
  document.getElementById('sign-out').addEventListener('click', function() {
    firebase.auth().signOut();
  });
  document.getElementById('delete-account').addEventListener(
      'click', function() {
        firebase.auth().currentUser.delete();
      });
};

window.addEventListener('load', initApp);
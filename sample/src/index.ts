import { initializeApp } from 'firebase/app';
import { initializeAuth } from 'firebase/auth';

const firebaseApp = initializeApp({
    apiKey: "AIzaSyAuTP4cG5noVZJmPJhBT_Uu5_DETT5uFbo",
    authDomain: "fir-ui-test-7cd1d.firebaseapp.com",
    projectId: "fir-ui-test-7cd1d",
    storageBucket: "fir-ui-test-7cd1d.appspot.com",
    messagingSenderId: "226010084826",
    appId: "1:226010084826:web:19f3ac2f1afa5920e23ce3"
});

const firebaseAuth = initializeAuth(firebaseApp);

const ready = () => {

    const loadingNotice = document.getElementById('loading-notice')!;
    const signedOutNotice = document.getElementById('signed-out-notice')!;
    const signedInContent = document.getElementById('signed-in-content')!;
    const signedOutContent = document.getElementById('signed-out-content')!;
    const userDetailsPlaceholder = document.getElementById('user-details-placeholder')!;
    const signOutButton = document.getElementById('sign-out')!;

    firebaseAuth.onAuthStateChanged(user => {
        loadingNotice.style.display = 'none';
        signedOutNotice.style.display = 'block';
        if (user) {
            signedInContent.style.display = 'block';
            signedOutContent.style.display = 'none';
            userDetailsPlaceholder.innerHTML = `<h2>${user.displayName}</h2><pre>${user.uid}</pre>`;
        } else {
            signedInContent.style.display = 'none';
            signedOutContent.style.display = 'block';
        }
    });

    signOutButton.addEventListener('click', () => {
        firebaseAuth.signOut()
    });

    customElements.whenDefined('firebase-sign-in-form').then(() => {
        const signInForm = document.getElementsByTagName('firebase-sign-in-form')[0]!;
        signInForm.setAuth(firebaseAuth);
    });

};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

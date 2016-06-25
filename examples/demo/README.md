# FirebaseUI for web - Auth Demo

Accessible here:
[https://fir-ui-demo-84a6c.firebaseapp.com](https://fir-ui-demo-84a6c.firebaseapp.com).

## Prerequisite

You need to have created a Firebase Project in the
[Firebase Console](https://firebase.google.com/console/) as well as configured a web app.

## Installation

Install the firebase command line tool with `npm install -g firebase-tools` (See
[docs](https://firebase.google.com/docs/cli/#setup)).

Enable the Auth providers you would like to offer your users in the console, under
Auth > Sign-in methods.

Run:

    git clone https://github.com/firebase/firebaseui-web.git
    cd firebaseui-web/examples/demo
    firebase use --add

This will clone the repository in the current directory, and start a wizard to configure firebase
for your app. Select the project you have created in the prerequisite, and type in `default` or
any other name as the alias to use for this project.

Then copy and paste the Web snippet code found in the console (either by clicking "Add Firebase to
your web app" button in your Project overview, or clicking the "Web setup" button in the Auth page)
in the `index.html` and `widget.html` files.

## Deploy

Run `firebase serve` to run a server locally (default: http://localhost:5000) or `firebase deploy` to
deploy the demo.
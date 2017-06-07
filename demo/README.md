# FirebaseUI for web - Auth Demo

Accessible here:
[https://fir-ui-demo-84a6c.firebaseapp.com](https://fir-ui-demo-84a6c.firebaseapp.com).

## Prerequisite

You need to have created a Firebase Project in the
[Firebase Console](https://firebase.google.com/console/) as well as configured a web app.

## Installation

Install the Firebase command line tool with `npm install -g firebase-tools` (See
[docs](https://firebase.google.com/docs/cli/#setup)).

Enable the Auth providers you would like to offer your users in the console, under
Auth > Sign-in methods.

Run:

```bash
git clone https://github.com/firebase/firebaseui-web.git
cd firebaseui-web/demo
```

This will clone the repository in the current directory.

If you want to be able to deploy the demo app to one of your own Firebase Hosting instance,
configure it using the following command:

```bash
firebase use --add
```

Select the project you have created in the prerequisite, and type in `default` or
any other name as the alias to use for this project.

Copy `public/sample-config.js` to `public/config.js`:

```bash
cp public/sample-config.js public/config.js
```

Then copy and paste the Web snippet code found in the console (either by clicking "Add Firebase to
your web app" button in your Project overview, or clicking the "Web setup" button in the Auth page)
in the `config.js` file.

## Deploy

### Option 1: Compile and use local FirebaseUI files

To deploy the demo app, run the following command in the root directory of FirebaseUI (use `cd ..`
first if you are still in the `demo/` folder):

```bash
npm run demo
```

This will compile all the files needed to run FirebaseUI, and start a Firebase server locally at
[http://localhost:5000](http://localhost:5000).

### Option 2: Use CDN hosted FirebaseUI files

If you would prefer to use a CDN instead of locally compiled FirebaseUI files, you can instead
locate the following in the `<head>` tag of `public/index.html` and `public/widget.html`:

```html
    <script src="dist/firebaseui.js"></script>
    <link type="text/css" rel="stylesheet" href="dist/firebaseui.css" />
```

Then replace that with the snippet provided in the CDN installation section found at
[https://github.com/firebase/firebaseui-web/blob/master/README.md](https://github.com/firebase/firebaseui-web/blob/master/README.md).

Finally, ensure you are in the `demo/` folder (and not the root directory of FirebaseUI), and run:
```bash
firebase serve
```

This will start a Firebase server locally at [http://localhost:5000](http://localhost:5000).

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

const cleanCSS = require('gulp-clean-css');
const closureBuilder = require('closure-builder');
const closureCompiler = require('gulp-closure-compiler');
const concatCSS = require('gulp-concat-css');
const cssInlineImages = require('gulp-css-inline-images');
const connect = require('gulp-connect');
const fse = require('fs-extra');
const flip = require('gulp-css-flip');
const gulp = require('gulp');
const path = require('path');
const sass = require('gulp-sass');
const streamqueue = require('streamqueue');
const util = require('gulp-util');

const glob = closureBuilder.globSupport();

// The optimization level for the JS compiler.
// Valid levels: WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS.
// This can be passed in as a flag:
// $ gulp --compilation_level=WHITESPACE_ONLY
const OPTIMIZATION_LEVEL = util.env.compilation_level ||
    'ADVANCED_OPTIMIZATIONS';

// For minified builds, wrap the output so we avoid leaking global variables.
const OUTPUT_WRAPPER = OPTIMIZATION_LEVEL === 'WHITESPACE_ONLY' ?
    '%output%' : '(function() { %output% }).apply(' +
    'typeof global !== \'undefined\' ? global : typeof self !== \'undefined\' ' +
    '? self : window );';

// Provides missing dialogPolyfill on window in cjs environments.
const DIALOG_POLYFILL = 'if(typeof window!==\'undefined\')' +
    '{window.dialogPolyfill=require(\'dialog-polyfill\');}';

// Provides missing dialogPolyfill on window for esm.
const ESM_DIALOG_POLYFILL = 'if(typeof window!==\'undefined\')' +
    '{window.dialogPolyfill=dialogPolyfill;}';

// Using default import if available.
const DEFAULT_IMPORT_FIX = 'if(typeof firebase.default!==\'undefined\')' +
    '{firebase=firebase.default;}';

// The Material Design Lite components needed by FirebaseUI.
const MDL_COMPONENTS = [
  'mdlComponentHandler',
  'button/button',
  'progress/progress',
  'spinner/spinner',
  'textfield/textfield'
];

// The external dependencies needed by FirebaseUI as ES module imports.
const ESM_DEPS = [
  'import firebase from \'firebase/app\'',
  'import \'firebase/auth\'',
  'import dialogPolyfill from \'dialog-polyfill\'',
].concat(MDL_COMPONENTS.map(component => `import \'material-design-lite/src/${component}\'`));

// The external dependencies needed by FirebaseUI as CommonJS modules.
const CJS_DEPS = [
  'node_modules/dialog-polyfill/dialog-polyfill.js'
].concat(MDL_COMPONENTS.map(component => `node_modules/material-design-lite/src/${component}.js`));

// Import esm modules.
const ESM_IMPORT = ESM_DEPS.join(';') + ';';

// Export firebaseui.auth module.
const ESM_EXPORT = 'const auth = firebaseui.auth;' +
    'export { auth } ;';

// Adds the cjs module requirement and exports firebaseui.
const NPM_MODULE_WRAPPER = OPTIMIZATION_LEVEL === 'WHITESPACE_ONLY' ?
    'var firebase=require(\'firebase/app\');require(\'firebase/auth\');' +
    DEFAULT_IMPORT_FIX + '%output%' + DIALOG_POLYFILL +
    'module.exports=firebaseui;' :
    '(function() { var firebase=require(\'firebase/app\');' +
    'require(\'firebase/auth\');' + DEFAULT_IMPORT_FIX + '%output% ' +
    DIALOG_POLYFILL + '})();' + 'module.exports=firebaseui;';

// Adds the module requirement and exports firebaseui.
const ESM_MODULE_WRAPPER = OPTIMIZATION_LEVEL === 'WHITESPACE_ONLY' ?
    ESM_IMPORT + '%output%' +
    ESM_DIALOG_POLYFILL + ESM_EXPORT :
    ESM_IMPORT +
    '(function() {' + '%output%' + '}).apply(' +
    'typeof global !== \'undefined\' ? global : typeof self !== \'undefined\' ' +
    '? self : window );' +
    ESM_DIALOG_POLYFILL + ESM_EXPORT;

// The path to Closure Compiler.
const COMPILER_PATH = 'node_modules/google-closure-compiler-java/compiler.jar';

// The path to the temporary directory where intermediate results are stored.
const TMP_DIR = 'out';

// The path to the temporary directory where intermediate results are stored.
const DEST_DIR = 'dist';

// The locale that would be produced with no XTBs.
const DEFAULT_LOCALE = 'en';

// The list of all locales that are supported.
const ALL_LOCALES = ['ar-XB', 'ar', 'bg', 'ca', 'cs', 'da', 'de', 'el', 'en',
    'en-GB', 'en-XA', 'es-419', 'es', 'fa', 'fi', 'fil', 'fr', 'hi', 'hr', 'hu',
    'id', 'it', 'iw', 'ja', 'ko', 'lt', 'lv', 'nl', 'no', 'pl', 'pt-PT',
    'pt-BR', 'ro', 'ru', 'sk', 'sl', 'sr', 'sv', 'th', 'tr', 'uk', 'vi',
    'zh-CN', 'zh-TW'];

// Default arguments to pass into Closure Compiler.
const COMPILER_DEFAULT_ARGS = {
  compilation_level: OPTIMIZATION_LEVEL,
  language_out: 'ES5'
};

// The typescript definitions file path.
const TYPES_FILE = './types/index.d.ts';

// The externs directory files.
const EXTERNS_FILES = './externs/*.js';

// Compiles the Closure templates into JavaScript.
gulp.task('build-soy', () => new Promise((resolve, reject) => {
  closureBuilder.build({
    name: 'soy_files',
    srcs: glob([
      'soy/*.soy'
    ]),
    out: TMP_DIR,
    options: {
      soy: {
        shouldGenerateGoogMsgDefs: true,
        bidiGlobalDir: 1
      }
    },
  }, resolve);
}));

/**
 * Invokes Closure Compiler.
 * @param {!Array<string>} srcs The JS sources to compile.
 * @param {string} out The path to the output JS file.
 * @param {!Object} args Additional arguments to Closure compiler.
 * @return {*} A stream that finishes when compliation finishes.
 */
function compile(srcs, out, args) {
  // Get the compiler arguments, using the defaults if not specified.
  const combinedArgs = Object.assign({}, COMPILER_DEFAULT_ARGS, args);
  return gulp
      .src(srcs)
      .pipe(closureCompiler({
        compilerPath: COMPILER_PATH,
        fileName: path.basename(out),
        compilerFlags: combinedArgs
      }))
      .pipe(gulp.dest(path.dirname(out)));
}

/**
 * Normalizes a locale ID for use in a file name (e.g. en-GB -> en_gb).
 * @param {string} locale
 * @return {string} The normalized locale ID.
 */
function getLocaleForFileName(locale) {
  return locale.toLowerCase().replace(/-/g, '_');
}

/**
 * Gets the path to the temporary JS file that contains all FirebaseUI code
 * but no external dependencies.
 * @param {string} locale
 * @return {string} The path of the temporary JS file.
 */
function getTmpJsPath(locale) {
  const localeForFileName = getLocaleForFileName(locale);
  return `${TMP_DIR}/firebaseui__${localeForFileName}.js`;
}

/**
 * Repeats a gulp task for all locales.
 * @param {string} taskName The gulp task name to generate. Any $ tokens will be
 *     replaced with the language code (e.g. build-$ becomes build-fr, build-es,
 *     etc.).
 * @param {!Array<string>} dependencies The gulp tasks that each operation
 *     depends on. Any $ tokens will be replaced with the language code.
 * @param {function()} operation The function to execute.
 * @return {!Array<string>} The list of generated task names.
 */
function repeatTaskForAllLocales(taskName, dependencies, operation) {
  return ALL_LOCALES.map((locale) => {
    // Convert build-js-$ to build-js-fr, for example.
    const replaceTokens = (name) => name.replace(/\$/g, locale);
    const localeTaskName = replaceTokens(taskName);
    const localeDependencies = dependencies.map(replaceTokens);
    gulp.task(localeTaskName, gulp.series(
        gulp.parallel.apply(null, localeDependencies),
        () => operation(locale)
    ));
    return localeTaskName;
  });
}

/**
 * Builds the core FirebaseUI binary in the given locale.
 * @param {string} locale
 * @return {*} A stream that finishes when compilation finishes.
 */
function buildFirebaseUiJs(locale) {
  const flags = {
    closure_entry_point: 'firebaseui.auth.exports',
    define: `goog.LOCALE='${locale}'`,
    externs: [
      'node_modules/firebase/externs/firebase-app-externs.js',
      'node_modules/firebase/externs/firebase-auth-externs.js',
      'node_modules/firebase/externs/firebase-client-auth-externs.js'
    ],
    only_closure_dependencies: true,
    output_wrapper: OUTPUT_WRAPPER,

    // This is required to support @export annotation to expose external
    // properties.
    export_local_property_definitions: true,
    generate_exports: true,

    // This is required to match XTB IDs to the JS/Soy messages.
    translations_project: 'FirebaseUI'
  };
  if (locale !== DEFAULT_LOCALE) {
    flags.translations_file = `translations/${locale}.xtb`;
  }
  return compile([
    'node_modules/google-closure-templates/javascript/soyutils_usegoog.js',
    'node_modules/google-closure-library/closure/goog/**/*.js',
    'node_modules/google-closure-library/third_party/closure/goog/**/*.js',
    `${TMP_DIR}/**/*.js`,
    'javascript/**/*.js'
  ], getTmpJsPath(locale), flags);
}

/**
 * Concatenates the core FirebaseUI JS with its external dependencies, and
 * cleans up comments and whitespace in the dependencies.
 * @param {string} locale The desired FirebaseUI locale.
 * @param {string} outBaseName The prefix of the output file name.
 * @param {string} outputWrapper A wrapper with which to wrap the output JS.
 * @param {?Array<string>=} dependencies The dependencies to concatenate.
 * @return {*} A stream that ends when compilation finishes.
 */
function concatWithDeps(locale, outBaseName, outputWrapper, dependencies = []) {
  const localeForFileName = getLocaleForFileName(locale);
  // Get a list of the FirebaseUI JS and its dependencies.
  const srcs = dependencies.concat([getTmpJsPath(locale)]);
  const outputPath = `${DEST_DIR}/${outBaseName}__${localeForFileName}.js`;
  return compile(srcs, outputPath, {
    compilation_level: 'WHITESPACE_ONLY',
    output_wrapper: outputWrapper
  });
}

/**
 * Creates the default FirebaseUI binaries for basic usage without
 * localization. For example, it copies firebaseui__en.js to firebaseui.js.
 * @param {string} fileName
 * @return {!Promise} A promise that resolves on completion.
 */
function makeDefaultFile(fileName) {
  const localeForFileName = getLocaleForFileName(DEFAULT_LOCALE);
  const path = `${DEST_DIR}/${fileName}__${localeForFileName}.js`;
  if (fse.existsSync(path)) {
    return fse.copy(path, `${DEST_DIR}/${fileName}.js`);
  }
}

// Generates the typescript definitions.
gulp.task('build-ts',
    () => gulp.src(TYPES_FILE).pipe(gulp.dest(`${DEST_DIR}/`)));

// Generates the externs definitions.
gulp.task('build-externs',
    () => gulp.src(EXTERNS_FILES).pipe(gulp.dest(`${DEST_DIR}/externs/`)));

// Builds the core FirebaseUI JS. Generates the gulp tasks
// build-firebaseui-js-de, build-firebaseui-js-fr, etc.
repeatTaskForAllLocales(
    'build-firebaseui-js-$',
    ['build-externs', 'build-ts', 'build-soy'],
    buildFirebaseUiJs
);

// Bundles the FirebaseUI JS with its dependencies as a NPM module. This builds
// the NPM module for all languages.
repeatTaskForAllLocales(
    'build-npm-$', ['build-firebaseui-js-$'],
    (locale) => concatWithDeps(locale, 'npm', NPM_MODULE_WRAPPER, CJS_DEPS));

// Bundles the FirebaseUI JS with its dependencies as a ESM module. This builds
// the NPM module for all languages.
repeatTaskForAllLocales(
    'build-esm-$', ['build-firebaseui-js-$'],
    (locale) => concatWithDeps(locale, 'esm', ESM_MODULE_WRAPPER));

// Bundles the FirebaseUI JS with its dependencies for all locales.
// Generates the gulp tasks build-js-de, build-js-fr, etc.
const buildJsTasks = repeatTaskForAllLocales(
    'build-js-$', ['build-firebaseui-js-$'],
    (locale) => concatWithDeps(locale, 'firebaseui', OUTPUT_WRAPPER, CJS_DEPS));

// Builds the final JS file for the default language.
gulp.task('build-js', gulp.series(
    'build-js-' + DEFAULT_LOCALE,
    () => makeDefaultFile('firebaseui')
));

// Builds the final JS file for all supported languages.
gulp.task('build-all-js', gulp.series(
    gulp.parallel.apply(null, buildJsTasks),
    () => makeDefaultFile('firebaseui')
));

// Builds the NPM module for the default language.
gulp.task('build-npm', gulp.series(
    'build-npm-' + DEFAULT_LOCALE,
    () => makeDefaultFile('npm')
));

// Builds the ESM module for the default language.
gulp.task('build-esm', gulp.series(
    'build-esm-' + DEFAULT_LOCALE,
    () => makeDefaultFile('esm')
));

/**
 * Builds the CSS for FirebaseUI.
 * @param {boolean} isRtl Whether to build in right-to-left mode.
 * @return {*} A stream that finishes when compilation finishes.
 */
function buildCss(isRtl) {
  const mdlSrcs = gulp.src('stylesheet/mdl.scss')
      .pipe(sass.sync().on('error', sass.logError))
      .pipe(cssInlineImages({
        webRoot: 'node_modules/material-design-lite/src',
      }));
  const dialogPolyfillSrcs = gulp.src(
      'node_modules/dialog-polyfill/dialog-polyfill.css');
  let firebaseSrcs = gulp.src('stylesheet/*.css');

  // Flip left/right, ltr/rtl for RTL languages.
  if (isRtl) {
    firebaseSrcs = firebaseSrcs.pipe(flip.gulp());
  }

  const outFile = isRtl ? 'firebaseui-rtl.css' : 'firebaseui.css';
  return streamqueue({objectMode: true},
      mdlSrcs, dialogPolyfillSrcs, firebaseSrcs)
      .pipe(concatCSS(outFile))
      .pipe(cleanCSS())
      .pipe(gulp.dest(DEST_DIR));
}

// Concatenates and minifies the CSS sources for LTR languages.
gulp.task('build-css', () => buildCss(false));

// Concatenates and minifies the CSS sources for RTL languages.
gulp.task('build-css-rtl', () => buildCss(true));

// Creates a webserver that serves all files from the root of the package.
gulp.task('serve', () => {
  connect.server({
    port: 4000
  });
});

// Deletes intermediate files.
gulp.task('clean', () => fse.remove(TMP_DIR));

// Executes the basic tasks for the default language.
gulp.task('default', gulp.series(
    'build-externs', 'build-ts', 'build-js',
    'build-npm', 'build-esm', 'build-css', 'build-css-rtl',
    'clean'
));

// Builds everything (JS for all languages, both LTR and RTL CSS).
gulp.task('build-all', gulp.series(
    'build-externs', 'build-ts', 'build-all-js',
    'build-npm', 'build-esm', 'build-css', 'build-css-rtl',
    'clean'
));

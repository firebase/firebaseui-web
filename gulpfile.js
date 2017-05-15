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

var gulp = require('gulp'),
    streamqueue = require('streamqueue'),
    closureCompiler = require('gulp-closure-compiler'),
    cleanCSS = require('gulp-clean-css'),
    concatCSS = require('gulp-concat-css'),
    sass = require('gulp-sass'),
    del = require('del');


// The optimization level for the JS compiler.
// Valid levels: WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, ADVANCED_OPTIMIZATIONS.
// TODO: Add ability to pass this in as a flag.
var OPTIMIZATION_LEVEL = 'ADVANCED_OPTIMIZATIONS';


// For minified builds, wrap the output so we avoid leaking global variables.
var OUTPUT_WRAPPER = OPTIMIZATION_LEVEL === 'WHITESPACE_ONLY' ?
    '%output%' : '(function() { %output% })();';

// Adds the firebase module requirement and exports firebaseui.
var NPM_MODULE_WRAPPER = OPTIMIZATION_LEVEL === 'WHITESPACE_ONLY' ?
    'var firebase=require(\'firebase\');%output%module.exports=firebaseui;' :
    '(function() { var firebase=require(\'firebase\');%output% })();' +
    'module.exports=firebaseui;';


// The path to Closure Compiler.
var COMPILER_PATH = 'node_modules/google-closure-compiler/compiler.jar';


/**
 * Concatenates JS files using the Closure Compiler.
 * @param {string} outFileName The name of the output file.
 * @param {string} wrapper The output wrapper to use after concatenating files.
 * @return {*}
 */
function concatJS(outFileName, wrapper) {
  return closureCompiler({
    compilerPath: COMPILER_PATH,
    fileName: outFileName,
    compilerFlags: {
      compilation_level: 'WHITESPACE_ONLY',
      language_out: 'ES5',
      output_wrapper: wrapper
    }
  });
}


// Builds the core FirebaseUI JS.
gulp.task('build-firebaseui-js', () =>
    gulp
    .src([
      'node_modules/google-closure-templates/javascript/soyutils_usegoog.js',
      'node_modules/google-closure-library/closure/goog/**/*.js',
      'node_modules/google-closure-library/third_party/closure/goog/**/*.js',
      'out/**/*.js',
      'javascript/**/*.js'
    ])
    .pipe(closureCompiler({
      compilerPath: COMPILER_PATH,
      fileName: 'firebaseui.js',
      compilerFlags: {
        closure_entry_point: 'firebaseui.auth.exports',
        compilation_level: OPTIMIZATION_LEVEL,
        externs: [
          'node_modules/firebase/externs/firebase-app-externs.js',
          'node_modules/firebase/externs/firebase-auth-externs.js',
          'node_modules/firebase/externs/firebase-client-auth-externs.js'
        ],
        language_out: 'ES5',
        only_closure_dependencies: true,
        output_wrapper: OUTPUT_WRAPPER
      }
    }))
    .pipe(gulp.dest('out')));


// Bundles the FirebaseUI JS with its dependencies.
gulp.task('build-js', ['build-firebaseui-js'], () =>
    gulp
    .src([
      'node_modules/material-design-lite/src/mdlComponentHandler.js',
      'node_modules/material-design-lite/src/button/button.js',
      'node_modules/material-design-lite/src/progress/progress.js',
      'node_modules/material-design-lite/src/spinner/spinner.js',
      'node_modules/material-design-lite/src/textfield/textfield.js',
      'node_modules/dialog-polyfill/dialog-polyfill.js',
      'out/firebaseui.js'
    ])
    .pipe(concatJS('firebaseui.js', OUTPUT_WRAPPER))
    .pipe(gulp.dest('dist')));

// Bundles the FirebaseUI JS with its dependencies as a NPM module.
gulp.task('build-npm', ['build-firebaseui-js'], () =>
    gulp
    .src([
      'node_modules/material-design-lite/src/mdlComponentHandler.js',
      'node_modules/material-design-lite/src/button/button.js',
      'node_modules/material-design-lite/src/progress/progress.js',
      'node_modules/material-design-lite/src/spinner/spinner.js',
      'node_modules/material-design-lite/src/textfield/textfield.js',
      'node_modules/dialog-polyfill/dialog-polyfill.js',
      'out/firebaseui.js'
    ])
    .pipe(concatJS('npm.js', NPM_MODULE_WRAPPER))
    .pipe(gulp.dest('dist')));

// Concatenates and minifies the CSS sources.
gulp.task('build-css', () => {
  var mdlSrcs = gulp.src('stylesheet/mdl.scss')
      .pipe(sass.sync().on('error', sass.logError));
  var dialogPolyfillSrcs = gulp.src(
      'node_modules/dialog-polyfill/dialog-polyfill.css');
  var firebaseSrcs = gulp.src('stylesheet/*.css');

  return streamqueue({objectMode: true},
      mdlSrcs, dialogPolyfillSrcs, firebaseSrcs)
      .pipe(concatCSS('firebaseui.css'))
      .pipe(cleanCSS())
      .pipe(gulp.dest('dist'));
});

// Creates a webserver that serves all files from the root of the package.
gulp.task('serve', () => {
  var connect = require('gulp-connect');

  connect.server({
    port: 4000
  });
});


// Deletes intermediate files.
gulp.task('clean', () => del(['out/*', 'out']));


gulp.task(
    'default',
    ['build-js', 'build-npm', 'build-css'],
    () => gulp.start('clean'));

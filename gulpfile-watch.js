const cleanCSS = require('gulp-clean-css')
const concatCSS = require('gulp-concat-css')
const cssInlineImages = require('gulp-css-inline-images')
const flip = require('gulp-css-flip')
const gulp = require('gulp')
const sass = require('gulp-sass')
const streamqueue = require('streamqueue')
const fse = require('fs-extra')

// The path to the temporary directory where intermediate results are stored.
const DEST_DIR = '../public/firebaseui'

// The path to the temporary directory where intermediate results are stored.
const TMP_DIR = 'out'

/**
 * Builds the CSS for FirebaseUI.
 * @param {boolean} isRtl Whether to build in right-to-left mode.
 * @return {*} A stream that finishes when compilation finishes.
 */
function buildCss (isRtl) {
  const mdlSrcs = gulp
    .src('stylesheet/mdl.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(
      cssInlineImages({
        webRoot: 'node_modules/material-design-lite/src'
      })
    )
  const dialogPolyfillSrcs = gulp.src(
    'node_modules/dialog-polyfill/dialog-polyfill.css'
  )
  let firebaseSrcs = gulp.src('stylesheet/*.css')

  // Flip left/right, ltr/rtl for RTL languages.
  if (isRtl) {
    firebaseSrcs = firebaseSrcs.pipe(flip.gulp())
  }

  const outFile = isRtl ? 'firebaseui-rtl.css' : 'firebaseui.css'
  return streamqueue(
    { objectMode: true },
    mdlSrcs,
    dialogPolyfillSrcs,
    firebaseSrcs
  )
    .pipe(concatCSS(outFile))
    .pipe(cleanCSS())
    .pipe(gulp.dest(DEST_DIR))
}

gulp.task('build-css', () => buildCss(false))

// Deletes intermediate files.
gulp.task('clean', () => fse.remove(TMP_DIR))

gulp.task(
  'default',
  gulp.series(
    'build-css',
    'clean'
  )
)

gulp.watch('stylesheet/*.css', gulp.series('build-css', 'clean'))

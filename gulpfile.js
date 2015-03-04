var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    uglify = require('gulp-uglify');

var paths = {
  js: ['localforage-wrapper.js']
};

// Build task
gulp.task('default', ['js-lint']);

// JSHint task
gulp.task('js-lint', function() {
  gulp.src(paths.js)
      .pipe(jscs())
      .pipe(jshint())
      .pipe(jshint.reporter('default'));
});

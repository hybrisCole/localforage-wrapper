var gulp = require('gulp'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    ngAnnotate = require('gulp-ng-annotate'),
    uglify = require('gulp-uglify');

var paths = {
  js: ['localforage-wrapper.js', 'json-driver.js']
};

// Build task
gulp.task('default', ['js-lint']);

// JSHint task
gulp.task('js-lint', function() {
  gulp.src(paths.js)
      .pipe(jscs())
      .pipe(jshint())
      .pipe(jshint.reporter('default'))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(concat('localforage-wrapper.min.js'))
      .pipe(gulp.dest('./'));
});

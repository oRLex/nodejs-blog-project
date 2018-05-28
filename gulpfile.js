var gulp = require('gulp'),
    del = require('del'),
    concat = require('gulp-concat'),
    min = require('gulp-uglify'),
    sass = require('gulp-sass'),
    size = require('gulp-size'),
    watchSass = require("gulp-watch-sass")

var paths = {
    js : './public/js/**/*.js',
    jsdir : './public/js',
    script : './public/scripts/**/*.js',
    scss : [
        './public/scss/**/*.sass',
        '!scss/**/*_scsslint_tmp*.scss'
    ],
    cssdir : './public/css'
};

 
gulp.task("sass:watch", () => watchSass([
  "./public/sass/**/*.sass",
  "!./public/libs/**/*"
])
  .pipe(sass())
  .pipe(gulp.dest("./public/css/")));

gulp.task('default', ['sass:watch']);
gulp.task('prod', ['clean', 'js:prod', 'sass:prod']);
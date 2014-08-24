'use strict';

var gulp = require('gulp'),
    print = require('gulp-print'),
    bundle = require('./index.js'),
    rimraf = require('rimraf'),
    path = require('path'),
    DirDiff = require('node-dir-diff').Dir_Diff;


var srcDir = 'tests/input',
    dstDir = 'tests/actual',
    expectedDir = 'tests/expected';


gulp.task('clean', function(cb) {
    rimraf(dstDir, cb);
});

gulp.task('bundle.js', function() {
    return gulp.src(srcDir + '/**/*.js')
        .pipe(bundle('bundle.js', {
            base: srcDir
        }))
        .pipe(gulp.dest(dstDir));
});

gulp.task('bundle.css', function() {
    return gulp.src(srcDir + '/**/*.css')
        .pipe(bundle('bundle.css', {
            type: 'css',
            base: srcDir
        }))
        .pipe(gulp.dest(dstDir));
});

gulp.task('run-test', ['bundle.css', 'bundle.js'], function(cb) {
    var diff = new DirDiff([path.resolve(dstDir), path.resolve(expectedDir)] , 'size'); //todo: shoould use 'content' but buggy
    diff.compare(function(err, result) {
        if (result.deviation > 0) {
            console.log('You have %s deviations!', result.deviation);
            console.log(result);
        }
        else{
            console.log('No deviation found. Plugin worked as expected.');
        }
        cb(err);
    });
});

gulp.task('default', ['clean'], function() {
    gulp.start('run-test');
});
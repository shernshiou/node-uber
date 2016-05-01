var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul');

gulp.task('pre-test', function() {
    return gulp.src(['lib/**/*.js'])
        // Covering files
        .pipe(istanbul({includeUntested: true}))
        // Force `require` to return covered files
        .pipe(istanbul.hookRequire());
});

gulp.task('test', function() {
    return gulp.src(['test/**/*.js'])
        .pipe(mocha({
            reporter: 'spec'
        }))
        // Creating the reports after tests ran
        .pipe(istanbul.writeReports())
        // Enforce a coverage of at least 90%
        .pipe(istanbul.enforceThresholds({
            thresholds: {
                global: 95
            }
        }));
});

gulp.task('default', ['pre-test', 'test']);

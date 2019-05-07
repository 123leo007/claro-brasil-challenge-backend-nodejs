var gulp = require('gulp');

var browserSync = require('browser-sync');

var nodemon = require('gulp-nodemon');

gulp.task('nodemon', function (cb) {
    var started = false;

    return nodemon({
          script: 'app.js'
    }).on('start', function () {
          if (!started) {
              cb();
              started = true;
          }
    });
});

gulp.task('browser-sync', gulp.series( ['nodemon'], function() {
browserSync.init(null, {
       proxy: "http://localhost:8000",
                files: ["public/**/*.*"],
                port: 3000,
       });
}));

gulp.task('default', gulp.series( ['browser-sync'], function () {
}));


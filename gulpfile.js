var gulp = require('gulp');

var browserSync = require('browser-sync');

var nodemon = require('gulp-nodemon');

gulp.task('sync', function () {
	sync.init({
		open: false,
		server: {
			baseDir: '/',
			middleware: [mockApis]
		},
		port: 3000,
		notify: true,
	});
});

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
    var mockApis = require('./backend/listener.js');
    browserSync.init(null, {
        server: {
			baseDir: '/',
			middleware: [mockApis]
		},
                files: ["public/**/*.*"],
                port: 3000,
       });
}));

gulp.task('default', gulp.series( ['browser-sync'], function () {
}));


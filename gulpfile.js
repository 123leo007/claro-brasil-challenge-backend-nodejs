'use strict';

var gulp = require('gulp'),
 wrench = require('wrench');

 wrench.readdirRecursive('./gulp-tasks').filter(function(file){
     return(/\.(js)$/i).test(file);
 }).map(function(file){
     require('./gulp-tasks/' + file);
 });

 gulp.task('default',['serve']);
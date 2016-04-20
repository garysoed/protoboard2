var gulp = require('gulp');
var fileTasks = require('./node_modules/gs-tools/gulp-tasks/file')(require('gulp-concat'));
var typescriptTasks = require('./node_modules/gs-tools/gulp-tasks/typescript')(
    require('gulp-tslint'),
    require('gulp-typescript'));
var karmaTasks = require('./node_modules/gs-tools/gulp-tasks/karma')(
    require('karma').Server);
var packTasks = require('./node_modules/gs-tools/gulp-tasks/pack')(
    require('vinyl-named'),
    require('gulp-sourcemaps'),
    require('gulp-webpack'));

var tasks = {};
tasks.allTests = function(gt, dir) {
  var dir = 'src/' + dir;
  gt.task('_compile-test', packTasks.tests(gt, dir));

  gt.exec('compile-test', gt.series('_compile', '.:_compile-test'));
  gt.exec('lint', typescriptTasks.lint(gt, dir));

  var mockAngular = {
    pattern: 'node_modules/gs-tools/src/testing/mock-angular.js',
    included: true
  };
  gt.exec('karma', gt.series(
      '_compile',
      '.:_compile-test',
      karmaTasks.watch(gt, dir, [mockAngular])));
  gt.exec('watch-test', function() {
    gt.watch(['src/**/*.ts'], gt.series('_compile', '.:compile-test'));
  });
  gt.exec('test', gt.parallel('.:watch-test', '.:karma'));
};

gulp.task('_compile', typescriptTasks.compile(gulp));

module.exports = tasks;

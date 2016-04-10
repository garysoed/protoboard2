var gn = require('./node_modules/gs-tools/gulp/gulp-node')(__dirname, require('gulp'));
var fileTasks = require('./node_modules/gs-tools/gulp-tasks/file')(require('gulp-concat'));
var karmaTasks = require('./node_modules/gs-tools/gulp-tasks/karma')(
    require('karma').Server);
var sassTasks = require('./node_modules/gs-tools/gulp-tasks/sass')(
    require('gulp-concat'),
    require('gulp-sass'));
var packTasks = require('./node_modules/gs-tools/gulp-tasks/pack')(
    require('vinyl-named'),
    require('gulp-sourcemaps'),
    require('gulp-webpack'));
var tasks = require('./gulptasks');

gn.exec('compile-test', gn.series(
    '_compile',
    gn.parallel(
        'src:compile-test',
        'src/game:compile-test'
    )));

gn.exec('lint', gn.parallel(
    'src:lint',
    'src/game:lint'
));

var mockAngular = {
  pattern: 'node_modules/gs-tools/src/testing/mock-angular.js',
  included: true
};
gn.exec('test', gn.series('.:compile-test', karmaTasks.once(gn, '**', [mockAngular])));
gn.exec('karma', gn.series('.:compile-test', karmaTasks.watch(gn, '**', [mockAngular])));
gn.exec('compile', gn.series('_compile'));

gn.exec('compile-ui', gn.series(
    gn.parallel(
        '_compile',
        sassTasks.compile(gn, 'src/**')),
    packTasks.app(gn, ['src/main.js'], 'js.js')));


gn.exec('watch', gn.series(
    '.:compile-ui',
    function _watch() {
      gn.watch(['src/**/*'], gn.series('.:compile-ui'));
    }));

gn.exec('watch-test', gn.series(
    '.:compile-test',
    function _watch() {
      gn.watch(['src/**/*.ts'], gn.series('.:compile-test'));
    }));

gn.exec('default', gn.exec('compile-ui'));

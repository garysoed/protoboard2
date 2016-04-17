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
var typedocTasks = require('./node_modules/gs-tools/gulp-tasks/typedoc')(
    require('gulp-concat'),
    require('gulp-sass'),
    require('gulp-typedoc'));

gn.exec('compile-test', gn.series(
    '_compile',
    gn.parallel(
        'src/component:compile-test',
        'src/game:compile-test'
    )));

gn.exec('lint', gn.parallel(
    'src:lint',
    'src/component:lint',
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
        sassTasks.compile(gn, 'src/**', 'out', true),
        fileTasks.copy(gn, [
          'node_modules/x-tag/dist/x-tag-core-with-shadowdom.js',
          'src/**/*.html'
        ])),
    packTasks.app(gn, ['src/main.js'], 'js.js')));

gn.exec(
    'doc',
    typedocTasks.compile(
        gn,
        [
          '!src/test-base.ts',
          'node_modules/typescript/lib/lib.es6.d.ts',
          'node_modules/gs-tools/declarations/*.d.ts'
        ],
        'Protoboard 2',
        'strawberry',
        'node_modules/gs-tools/src/**/*.ts'));

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

var gn = require('../../node_modules/gs-tools/gulp/gulp-node')(__dirname, require('gulp'));
var tasks = require('../../gulptasks');

tasks.allTests(gn, 'util');

module.exports = function(config) {
  config.set({
    frameworks: ['jasmine', 'gs'],
    files: [
      {pattern: 'out/bundle-test.js', watched: true, included: true},
      {pattern: 'out/bundle-test.js.map', watched: true, included: false},
      {pattern: 'test.css', watched: true, included: true, type: 'css'},
    ],
    exclude: [
    ],
    preprocessors: {
    },
    plugins: [
      require('karma-jasmine'),
      require('karma-sourcemap-loader'),
      require('karma-chrome-launcher'),
      require('dev/karma-reporter'),
      require('gs-testing/karma-gs-framework'),
    ],
    port: 8888,
    reporters: ['gs'],
    browsers: ['ChromeHeadless'],
    singleRun: false,
  });
};

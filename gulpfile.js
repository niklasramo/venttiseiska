var fs = require('fs');
var gulp = require('gulp');
var jscs = require('gulp-jscs');
var karma = require('karma');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var size = require('gulp-size');
var runSequence = require('run-sequence');
var mocha = require('mocha');
var argv = require('yargs').argv;
var fileExists = function (filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

// Load environment variables if .env file exists
if (fileExists('./.env')) {
  require('dotenv').load();
}

gulp.task('validate', function () {

  return gulp
  .src('./venttiseiska.js')
  .pipe(jscs())
  .pipe(jscs.reporter());

});

gulp.task('benchmark', function (done) {

  require('./benchmarks/tests.js')(done);

});

gulp.task('compress', function() {

  return gulp
  .src('./venttiseiska.js')
  .pipe(size({title: 'development'}))
  .pipe(uglify({
    preserveComments: 'some'
  }))
  .pipe(size({title: 'minified'}))
  .pipe(size({title: 'gzipped', gzip: true}))
  .pipe(rename('venttiseiska.min.js'))
  .pipe(gulp.dest('./'));

});

gulp.task('test-local', function (done) {

  var opts = {
    configFile: __dirname + '/karma.local-conf.js',
    action: 'run'
  };

  if (argv.reporters) {
    opts.reporters = argv.reporters.split(',');
  }

  if (argv.browsers) {
    opts.browsers = argv.browsers.split(',');
  }

  (new karma.Server(opts, function (exitCode) {
    done(exitCode);
  })).start();

});

gulp.task('test-node', function (done) {

  var m = new mocha({ui: 'qunit'});
  m.addFile('./tests/tests.js');
  m.run(function (exitCode) {
    done(exitCode);
  });

});

gulp.task('test-sauce', function (done) {

  var opts = {
    configFile: __dirname + '/karma.sauce-conf.js',
    action: 'run'
  };

  if (argv.reporters) {
    opts.reporters = argv.reporters.split(',');
  }

  if (argv.browsers) {
    opts.browsers = require('./karma.sauce-browsers.js').getBrowsers(argv.browsers);
  }

  (new karma.Server(opts, function (exitCode) {
    done(exitCode);
  })).start();

});

gulp.task('default', function (done) {

  runSequence('validate', 'test-node', 'test-sauce', done);

});
module.exports = function (done) {

  var Benchmark = require('benchmark');
  var Venttiseiska = require('../venttiseiska.js');
  var EventEmitter = require('events');
  var EventEmitter2 = require('eventemitter2').EventEmitter2;
  var testSuite = new Benchmark.Suite();

  // Setup emitters.
  var emitter217 = new Venttiseiska();
  var emitterDefault = new EventEmitter();
  emitterDefault.setMaxListeners(Infinity);
  var emitter2 = new EventEmitter2();
  emitter2.setMaxListeners(0);
  var listenerFn = function () {};
  var listenerEvent = 'a';

  // Setup listeners.
  for (var i = 0; i < 10; i++) {
    emitter217.on(listenerEvent, listenerFn);
    emitterDefault.on(listenerEvent, listenerFn);
    emitter2.on(listenerEvent, listenerFn);
  }

  //
  // Tests
  //

  testSuite.add({
    name: 'Venttiseiska - Emit event',
    fn: function () {
      emitter217.emit(listenerEvent);
    }
  });

  testSuite.add({
    name: 'Venttiseiska - Emit event with one argument',
    fn: function () {
      emitter217.emit(listenerEvent, ['a']);
    }
  });

  testSuite.add({
    name: 'Venttiseiska - Emit event with ten arguments',
    fn: function () {
      emitter217.emit(listenerEvent, ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']);
    }
  });

  testSuite.add({
    name: 'EventEmitter2 - Emit event',
    fn: function () {
      emitter2.emit(listenerEvent);
    }
  });

  testSuite.add({
    name: 'EventEmitter2 - Emit event with one argument',
    fn: function () {
      emitter2.emit(listenerEvent, 'a');
    }
  });

  testSuite.add({
    name: 'EventEmitter2 - Emit event with ten arguments',
    fn: function () {
      emitterDefault.emit(listenerEvent, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j');
    }
  });

  testSuite.add({
    name: 'Default - Emit event',
    fn: function () {
      emitterDefault.emit(listenerEvent);
    }
  });

  testSuite.add({
    name: 'Default - Emit event with one argument',
    fn: function () {
      emitterDefault.emit(listenerEvent, 'a');
    }
  });

  testSuite.add({
    name: 'Default - Emit event with ten arguments',
    fn: function () {
      emitterDefault.emit(listenerEvent, 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j');
    }
  });

  //
  // Init
  //

  testSuite
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    if (typeof done === 'function') {
      done();
    }
  })
  .run({async: true});

};

(function (global, factory) {

  // Node setup.
  if (typeof module === 'object' && module.exports) {

    var QUnit = {
      config: {},
      module: global.suite,
      test: global.test,
      assert: require('assert')
    };

    factory(global, QUnit, require('../venttiseiska.js'), true);

  }
  // Browser setup.
  else {

    factory(global, global.QUnit, Venttiseiska);

  }

}(typeof window === 'object' && window.window || global, function (glob, Q, Venttiseiska, isNode) {

  function normalizeAssert(assert) {

    if (isNode) {

      return {
        assert: Q.assert,
        done: assert,
        expect: function (val) {
          // TODO: https://github.com/mochajs/mocha/wiki/Assertion-counting
        }
      };

    }
    else {

      return {
        assert: assert,
        done: assert.async(),
        expect: function (val) {
          assert.expect(val);
        }
      };

    }

  }

  Q.config.reorder = false;

  Q.module('emitter.on()');

  Q.test('should instantiate and return an array of listener objects', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(12);

    var emitter = new Venttiseiska();
    var retSingleA = emitter.on('a', function () {});
    var retSingleB = emitter.on(['a'], function () {});
    var retMultiA = emitter.on('a b c', function () {});
    var retMultiB = emitter.on(['a', 'b', 'c'], function () {});
    var combined = retSingleA.concat(retSingleB).concat(retMultiA).concat(retMultiB);

    // Make sure all return values are arrays.
    test.assert.strictEqual(retSingleA instanceof Array, true);
    test.assert.strictEqual(retSingleB instanceof Array, true);
    test.assert.strictEqual(retMultiA instanceof Array, true);
    test.assert.strictEqual(retMultiB instanceof Array, true);

    // Make sure all items in the arrays are instances of Venttiseiska.Listener.
    combined.forEach(function (item) {
      test.assert.strictEqual(item instanceof Venttiseiska.Listener, true);
    });

    test.done();

  });

  Q.test('should instantiate listeners with correct default values', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = emitter.on('a', listenerFn)[0].inspect();

    test.assert.strictEqual(typeof listener.id, 'number');
    test.assert.strictEqual(listener.emitter, emitter);
    test.assert.strictEqual(listener.event, 'a');
    test.assert.strictEqual(listener.fn, listenerFn);
    test.assert.strictEqual(listener.tags instanceof Array, true);
    test.assert.strictEqual(listener.tags.length, 0);
    test.assert.strictEqual(listener.context, undefined);
    test.assert.strictEqual(listener.cycles, 0);
    test.assert.strictEqual(listener.active, true);
    test.assert.strictEqual(listener.bound, true);

    test.done();

  });

  Q.test('should pass tags to listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(4);

    var emitter = new Venttiseiska();
    var retA = emitter.on('a:tagA b:tagA:tagB', function () {});
    var retB = emitter.on(['a:tagA', 'b:tagA:tagB'], function () {});
    var combined = retA.concat(retB);

    combined.forEach(function (listener, i) {
      var tags = listener.inspect().tags;
      if (i == 0 || i == 2) {
        test.assert.deepEqual(tags, ['tagA']);
      }
      else {
        test.assert.deepEqual(tags, ['tagA', 'tagB']);
      }
    });

    test.done();

  });

  Q.test('should pass context to listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(3);

    var emitter = new Venttiseiska();
    var ctx = {};
    var retA = emitter.on('a', function () {}, ctx);
    var retB = emitter.on(['a'], function () {}, ctx);
    var retC = emitter.on({
      events: 'a',
      fn: function () {},
      context: ctx
    });
    var combined = retA.concat(retB).concat(retC);

    combined.forEach(function (listener, i) {
      test.assert.strictEqual(listener.inspect().context, ctx);
    });

    test.done();

  });

  Q.test('should pass cycles to listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listener = emitter.on({
      events: 'a',
      fn: function () {},
      cycles: 5
    })[0];

    test.assert.strictEqual(listener.inspect().cycles, 5);

    test.done();

  });

  Q.module('emitter.once()');

  Q.test('should instantiate and return an array of listener objects', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(12);

    var emitter = new Venttiseiska();
    var retSingleA = emitter.once('a', function () {});
    var retSingleB = emitter.once(['a'], function () {});
    var retMultiA = emitter.once('a b c', function () {});
    var retMultiB = emitter.once(['a', 'b', 'c'], function () {});
    var combined = retSingleA.concat(retSingleB).concat(retMultiA).concat(retMultiB);

    // Make sure all return values are arrays.
    test.assert.strictEqual(retSingleA instanceof Array, true);
    test.assert.strictEqual(retSingleB instanceof Array, true);
    test.assert.strictEqual(retMultiA instanceof Array, true);
    test.assert.strictEqual(retMultiB instanceof Array, true);

    // Make sure all items in the arrays are instances of Venttiseiska.Listener.
    combined.forEach(function (item) {
      test.assert.strictEqual(item instanceof Venttiseiska.Listener, true);
    });

    test.done();

  });

  Q.test('should instantiate listeners with correct default values', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = emitter.once('a', listenerFn)[0].inspect();

    test.assert.strictEqual(typeof listener.id, 'number');
    test.assert.strictEqual(listener.emitter, emitter);
    test.assert.strictEqual(listener.event, 'a');
    test.assert.strictEqual(listener.fn, listenerFn);
    test.assert.strictEqual(listener.tags instanceof Array, true);
    test.assert.strictEqual(listener.tags.length, 0);
    test.assert.strictEqual(listener.context, undefined);
    test.assert.strictEqual(listener.cycles, 1);
    test.assert.strictEqual(listener.active, true);
    test.assert.strictEqual(listener.bound, true);

    test.done();

  });

  Q.test('should pass tags to listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(4);

    var emitter = new Venttiseiska();
    var retA = emitter.once('a:tagA b:tagA:tagB', function () {});
    var retB = emitter.once(['a:tagA', 'b:tagA:tagB'], function () {});
    var combined = retA.concat(retB);

    combined.forEach(function (listener, i) {
      var tags = listener.inspect().tags;
      if (i == 0 || i == 2) {
        test.assert.deepEqual(tags, ['tagA']);
      }
      else {
        test.assert.deepEqual(tags, ['tagA', 'tagB']);
      }
    });

    test.done();

  });

  Q.test('should pass context to listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(3);

    var emitter = new Venttiseiska();
    var ctx = {};
    var retA = emitter.once('a', function () {}, ctx);
    var retB = emitter.once(['a'], function () {}, ctx);
    var retC = emitter.once({
      events: 'a',
      fn: function () {},
      context: ctx
    });
    var combined = retA.concat(retB).concat(retC);

    combined.forEach(function (listener, i) {
      test.assert.strictEqual(listener.inspect().context, ctx);
    });

    test.done();

  });

  Q.module('emitter.off()');

  Q.test('should return undefined', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();

    test.assert.strictEqual(emitter.off(), undefined);

    test.done();

  });

  Q.test('should unbind all listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    emitter.on('a a a b b b c c c', function () {});
    emitter.off();

    test.assert.strictEqual(emitter.getListeners().length, 0);

    test.done();

  });

  Q.test('should unbind listeners by event', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(4);

    var emitter = new Venttiseiska();

    emitter.on('a a b b c c', function () {});
    emitter.off('b');

    emitter.getListeners().forEach(function (listener) {
      test.assert.notStrictEqual(listener.inspect().event, 'b');
    });

    test.done();

  });

  Q.test('should unbind listeners by event and tags', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(3);

    var emitter = new Venttiseiska();

    emitter.on('a a:tagA b b:tagA:tagB c c:tagA:tagB:tagC', function () {});
    emitter.off('a:tagA b:tagA c:tagA:tagC');

    emitter.getListeners().forEach(function (listener) {
      test.assert.strictEqual(listener.inspect().tags.length, 0);
    });

    test.done();

  });

  Q.test('should unbind listeners by event and function', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(3);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    emitter.on('a b c', listenerFn);
    emitter.on('a b c', listenerFn2);
    emitter.off('a b c', listenerFn2);

    emitter.getListeners().forEach(function (listener) {
      test.assert.strictEqual(listener.inspect().fn, listenerFn);
    });

    test.done();

  });

  Q.test('should unbind listeners by event and id', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(5);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};

    var id = emitter.on('a a b b c c', listenerFn)[0].inspect().id;
    emitter.off('a', id);

    emitter.getListeners().forEach(function (listener) {
      test.assert.notStrictEqual(listener.inspect().id, id);
    });

    test.done();

  });

  Q.test('should unbind listeners by event, tags and function', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    var ret = emitter.on('a:tagA a:tagB a:tagC', listenerFn);
    emitter.on('a:tagA a:tagB a:tagC', listenerFn2);
    emitter.off('a:tagA a:tagB a:tagC', listenerFn2);

    test.assert.deepEqual(emitter.getListeners(), ret);

    test.done();

  });

  Q.module('emitter.emit()');

  Q.test('should return undefined', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();

    test.assert.strictEqual(emitter.emit('a'), undefined);

    test.done();

  });

  Q.test('should invoke the targeted listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      test.assert.ok(true);
    };

    emitter.on('a', listenerFn);
    emitter.emit('a');

    test.done();

  });

  Q.test('should invoke the targeted listeners with specific tags', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();

    emitter.on('a a a:tagB a:tagB', function () {
      test.assert.ok(false);
    });

    emitter.on('a:tagA a:tagA', function () {
      test.assert.ok(true);
    });

    emitter.emit('a:tagA');

    test.done();

  });

  Q.test('should pass arguments to the listener\'s callback', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(10);

    var emitter = new Venttiseiska();
    var args = [[], {}, '', 'hello', 1, 0, true, false, undefined, null];

    for (var i = 0; i < args.length; i++) {
      var thisArgs = args.slice(0, i + 1);
      emitter.on('a' + i, function () {
        test.assert.deepEqual(Array.prototype.slice.call(arguments), thisArgs);
      });
      emitter.emit('a' + i, thisArgs);
    }

    test.done();

  });

  Q.test('should temporarily force context to the listener\'s callback', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(4);

    var emitter = new Venttiseiska();
    var listenerCtx = {};
    var emitCtx = {};
    var counter = 0;
    var listenerFn = function () {
      test.assert.strictEqual(this, counter < 2 ? emitCtx : counter === 2 ? glob : listenerCtx);
      ++counter;
    };

    emitter.on('a', listenerFn);
    emitter.on('b', listenerFn, listenerCtx);
    emitter.emit('a b', [], emitCtx);
    emitter.emit('a b');

    test.done();

  });

  Q.module('emitter.getListeners()');

  Q.test('should return all listeners in bind order', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var expected = emitter.on('a b c a b c a b c', function () {});
    var val = emitter.getListeners();

    test.assert.deepEqual(val, expected);

    test.done();

  });

  Q.test('should return listeners of specific events (optionally filtered by tags) in bind order', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();
    var listeners = emitter.on('a b:tagA c:tagA:tagB a b c:tagA a b c:tagB', function () {});
    var expected = listeners.filter(function (listener) {
      var ev = listener.inspect().event;
      var tags = listener.inspect().tags;
      return ev === 'a' ||
             (ev === 'b' && tags[0] === 'tagA') ||
             (ev === 'c' && tags[0] === 'tagA' && tags[1] === 'tagB');
    });

    test.assert.deepEqual(emitter.getListeners('a b:tagA c:tagA:tagB'), expected);
    test.assert.deepEqual(emitter.getListeners(['a', 'b:tagA' ,'c:tagA:tagB']), expected);

    test.done();

  });

  Q.module('emitter.getEvents()');

  Q.test('should return all events which have listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();

    emitter.on('a b c', function () {});
    test.assert.deepEqual(emitter.getEvents(), ['a', 'b', 'c']);

    emitter.off('a');
    test.assert.deepEqual(emitter.getEvents(), ['b', 'c']);

    test.done();

  });

  Q.module('listener');

  Q.test('should instantiate a listener', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    test.assert.strictEqual(listener, emitter.getListeners()[0]);

    test.done();

  });

  Q.test('should instantiate listener with correct default values', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = (new Venttiseiska.Listener(emitter, 'a', listenerFn)).inspect();

    test.assert.strictEqual(typeof listener.id, 'number');
    test.assert.strictEqual(listener.emitter, emitter);
    test.assert.strictEqual(listener.event, 'a');
    test.assert.strictEqual(listener.fn, listenerFn);
    test.assert.strictEqual(listener.tags instanceof Array, true);
    test.assert.strictEqual(listener.tags.length, 0);
    test.assert.strictEqual(listener.context, undefined);
    test.assert.strictEqual(listener.cycles, 0);
    test.assert.strictEqual(listener.active, true);
    test.assert.strictEqual(listener.bound, true);

    test.done();

  });

  Q.test('should accept tags as the fourth argument', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerTags = ['a', 'b'];
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, listenerTags);

    test.assert.deepEqual(listener.inspect().tags, listenerTags);

    test.done();

  });

  Q.test('should accept context as the fifth argument', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCtx = {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, null, listenerCtx);

    test.assert.strictEqual(listener.inspect().context, listenerCtx);

    test.done();

  });

  Q.test('should accept cycles as the sixth argument', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, null, undefined, 5);

    test.assert.strictEqual(listener.inspect().cycles, 5);

    test.done();

  });

  Q.test('should accept configuration object as the first argument', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(9);

    var emitter = new Venttiseiska();
    var listenerEvent = 'a';
    var listenerFn = function () {};
    var listenerCtx = {};
    var listenerTags = ['a', 'b'];
    var listener = (new Venttiseiska.Listener({
      emitter: emitter,
      event: listenerEvent,
      fn: listenerFn,
      tags: listenerTags,
      context: listenerCtx,
      cycles: 5
    })).inspect();

    test.assert.strictEqual(typeof listener.id, 'number');
    test.assert.strictEqual(listener.emitter, emitter);
    test.assert.strictEqual(listener.event, listenerEvent);
    test.assert.strictEqual(listener.fn, listenerFn);
    test.assert.deepEqual(listener.tags, listenerTags);
    test.assert.strictEqual(listener.context, listenerCtx);
    test.assert.strictEqual(listener.cycles, 5);
    test.assert.strictEqual(listener.active, true);
    test.assert.strictEqual(listener.bound, true);

    test.done();

  });

  Q.test('should unbind itself after cycles are depleted', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();
    var listenerEvent = 'a';
    var counter = 0;
    var listenerFn = function () {
      ++counter;
    };
    var listener = new Venttiseiska.Listener({
      emitter: emitter,
      event: listenerEvent,
      fn: listenerFn,
      cycles: 2
    });

    // Emit twice.
    listener.emit().emit();

    // Should be unbound after two times.
    test.assert.strictEqual(listener.inspect().bound, false);

    // Emit twice again.
    listener.emit().emit();

    // Callback should only have triggered two times in total.
    test.assert.strictEqual(counter, 2);

    test.done();

  });

  Q.module('listener.off()');

  Q.test('should be chainable', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    test.assert.strictEqual(listener.off(), listener);

    test.done();

  });

  Q.test('should unbind itself', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.off();

    test.assert.strictEqual(emitter.getListeners().length, 0);
    test.assert.strictEqual(listener.inspect().bound, false);

    test.done();

  });

  Q.module('listener.emit()');

  Q.test('should be chainable', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    test.assert.strictEqual(listener.emit(), listener);

    test.done();

  });

  Q.test('should invoke the targeted listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      test.assert.ok(true);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.emit();

    test.done();

  });

  Q.test('should pass arguments to the listener\'s callback', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(10);

    var emitter = new Venttiseiska();
    var args = [[], {}, '', 'hello', 1, 0, true, false, undefined, null];
    var listenerFn = function () {
      Array.prototype.slice.call(arguments).forEach(function (val, i) {
        test.assert.strictEqual(val, args[i]);
      });
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.emit(args);

    test.done();

  });

  Q.test('should temporarily force context to the listener\'s callback', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();
    var listenerCtx = {};
    var emitCtx = {};
    var listenerFn = function (forcedContext) {
      test.assert.strictEqual(this, forcedContext ? emitCtx : listenerCtx);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], listenerCtx);

    listener.emit([true], emitCtx);
    listener.emit();

    test.done();

  });

  Q.test('should not invoke callbacks of inactive listeners', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(0);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      test.assert.strictEqual(1, 0);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({active: false}).emit();

    test.done();

  });

  Q.module('listener.update()');

  Q.test('should be chainable', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    test.assert.strictEqual(listener.update(), listener);

    test.done();

  });

  Q.test('should update callback function', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({fn: listenerFn2});

    test.assert.strictEqual(listener.inspect().fn, listenerFn2);

    test.done();

  });

  Q.test('should update tags', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerTagsA = ['a', 'b', 'c'];
    var listenerTagsB = ['d', 'e', 'f'];
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, listenerTagsA);

    listener.update({tags: listenerTagsB});

    test.assert.deepEqual(listener.inspect().tags, listenerTagsB);

    test.done();

  });

  Q.test('should update context', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCtxA = {};
    var listenerCtxB = {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], listenerCtxA);

    listener.update({context: listenerCtxB});

    test.assert.strictEqual(listener.inspect().context, listenerCtxB);

    test.done();

  });

  Q.test('should update cycles', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCyclesA = 10;
    var listenerCyclesB = 5;
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], undefined, listenerCyclesA);

    listener.update({cycles: listenerCyclesB});

    test.assert.strictEqual(listener.inspect().cycles, listenerCyclesB);

    test.done();

  });

  Q.test('should update active state', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({active: false});

    test.assert.strictEqual(listener.inspect().active, false);

    test.done();

  });

  Q.test('should not update id', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);
    var id = listener.inspect().id;

    listener.update({id: id + 1});

    test.assert.strictEqual(listener.inspect().id, id);

    test.done();

  });

  Q.test('should not update emitter', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({emitter: new Venttiseiska()});

    test.assert.strictEqual(listener.inspect().emitter, emitter);

    test.done();

  });

  Q.test('should not update event', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({event: 'b'});

    test.assert.strictEqual(listener.inspect().event, 'a');

    test.done();

  });

  Q.test('should not update bound state', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({bound: false});

    test.assert.strictEqual(listener.inspect().bound, true);

    test.done();

  });

  Q.module('listener.inspect()');

  Q.test('should return a plain object with correct properties', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(11);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    var inspect = listener.inspect();

    test.assert.strictEqual(typeof inspect === 'object' && Object.prototype.toString.call(inspect) === '[object Object]', true);
    test.assert.strictEqual(typeof inspect.id, 'number');
    test.assert.strictEqual(inspect.emitter, emitter);
    test.assert.strictEqual(inspect.event, 'a');
    test.assert.strictEqual(inspect.fn, listenerFn);
    test.assert.strictEqual(inspect.tags instanceof Array, true);
    test.assert.strictEqual(inspect.tags.length, 0);
    test.assert.strictEqual(inspect.context, undefined);
    test.assert.strictEqual(inspect.cycles, 0);
    test.assert.strictEqual(inspect.active, true);
    test.assert.strictEqual(inspect.bound, true);

    test.done();

  });

  Q.test('should return a clone of the real tags array', function (assert) {

    var test = normalizeAssert(assert);

    test.expect(2);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);
    var inspect = listener.inspect();

    inspect.tags.push('tagA');

    test.assert.strictEqual(listener.inspect().tags instanceof Array, true);
    test.assert.strictEqual(listener.inspect().tags.length, 0);

    test.done();

  });

}));
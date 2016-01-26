(function (Q) {

  QUnit.config.reorder = false;

  QUnit.module('emitter');

  Q.test('should have an empty listeners object', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();

    assert.strictEqual(Object.prototype.toString.call(emitter._listeners), '[object Object]');
    assert.strictEqual(Object.keys(emitter._listeners).length, 0);

  });

  QUnit.module('emitter.on()');

  Q.test('should instantiate and return an array of listener objects', function (assert) {

    assert.expect(12);

    var emitter = new Venttiseiska();
    var retSingleA = emitter.on('a', function () {});
    var retSingleB = emitter.on(['a'], function () {});
    var retMultiA = emitter.on('a b c', function () {});
    var retMultiB = emitter.on(['a', 'b', 'c'], function () {});
    var combined = retSingleA.concat(retSingleB).concat(retMultiA).concat(retMultiB);

    // Make sure all return values ar truly arrays.
    assert.strictEqual(retSingleA instanceof Array, true);
    assert.strictEqual(retSingleB instanceof Array, true);
    assert.strictEqual(retMultiA instanceof Array, true);
    assert.strictEqual(retMultiB instanceof Array, true);

    // Make sure all items in the arrays are truly instances of Venttiseiska.Listener.
    combined.forEach(function (item) {
      assert.strictEqual(item instanceof Venttiseiska.Listener, true);
    });

    // TODO: Check correlation with internal _listeners object.

  });

  Q.test('should instantiate listeners with correct default values', function (assert) {

    assert.expect(9);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = emitter.on('a', listenerFn)[0];

    assert.strictEqual(typeof listener._id, 'number');
    assert.strictEqual(listener._emitter, emitter);
    assert.strictEqual(listener._event, 'a');
    assert.strictEqual(listener._fn, listenerFn);
    assert.strictEqual(listener._tags instanceof Array, true);
    assert.strictEqual(listener._tags.length, 0);
    assert.strictEqual(listener._context, undefined);
    assert.strictEqual(listener._cycles, 0);
    assert.strictEqual(listener._active, true);

  });

  Q.test('should pass tags to listeners', function (assert) {

    assert.expect(8);

    var emitter = new Venttiseiska();
    var retA = emitter.on('a:tagA b:tagA:tagB', function () {});
    var retB = emitter.on(['a:tagA', 'b:tagA:tagB'], function () {});
    var combined = retA.concat(retB);

    combined.forEach(function (item, i) {
      if (i == 0 || i == 2) {
        assert.strictEqual(item._tags.length, 1);
        assert.deepEqual(item._tags, ['tagA']);
      }
      else {
        assert.strictEqual(item._tags.length, 2);
        assert.deepEqual(item._tags, ['tagA', 'tagB']);
      }
    });

  });

  Q.test('should pass context to listeners', function (assert) {

    assert.expect(3);

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

    combined.forEach(function (item, i) {
      assert.strictEqual(item._context, ctx);
    });

  });

  Q.test('should pass cycles to listeners', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listener = emitter.on({
      events: 'a',
      fn: function () {},
      cycles: 5
    })[0];

    assert.strictEqual(listener._cycles, 5);

  });

  QUnit.module('emitter.once()');

  // TODO

  QUnit.module('emitter.off()');

  Q.test('should return undefined', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();

    assert.strictEqual(emitter.off(), undefined);

  });

  Q.test('should unbind all listeners', function (assert) {

    assert.expect(3);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;
    emitter.on('a a a b b b c c c', function () {});
    emitter.off();

    for (var eventName in listeners) {
      if (listeners.hasOwnProperty(eventName)) {
        assert.strictEqual(listeners[eventName].length, 0);
      }
    }

  });

  Q.test('should unbind listeners by event', function (assert) {

    assert.expect(3);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;

    emitter.on('a a a b b b c c c', function () {});
    emitter.off('b');

    for (var eventName in listeners) {
      if (listeners.hasOwnProperty(eventName)) {
        assert.strictEqual(listeners[eventName].length, eventName === 'b' ? 0 : 3);
      }
    }

  });

  Q.test('should unbind listeners by event and tags', function (assert) {

    assert.expect(6);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;

    emitter.on('a a:tagA b b:tagA:tagB c c:tagA:tagB:tagC', function () {});
    emitter.off('a:tagA b:tagA c:tagA:tagC');

    for (var eventName in listeners) {
      if (listeners.hasOwnProperty(eventName)) {
        assert.strictEqual(listeners[eventName].length, 1);
        assert.strictEqual(listeners[eventName][0]._tags.length, 0);
      }
    }

  });

  Q.test('should unbind listeners by event and function', function (assert) {

    assert.expect(6);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    emitter.on('a b c', listenerFn);
    emitter.on('a b c', listenerFn2);
    emitter.off('a b c', listenerFn2);

    for (var eventName in listeners) {
      if (listeners.hasOwnProperty(eventName)) {
        assert.strictEqual(listeners[eventName].length, 1);
        assert.strictEqual(listeners[eventName][0]._fn, listenerFn);
      }
    }

  });

  Q.test('should unbind listeners by event and id', function (assert) {

    assert.expect(8);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;
    var listenerFn = function () {};

    var id = emitter.on('a a b b c c', listenerFn)[0]._id;
    emitter.off('a', id);

    for (var eventName in listeners) {
      if (listeners.hasOwnProperty(eventName)) {
        assert.strictEqual(listeners[eventName].length, eventName === 'a' ? 1 : 2);
        listeners[eventName].forEach(function (listener) {
          assert.notStrictEqual(listener._id, id);
        });
      }
    }

  });

  Q.test('should unbind listeners by event, tags and function', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listeners = emitter._listeners;
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    var ret = emitter.on('a:tagA a:tagB a:tagC', listenerFn);
    emitter.on('a:tagA a:tagB a:tagC', listenerFn2);
    emitter.off('a:tagA a:tagB a:tagC', listenerFn2);

    assert.deepEqual(listeners['a'], ret);

  });

  QUnit.module('emitter.emit()');

  Q.test('should return undefined', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();

    assert.strictEqual(emitter.emit('a'), undefined);

  });

  Q.test('should invoke the targeted listeners', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      assert.ok(true);
    };

    emitter.on('a', listenerFn);
    emitter.emit('a');

  });

  Q.test('should pass arguments to the listener\'s callback', function (assert) {

    assert.expect(10);

    var emitter = new Venttiseiska();
    var args = [[], {}, '', 'hello', 1, 0, true, false, undefined, null];
    var listenerFn = function () {
      Array.prototype.slice.call(arguments).forEach(function (val, i) {
        assert.strictEqual(val, args[i]);
      });
    };

    emitter.on('a', listenerFn);
    emitter.emit('a', args);

  });

  Q.test('should temporarily force context to the listener\'s callback', function (assert) {

    assert.expect(4);

    var emitter = new Venttiseiska();
    var listenerCtx = {};
    var emitCtx = {};
    var counter = 0;
    var listenerFn = function () {
      assert.strictEqual(this, counter < 2 ? emitCtx : counter === 2 ? window : listenerCtx);
      ++counter;
    };

    emitter.on('a', listenerFn);
    emitter.on('b', listenerFn, listenerCtx);
    emitter.emit('a b', [], emitCtx);
    emitter.emit('a b');

  });

  QUnit.module('emitter.getListeners()');

  Q.test('should return all listeners in bind order', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var expected = emitter.on('a b c a b c a b c', function () {});
    var val = emitter.getListeners();

    assert.deepEqual(val, expected);

  });

  Q.test('should return listeners of specific events (optionally filtered by tags) in bind order', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();
    var listeners = emitter.on('a b:tagA c:tagA:tagB a b c:tagA a b c:tagB', function () {});
    var expected = listeners.filter(function (item) {
      return item._event === 'a' ||
             (item._event === 'b' && item._tags[0] === 'tagA') ||
             (item._event === 'c' && item._tags[0] === 'tagA' && item._tags[1] === 'tagB');
    });

    assert.deepEqual(emitter.getListeners('a b:tagA c:tagA:tagB'), expected);
    assert.deepEqual(emitter.getListeners(['a', 'b:tagA' ,'c:tagA:tagB']), expected);

  });

  QUnit.module('emitter.getEvents()');

  Q.test('should return all events which have listeners', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();

    emitter.on('a b c', function () {});
    assert.deepEqual(emitter.getEvents(), ['a', 'b', 'c']);

    emitter.off('a');
    assert.deepEqual(emitter.getEvents(), ['b', 'c']);

  });

  // TODO

  QUnit.module('listener');

  // TODO

  QUnit.module('listener.off()');

  // TODO

  QUnit.module('listener.emit()');

  // TODO

  QUnit.module('listener.update()');

  // TODO

  QUnit.module('listener.inspect()');

  // TODO

})(QUnit);
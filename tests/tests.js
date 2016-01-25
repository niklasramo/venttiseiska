(function (Q) {

  // Tests

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

  });

  Q.test('should pass arguments to the listener\'s callback', function (assert) {

  });

  Q.test('should pass context to the listener\'s callback', function (assert) {

  });

  QUnit.module('emitter.getListeners()');

  // TODO

  QUnit.module('emitter.getEvents()');

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
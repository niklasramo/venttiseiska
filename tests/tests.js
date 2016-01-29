(function (Q, glob) {

  QUnit.config.reorder = false;

  QUnit.module('emitter.on()');

  Q.test('should instantiate and return an array of listener objects', function (assert) {

    assert.expect(12);

    var emitter = new Venttiseiska();
    var retSingleA = emitter.on('a', function () {});
    var retSingleB = emitter.on(['a'], function () {});
    var retMultiA = emitter.on('a b c', function () {});
    var retMultiB = emitter.on(['a', 'b', 'c'], function () {});
    var combined = retSingleA.concat(retSingleB).concat(retMultiA).concat(retMultiB);

    // Make sure all return values are arrays.
    assert.strictEqual(retSingleA instanceof Array, true);
    assert.strictEqual(retSingleB instanceof Array, true);
    assert.strictEqual(retMultiA instanceof Array, true);
    assert.strictEqual(retMultiB instanceof Array, true);

    // Make sure all items in the arrays are instances of Venttiseiska.Listener.
    combined.forEach(function (item) {
      assert.strictEqual(item instanceof Venttiseiska.Listener, true);
    });

  });

  Q.test('should instantiate listeners with correct default values', function (assert) {

    assert.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = emitter.on('a', listenerFn)[0].inspect();

    assert.strictEqual(typeof listener.id, 'number');
    assert.strictEqual(listener.emitter, emitter);
    assert.strictEqual(listener.event, 'a');
    assert.strictEqual(listener.fn, listenerFn);
    assert.strictEqual(listener.tags instanceof Array, true);
    assert.strictEqual(listener.tags.length, 0);
    assert.strictEqual(listener.context, undefined);
    assert.strictEqual(listener.cycles, 0);
    assert.strictEqual(listener.active, true);
    assert.strictEqual(listener.bound, true);

  });

  Q.test('should pass tags to listeners', function (assert) {

    assert.expect(4);

    var emitter = new Venttiseiska();
    var retA = emitter.on('a:tagA b:tagA:tagB', function () {});
    var retB = emitter.on(['a:tagA', 'b:tagA:tagB'], function () {});
    var combined = retA.concat(retB);

    combined.forEach(function (listener, i) {
      var tags = listener.inspect().tags;
      if (i == 0 || i == 2) {
        assert.deepEqual(tags, ['tagA']);
      }
      else {
        assert.deepEqual(tags, ['tagA', 'tagB']);
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

    combined.forEach(function (listener, i) {
      assert.strictEqual(listener.inspect().context, ctx);
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

    assert.strictEqual(listener.inspect().cycles, 5);

  });

  QUnit.module('emitter.once()');

  Q.test('should instantiate and return an array of listener objects', function (assert) {

    assert.expect(12);

    var emitter = new Venttiseiska();
    var retSingleA = emitter.once('a', function () {});
    var retSingleB = emitter.once(['a'], function () {});
    var retMultiA = emitter.once('a b c', function () {});
    var retMultiB = emitter.once(['a', 'b', 'c'], function () {});
    var combined = retSingleA.concat(retSingleB).concat(retMultiA).concat(retMultiB);

    // Make sure all return values are arrays.
    assert.strictEqual(retSingleA instanceof Array, true);
    assert.strictEqual(retSingleB instanceof Array, true);
    assert.strictEqual(retMultiA instanceof Array, true);
    assert.strictEqual(retMultiB instanceof Array, true);

    // Make sure all items in the arrays are instances of Venttiseiska.Listener.
    combined.forEach(function (item) {
      assert.strictEqual(item instanceof Venttiseiska.Listener, true);
    });

  });

  Q.test('should instantiate listeners with correct default values', function (assert) {

    assert.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = emitter.once('a', listenerFn)[0].inspect();

    assert.strictEqual(typeof listener.id, 'number');
    assert.strictEqual(listener.emitter, emitter);
    assert.strictEqual(listener.event, 'a');
    assert.strictEqual(listener.fn, listenerFn);
    assert.strictEqual(listener.tags instanceof Array, true);
    assert.strictEqual(listener.tags.length, 0);
    assert.strictEqual(listener.context, undefined);
    assert.strictEqual(listener.cycles, 1);
    assert.strictEqual(listener.active, true);
    assert.strictEqual(listener.bound, true);

  });

  Q.test('should pass tags to listeners', function (assert) {

    assert.expect(4);

    var emitter = new Venttiseiska();
    var retA = emitter.once('a:tagA b:tagA:tagB', function () {});
    var retB = emitter.once(['a:tagA', 'b:tagA:tagB'], function () {});
    var combined = retA.concat(retB);

    combined.forEach(function (listener, i) {
      var tags = listener.inspect().tags;
      if (i == 0 || i == 2) {
        assert.deepEqual(tags, ['tagA']);
      }
      else {
        assert.deepEqual(tags, ['tagA', 'tagB']);
      }
    });

  });

  Q.test('should pass context to listeners', function (assert) {

    assert.expect(3);

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
      assert.strictEqual(listener.inspect().context, ctx);
    });

  });

  QUnit.module('emitter.off()');

  Q.test('should return undefined', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();

    assert.strictEqual(emitter.off(), undefined);

  });

  Q.test('should unbind all listeners', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    emitter.on('a a a b b b c c c', function () {});
    emitter.off();

    assert.strictEqual(emitter.getListeners().length, 0);

  });

  Q.test('should unbind listeners by event', function (assert) {

    assert.expect(4);

    var emitter = new Venttiseiska();

    emitter.on('a a b b c c', function () {});
    emitter.off('b');

    emitter.getListeners().forEach(function (listener) {
      assert.notStrictEqual(listener.inspect().event, 'b');
    });

  });

  Q.test('should unbind listeners by event and tags', function (assert) {

    assert.expect(3);

    var emitter = new Venttiseiska();

    emitter.on('a a:tagA b b:tagA:tagB c c:tagA:tagB:tagC', function () {});
    emitter.off('a:tagA b:tagA c:tagA:tagC');

    emitter.getListeners().forEach(function (listener) {
      assert.strictEqual(listener.inspect().tags.length, 0);
    });

  });

  Q.test('should unbind listeners by event and function', function (assert) {

    assert.expect(3);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    emitter.on('a b c', listenerFn);
    emitter.on('a b c', listenerFn2);
    emitter.off('a b c', listenerFn2);

    emitter.getListeners().forEach(function (listener) {
      assert.strictEqual(listener.inspect().fn, listenerFn);
    });

  });

  Q.test('should unbind listeners by event and id', function (assert) {

    assert.expect(5);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};

    var id = emitter.on('a a b b c c', listenerFn)[0].inspect().id;
    emitter.off('a', id);

    emitter.getListeners().forEach(function (listener) {
      assert.notStrictEqual(listener.inspect().id, id);
    });

  });

  Q.test('should unbind listeners by event, tags and function', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};

    var ret = emitter.on('a:tagA a:tagB a:tagC', listenerFn);
    emitter.on('a:tagA a:tagB a:tagC', listenerFn2);
    emitter.off('a:tagA a:tagB a:tagC', listenerFn2);

    assert.deepEqual(emitter.getListeners(), ret);

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
      assert.strictEqual(this, counter < 2 ? emitCtx : counter === 2 ? glob : listenerCtx);
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
    var expected = listeners.filter(function (listener) {
      var ev = listener.inspect().event;
      var tags = listener.inspect().tags;
      return ev === 'a' ||
             (ev === 'b' && tags[0] === 'tagA') ||
             (ev === 'c' && tags[0] === 'tagA' && tags[1] === 'tagB');
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

  QUnit.module('listener');

  Q.test('should instantiate a listener', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    assert.strictEqual(listener, emitter.getListeners()[0]);

  });

  Q.test('should instantiate listener with correct default values', function (assert) {

    assert.expect(10);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = (new Venttiseiska.Listener(emitter, 'a', listenerFn)).inspect();

    assert.strictEqual(typeof listener.id, 'number');
    assert.strictEqual(listener.emitter, emitter);
    assert.strictEqual(listener.event, 'a');
    assert.strictEqual(listener.fn, listenerFn);
    assert.strictEqual(listener.tags instanceof Array, true);
    assert.strictEqual(listener.tags.length, 0);
    assert.strictEqual(listener.context, undefined);
    assert.strictEqual(listener.cycles, 0);
    assert.strictEqual(listener.active, true);
    assert.strictEqual(listener.bound, true);

  });

  Q.test('should accept tags as the fourth argument', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerTags = ['a', 'b'];
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, listenerTags);

    assert.deepEqual(listener.inspect().tags, listenerTags);

  });

  Q.test('should accept context as the fifth argument', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCtx = {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, null, listenerCtx);

    assert.strictEqual(listener.inspect().context, listenerCtx);

  });

  Q.test('should accept cycles as the sixth argument', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, null, undefined, 5);

    assert.strictEqual(listener.inspect().cycles, 5);

  });

  Q.test('should accept configuration object as the first argument', function (assert) {

    assert.expect(9);

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

    assert.strictEqual(typeof listener.id, 'number');
    assert.strictEqual(listener.emitter, emitter);
    assert.strictEqual(listener.event, listenerEvent);
    assert.strictEqual(listener.fn, listenerFn);
    assert.deepEqual(listener.tags, listenerTags);
    assert.strictEqual(listener.context, listenerCtx);
    assert.strictEqual(listener.cycles, 5);
    assert.strictEqual(listener.active, true);
    assert.strictEqual(listener.bound, true);

  });

  Q.test('should unbind itself after cycles are depleted', function (assert) {

    assert.expect(2);

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
    assert.strictEqual(listener.inspect().bound, false);

    // Emit twice again.
    listener.emit().emit();

    // Callback should only have triggered two times in total.
    assert.strictEqual(counter, 2);

  });

  QUnit.module('listener.off()');

  Q.test('should be chainable', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    assert.strictEqual(listener.off(), listener);

  });

  Q.test('should unbind itself', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.off();

    assert.strictEqual(emitter.getListeners().length, 0);
    assert.strictEqual(listener.inspect().bound, false);

  });

  QUnit.module('listener.emit()');

  Q.test('should be chainable', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    assert.strictEqual(listener.emit(), listener);

  });

  Q.test('should invoke the targeted listeners', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      assert.ok(true);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.emit();

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
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.emit(args);

  });

  Q.test('should temporarily force context to the listener\'s callback', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();
    var listenerCtx = {};
    var emitCtx = {};
    var listenerFn = function (forcedContext) {
      assert.strictEqual(this, forcedContext ? emitCtx : listenerCtx);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], listenerCtx);

    listener.emit([true], emitCtx);
    listener.emit();

  });

  Q.test('should not invoke callbacks of inactive listeners', function (assert) {

    assert.expect(0);

    var emitter = new Venttiseiska();
    var listenerFn = function () {
      assert.strictEqual(1, 0);
    };
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({active: false}).emit();

  });

  QUnit.module('listener.update()');

  Q.test('should be chainable', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    assert.strictEqual(listener.update(), listener);

  });

  Q.test('should update callback function', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerFn2 = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({fn: listenerFn2});

    assert.strictEqual(listener.inspect().fn, listenerFn2);

  });

  Q.test('should update tags', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerTagsA = ['a', 'b', 'c'];
    var listenerTagsB = ['d', 'e', 'f'];
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, listenerTagsA);

    listener.update({tags: listenerTagsB});

    assert.deepEqual(listener.inspect().tags, listenerTagsB);

  });

  Q.test('should update context', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCtxA = {};
    var listenerCtxB = {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], listenerCtxA);

    listener.update({context: listenerCtxB});

    assert.strictEqual(listener.inspect().context, listenerCtxB);

  });

  Q.test('should update cycles', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listenerCyclesA = 10;
    var listenerCyclesB = 5;
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn, [], undefined, listenerCyclesA);

    listener.update({cycles: listenerCyclesB});

    assert.strictEqual(listener.inspect().cycles, listenerCyclesB);

  });

  Q.test('should update active state', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({active: false});

    assert.strictEqual(listener.inspect().active, false);

  });

  Q.test('should not update id', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);
    var id = listener.inspect().id;

    listener.update({id: id + 1});

    assert.strictEqual(listener.inspect().id, id);

  });

  Q.test('should not update emitter', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({emitter: new Venttiseiska()});

    assert.strictEqual(listener.inspect().emitter, emitter);

  });

  Q.test('should not update event', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({event: 'b'});

    assert.strictEqual(listener.inspect().event, 'a');

  });

  Q.test('should not update bound state', function (assert) {

    assert.expect(1);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    listener.update({bound: false});

    assert.strictEqual(listener.inspect().bound, true);

  });

  QUnit.module('listener.inspect()');

  Q.test('should return a plain object with correct properties', function (assert) {

    assert.expect(11);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);

    var inspect = listener.inspect();

    assert.strictEqual(typeof inspect === 'object' && Object.prototype.toString.call(inspect) === '[object Object]', true);
    assert.strictEqual(typeof inspect.id, 'number');
    assert.strictEqual(inspect.emitter, emitter);
    assert.strictEqual(inspect.event, 'a');
    assert.strictEqual(inspect.fn, listenerFn);
    assert.strictEqual(inspect.tags instanceof Array, true);
    assert.strictEqual(inspect.tags.length, 0);
    assert.strictEqual(inspect.context, undefined);
    assert.strictEqual(inspect.cycles, 0);
    assert.strictEqual(inspect.active, true);
    assert.strictEqual(inspect.bound, true);

  });

  Q.test('should return a clone of the real tags array', function (assert) {

    assert.expect(2);

    var emitter = new Venttiseiska();
    var listenerFn = function () {};
    var listener = new Venttiseiska.Listener(emitter, 'a', listenerFn);
    var inspect = listener.inspect();

    inspect.tags.push('tagA');

    assert.strictEqual(listener.inspect().tags instanceof Array, true);
    assert.strictEqual(listener.inspect().tags.length, 0);

  });

})(QUnit, this);
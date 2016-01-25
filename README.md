# Venttiseiska

The good 'ol event emitter pattern with a few handy extras and sugary sweet API. If you're looking for the tiniest and fastest event emitter implementation keep on looking, this is not it. However, if you need a solid emitter coded in OOP style for maximum extendability where the event listener is a first-class citizen then this might be your cup of tea. No dependencies and works in most browsers (IE9+) and in Node.js too. In case you're wondering, *Venttiseiska* is a Finnish military slang word referring to [AN/PRC-77 Portable Transceiver](https://en.wikipedia.org/wiki/AN/PRC-77_Portable_Transceiver) which is used by the Finnish army, hence the name.

#### Basic usage

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };
emitter.on('someEvent', listener);
emitter.emit('someEvent', ['hello']);
emitter.off('someEvent', listener);
```

#### Special features

**#1: Namespaced events (aka event *tags*).**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };
emitter.on('someEvent:tagA ', listener);
emitter.on('someEvent:tagB', listener);
emitter.emit('someEvent:tagA', ['tagA fired']);
emitter.emit('someEvent:tagB', ['tagB fired']);
emitter.emit('someEvent', ['tagA and tagB fired']);
```

**#2: Bind, unbind and emit multiple events simultaneously.**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };
emitter.on('someEvent anotherEvent', listener);
emitter.emit('someEvent anotherEvent', ['hello']);
emitter.off('someEvent anotherEvent', listener);
```

**#3: Define listener *cycles* — how many times a listener can be called before it is automatically unbound.**

```javascript
var emitter = new Venttiseiska();

// Let's bind a listener to trigger twice and then automatically
// unbind itself. Note that we need to use alternative binding
// syntax to access the extra functionality.
emitter.on({
  events: 'someEvent',
  cycles: 2, // Defauls to 0 which means infinite cycles.
  listener:  function (msg) {
    console.log(msg);
  }
});

// Trigger the event twice.
emitter.emit('someEvent someEvent', ['hello']);

// By now the listener is automatically unbound from "someEvent".
// Emitting "someEvent" does nothing at this point.
emitter.emit('someEvent', ['hello']);
```

**#4. Query events and listeners.**

```javascript
var emitter = new Venttiseiska();

// Let's bind some listeners.
emitter.on('a b c', function (msg) {
  console.log(msg);
});

// Get instance's events.
var events = emitter.getEvents(); // ['a', 'b', 'c']

// Get all listeners in the instace sorted by the binding order.
var allListeners = emitter.getListeners();

// Get listeners of events "a" and "b" sorted by the binding order.
var abListeners = emitter.getListeners('a b');
```

**#5. Update event listeners.**

```javascript
var emitter = new Venttiseiska();

// Let's bind some listeners. Surprise! The .on() method
// returns an array of the bound listeners. This is
// also the reason the emitter instance methods are not
// chainable, in case you were wondering.
var listeners = emitter.on('a b c', function (msg) {
  console.log(msg);
});

// Now let's modify the listener of "b" event.
// Note that you cannot modify the listener's event.
listeners[1].update({
  fn: function (msg) {
    console.log(msg + ' updated');
  },
  tags: ['tagA', 'tagB'],
  context: listeners[1],
  cycles: 5
});
```

**#6. Bind listener to specific context and switch it on the fly.**

```javascript
var emitter = new Venttiseiska();
var listener = function () { console.log(this); };
var contextA = 'a';
var contextB = 'b';

// Let's bind listener to event "a" with special context.
emitter.on('a', listener, contextA);

// On emit you should see "a" in your console.
emitter.emit('a');

// Now let's override the bound context for the
// following emit call. On emit you should now
// see "b" in your console.
emitter.emit('a', [], contextB);

// As mentioned already the context specified in
// last emit call was not permanent. You should
// see "a" again in your console.
emitter.emit('a');
```

## Install

Node
```javascript
npm install venttiseiska --save-dev
```

Browser
```html
<script src='venttiseiska.js'></script>
```

## API

### Emitter

* [new Venttiseiska()](#newventtiseiska)
* [emitter.on( events, listener, [context] )](#emitteron)
* [emitter.once( events, listener, [context] )](#emitteronce)
* [emitter.off( [events], [target] )](#emitteroff)
* [emitter.emit( events, [args], [context] )](#emitteremit)
* [emitter.enable( events )](#emitterenable)
* [emitter.disable( events )](#emitterdisable)
* [emitter.getListeners( [events] )](#emittergetlisteners)
* [emitter.getEvents()](#emittergetevents)

### Listener

* [new Venttiseiska.Listener()](#newventtiseiskalistener)
* [listener.off()](#listeneroff)
* [listener.emit( [args], [context] )](#listeneremit)
* [listener.update( data )](#listenerupdate)
* [listener.inspect()](#listenerinspect)

### `new Venttiseiska()`

Create a new event emitter instance.

```javascript
var emitter = new Venttiseiska();
```

### `emitter.on( events, listener, [context] )`

Bind a listener to one or more events. Returns an array of all the bound listeners in the binding order.

**Arguments**

* **events** &nbsp;&mdash;&nbsp; *Array / String / Object*
  * Event names specified as an array or a string. When you provide multiple events as a string an empty space is considered as a delimiter for events, e.g. `'ev1 ev2 ev3'`. You can also attach *tags* (targetable metadata) to listeners. The tag delimiter is `':'`, e.g. `'ev1:tag1 ev2:tag2 ev3:tag1:tag2'`.
  * Alternatively you can provide a plain object in which case all other arguments are ignored and the arguments are searched from the provided object instead. Note that you can only set listener's cycles with the object syntax.
* **listener** &nbsp;&mdash;&nbsp; *Function*
  * A listener function that will be called when any of the specified events is emitted.
* **context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; *optional*
  * Listener function's context.
* **cycles** &nbsp;&mdash;&nbsp; *Number* &nbsp;&mdash;&nbsp; optional
  * Default: `0`
  * The number of calls after which the listener is automatically unbound.

**Returns** &nbsp;&mdash;&nbsp; *Array*

An array of all the bound listeners in the binding order.

**Examples**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };

// Bind an event listener to a single event.
emitter.on('one', listener);

// Bind an event listener to a single event with one tag.
emitter.on('one:a', listener);

// Bind an event listener to a single event with multiple
// namespaces.
emitter.on('one:a:b:c', listener);

// Bind an event listener to multiple events.
emitter.on('one two:a three:b:c', listener);
// The same with array notation.
emitter.on(['one', 'two:a', 'three:b:c'], listener);

// Bind an event listener with custom context
emitter.on('one', listener, {custom: 'context'});

// Bind an event listener which is automatically unbound
// after it has been emitted 3 times.
emitter.on({
  events: 'one',
  listener: listener,
  context: {custom: 'context'},
  cycles: 3
});
```

### `emitter.once( events, listener, [context] )`

Bind a one-off listener to one or more events. Returns an array of all the bound listeners in the binding order.

**Arguments**

* **events** &nbsp;&mdash;&nbsp; *Array / String / Object*
  * Event names specified as an array or a string. When you provide multiple events as a string an empty space is considered as a delimiter for events, e.g. `'ev1 ev2 ev3'`. You can also attach *tags* (targetable metadata) to listeners. The tag delimiter is `':'`, e.g. `'ev1:tag1 ev2:tag2 ev3:tag1:tag2'`.
  * Alternatively you can provide a plain object in which case all other arguments are ignored and the arguments are searched from the provided object instead. Note that you can not set *cycles* in this method at all, this method will always set *cycles* to `1`.
* **listener** &nbsp;&mdash;&nbsp; *Function*
  * A listener function that will be called when any of the specified events is emitted.
* **context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; *optional*
  * Listener function's context.

**Returns** &nbsp;&mdash;&nbsp; *Array*

An array of all the bound listeners in the binding order.

### `emitter.off( [events], [target] )`

Unbind event listeners. If no *target* is provided all listeners for the specified events will be removed. If no *events* are provided all listeners from all events of the instance are removed.

**Arguments**

* **events** &nbsp;&mdash;&nbsp; *Array / String* &nbsp;&mdash;&nbsp; *optional*
  * Event names specified as an array or a string. When you provide multiple events as a string an empty space is considered as a delimiter for events, e.g. `'ev1 ev2 ev3'`. You can additionally target event *tags* to filter the removable listeners, e.g. `'ev1:tag1 ev2:tag2'`.
* **target** &nbsp;&mdash;&nbsp; *Function / Number* &nbsp;&mdash;&nbsp; *optional*
  * Target removable event listeners by specific function or listener id. If no *target* is provided all listeners for the specified event will be removed.

**Examples**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };

// First, let's bind some events.
emitter.on('eventA:tagA eventB:tagB', listener);

// Unbind all listeners in the emitter instance.
emitter.off();

// Unbind all listeners bound to specific event(s).
emitter.off('eventA eventB');;

// Unbind all listeners that match the provided
// event(s) and listener function.
emitter.off('eventA eventB', listener);

// You can also target listeners with specific tags.
emitter.off('eventA:tagA eventB:tagB', listener);
```

### `emitter.emit( events, [args], [context] )`

Emit events.

**Arguments**

* **events** &nbsp;&mdash;&nbsp; *Array / String*
  * Event names specified as an array or a string. When you provide multiple events as a string an empty space is considered as a delimiter for events, e.g. `'ev1 ev2 ev3'`. You can additionally target event *tags*, e.g. `'ev1:tag1 ev2:tag2'`.
* **args** &nbsp;&mdash;&nbsp; *Array* &nbsp;&mdash;&nbsp; *optional*
  * Custom arguments for the listener functions.
* **context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; *optional*
  * Custom context for the called listener functions. Overrides the possible context specified in `.on()` method.

**Examples**

```javascript
var emitter = new Venttiseiska();
var listener = function (msgA, msgB) { console.log(msgA + ' ' + msgB); };

// First, let's bind some listeners.
emitter.on('eventA:tagA eventA:tagB eventB:tagB', listener);

// Emit event(s) with arguments.
emitter.emit('eventA:tagA eventB', ['hello', 'beautiful']);

// Emit an event with custom context.
emitter.emit('eventA:tagB', ['Ka', 'Pow'], {custom: 'context'});
```

### `emitter.getListeners( [events] )`

Get instance's listeners. Optionally you can provide a set of event names as the first argument if you want to filter the listeners. The returned event listeners are always sorted by the bind order starting from the listener that was bound earliest. Additionally the returned array never contains duplicate listeners.

**Arguments**

* **events** &nbsp;&mdash;&nbsp; *Array / String* &nbsp;&mdash;&nbsp; *optional*
  * Event names specified as an array or a string. When you provide multiple events as a string an empty space is considered as a delimiter for events, e.g. `'ev1 ev2 ev3'`. You can additionally target event *tags*, e.g. `'ev1:tag1 ev2:tag2'`.

**Returns** &nbsp;&mdash;&nbsp; *Array*

Returns an array of event listeners, sorterd by their binding order.

**Examples**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };

// First, let's bind some events.
emitter.on('eventA:tagA eventA:tagB eventB:tagB', listener);

// Get all listeners of the emitter instance.
var allListeners = emitter.getListeners();

// Get listeners of specific event(s).
var filteredListeners = emitter.getListeners('eventA:tagA eventB');
```

### `emitter.getEvents()`

Get all events in the instance which have listeners bound to them.

**Returns** &nbsp;&mdash;&nbsp; *Array*

Returns an array of event names.

**Examples**

```javascript
var emitter = new Venttiseiska();
var listener = function (msg) { console.log(msg); };

// First, let's bind some events.
emitter.on('eventA eventB eventC', listener);

// Get all event names of the emitter instance.
var events = emitter.getEvents(); // ['eventA', 'eventB', 'eventC']
```

### `new Venttiseiska.Listener( emitter, event, fn, [tags], [context], [cycles] )`

Venttiseiska listener instance constructor.

**Arguments**

* **emitter** &nbsp;&mdash;&nbsp; *Venttiseiska*
* **event** &nbsp;&mdash;&nbsp; *String*
* **fn** &nbsp;&mdash;&nbsp; *Function*
* **tags** &nbsp;&mdash;&nbsp; *Array* &nbsp;&mdash;&nbsp; *Optional*
* **context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; *Optional*
* **cycles** &nbsp;&mdash;&nbsp; *Number* &nbsp;&mdash;&nbsp; *Optional*

**Examples**

```javascript
var emitter = new Venttiseiska();
var fn = function (msg) { console.log(msg); };
var listener = new Venttiseiska.Listener(emitter, 'eventA', fn);
```

### `listener.off()`

Unbind listener instance.

**Returns** &nbsp;&mdash;&nbsp; *Venttiseiska.Listener*

Returns the *Venttiseiska.Listener* instance that called the method.

**Examples**

```javascript
var emitter = new Venttiseiska();
var fn = function (msg) { console.log(msg); };
var listener = new Venttiseiska.Listener(emitter, 'eventA', fn);
listener.off();
```

### `listener.emit( [args], [context] )`

Emit listener instance.

**Arguments**

* **args** &nbsp;&mdash;&nbsp; *Array* &nbsp;&mdash;&nbsp; *Optional*
* **context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; *Optional*

**Returns** &nbsp;&mdash;&nbsp; *Venttiseiska.Listener*

Returns the *Venttiseiska.Listener* instance that called the method.

**Examples**

```javascript
var emitter = new Venttiseiska();
var fn = function (msg) { console.log(msg); };
var listener = new Venttiseiska.Listener(emitter, 'eventA', fn);
listener.emit(['hello']);
```

### `listener.update( data )`

Update listener's data.

**Arguments**

* **data** &nbsp;&mdash;&nbsp; *Object*
* **data.fn** &nbsp;&mdash;&nbsp; *Function* &nbsp;&mdash;&nbsp; optional
* **data.tags** &nbsp;&mdash;&nbsp; *Array* &nbsp;&mdash;&nbsp; optional
* **data.context** &nbsp;&mdash;&nbsp; *Anything* &nbsp;&mdash;&nbsp; optional
* **data.cycles** &nbsp;&mdash;&nbsp; *Number* &nbsp;&mdash;&nbsp; optional
* **data.active** &nbsp;&mdash;&nbsp; *Boolean* &nbsp;&mdash;&nbsp; optional

**Returns** &nbsp;&mdash;&nbsp; *Venttiseiska.Listener*

Returns the *Venttiseiska.Listener* instance that called the method.

**Examples**

```javascript
var emitter = new Venttiseiska();
var fn = function (msg) { console.log(msg); };
var listener = new Venttiseiska.Listener(emitter, 'eventA', fn);
listener.update({
  fn: function () { console.log('updated'); },
  tags: ['tagA', 'tagB'],
  context: listener,
  cycles: 7
});
```

### `listener.inspect()`

Inspect listener's data.

**Returns** &nbsp;&mdash;&nbsp; *Object*

Returns an object that contains the listener's information.

* **id** &nbsp;&mdash;&nbsp; *Number*
  * The listener's id. Also serves as an indicator of the execution/bind order.
* **event** &nbsp;&mdash;&nbsp; *String*
  * The event's name the listener is bound to.
* **fn** &nbsp;&mdash;&nbsp; *Function*
  * The listener's callback function.
* **tags** &nbsp;&mdash;&nbsp; *Array*
  * The listener's tags. An array of tag names (strings).
* **context** &nbsp;&mdash;&nbsp; *Anything*
  * The listener's current context that will be applied to the callback function.
* **cycles** &nbsp;&mdash;&nbsp; *Number*
  * A number that defines how many times the listener can be emitted until it is automatically unbound. Defaults to `0`, which means that the *cycles* feature is disabled (in other words the listener has infinite cycles).
* **active** &nbsp;&mdash;&nbsp; *Boolean*
  * Defines if the listener can be emitted or not.

**Examples**

```javascript
var emitter = new Venttiseiska();
var fn = function (msg) { console.log(msg); };
var listener = new Venttiseiska.Listener(emitter, 'eventA', fn);
var listenerData = listener.inspect();
```
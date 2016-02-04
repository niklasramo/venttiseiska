/*!
 * @license
 * Venttiseiska v0.1.0-beta
 * https://github.com/niklasramo/venttiseiska
 * Copyright (c) 2016 Niklas Rämö <inramo@gmail.com>
 * Released under the MIT license
 */

(function (glob, factory) {

  var libName = 'Venttiseiska';

  if (typeof define === 'function' && define.amd) {

    // AMD. Register as an anonymous module.
    define(libName, [], function () {

      return factory(glob);

    });

  }
  else if (typeof module === 'object' && module.exports) {

    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(glob);

  }
  else {

    // Browser globals
    glob[libName] = factory(glob);

  }

}(typeof window === 'object' && window.window || global, function (glob, undefined) {

  'use strict';

  var uid = 0;
  var eventDelimiter = ' ';
  var tagDelimiter = ':';
  var vProto = Venttiseiska.prototype;
  var NativeWeakSet = checkSupport(glob.WeakSet);
  var NativeWeakMap = checkSupport(glob.WeakMap);
  var priv = NativeWeakMap ? new NativeWeakMap : null;

  /**
   * Venttiseiska instance constructor.
   *
   * @class
   * @public
   */
  function Venttiseiska() {

    /**
     * The object where all the instance's event listeners are stored in.
     *
     * @protected
     * @type {Object}
     */
    if (NativeWeakMap) {
      priv.set(this, {});
    }
    else {
      this._listeners = {};
    }

  }

  /**
   * Bind a listener to one or more events. Returns an array of all the bound
   * listeners in the binding order.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String|Object} events
   * @param {Function} listener
   * @param {*} [context]
   * @returns {Array}
   */
  vProto.on = function (events, listener, context) {

    var instance = this;
    var ret = [];
    var cycles;

    // Allow providing the arguments in a configuration object.
    if (isPlainObject(events)) {
      cycles = events.cycles;
      context = events.context;
      listener = events.listener;
      events = events.events;
    }

    events = parseEvents(events);

    for (var i = 0, len = events.length; i < len; i++) {

      ret.push(new Venttiseiska.Listener(instance, events[i][0], listener, events[i][1], context, cycles));

    }

    return ret;

  };

  /**
   * Bind a one-off listener to one or more events. Returns an array of all the
   * bound listeners in the binding order.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String|Object} events
   * @param {Function} listener
   * @param {*} [context]
   * @returns {Array}
   */
  vProto.once = function (events, listener, context) {

    var args = isPlainObject(events) ? events : {
      events: events,
      listener: listener,
      context: context
    };

    args.cycles = 1;

    return this.on(args);

  };

  /**
   * Unbind event listeners. If no target is provided all listeners for the
   * specified events will be removed. If no events are provided all events
   * of the instance are removed.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String} [events]
   * @param {Function|Number} [target]
   */
  vProto.off = function (events, target) {

    var listeners = NativeWeakMap ? priv.get(this) : this._listeners;

    // If no events are provided, let's remove all listeners from the instance.
    if (!events) {

      for (var i = 0, keys = Object.keys(listeners), len = keys.length; i < len; i++) {

        var eventListeners = listeners[keys[i]];
        var counter = eventListeners ? eventListeners.length : 0;

        while (counter--) {

          (NativeWeakMap ? priv.get(eventListeners[counter]) : eventListeners[counter])._bound = false;

        }

        eventListeners.length = 0;

      }

    }

    // Otherwise let's only unbind stuff from specified events.
    else {

      var targetId = typeof target === 'number';
      var targetFn = typeof target === 'function';

      events = parseEvents(events);

      for (var i = 0, len = events.length; i < len; i++) {

        // Get event's data.
        var eventName = events[i][0];
        var eventTags = events[i][1];
        var eventListeners = listeners[eventName];
        var hasTags = eventTags.length;
        var counter = eventListeners ? eventListeners.length : 0;

        // Make sure that at least one event listener exists before unbinding.
        if (counter) {

          // If target is defined or if event tags are specified, let's unbind
          // event's listeners one by one.
          if (target || hasTags) {

            while (counter--) {

              var listenerData = NativeWeakMap ? priv.get(eventListeners[counter]) : eventListeners[counter];

              // Make sure the listener's tags match the targeted tags (if
              // provided) and then make sure that the provided target (if
              // provided) matches the event's id or function.
              if ((!hasTags || tagsMatch(eventTags, listenerData._tags)) && (!target || ((targetFn && target === listenerData._fn) || (targetId && target === listenerData._id)))) {

                listenerData._bound = false;
                eventListeners.splice(counter, 1);

              }

            }

          }

          // If no target or tags are defined, let's unbind all the event's
          // listeners.
          else {

            while (counter--) {

              (NativeWeakMap ? priv.get(eventListeners[counter]) : eventListeners[counter])._bound = false;

            }

            eventListeners.length = 0;

          }

        }

      }

    }

  };

  /**
   * Emit events.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String} events
   * @param {Array} [args]
   * @param {*} [context]
   */
  vProto.emit = function (events, args, context) {

    var listeners = NativeWeakMap ? priv.get(this) : this._listeners;
    var hasContext = arguments.length > 2;

    events = parseEvents(events);

    for (var i = 0, len = events.length; i < len; i++) {

      var event = events[i][0];
      var tags = events[i][1];
      var evListeners = listeners[event];
      var evListenersLength = evListeners && evListeners.length;
      var hasTags = tags.length;

      if (evListenersLength) {

        for (var ii = 0; ii < evListenersLength; ii++) {

          var listener = evListeners[ii];

          if (!hasTags || tagsMatch(tags, (NativeWeakMap ? priv.get(listener) : listener)._tags)) {

            if (hasContext) {
              listener.emit(args, context);
            }
            else {
              listener.emit(args);
            }

          }

        }

      }

    }

  };

  /**
   * Get all events in the instance which have listeners bound to them.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @returns {Array}
   */
  vProto.getEvents = function () {

    var listeners = NativeWeakMap ? priv.get(this) : this._listeners;
    var ret = [];

    for (var i = 0, keys = Object.keys(listeners), len = keys.length; i < len; i++) {

      if (listeners[keys[i]] && listeners[keys[i]].length > 0) {

        ret.push(keys[i]);

      }

    }

    return ret;

  };

  /**
   * Get instance's listeners. Optionally you can provide a set of event names
   * as the first argument if you want to filter the listeners. The returned
   * event listeners are always sorted by the bind order starting from the
   * listener that was bound earliest. Additionally the returned array never
   * contains duplicate listeners.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String} [events]
   * @returns {Array}
   */
  vProto.getListeners = function (events) {

    var listeners = NativeWeakMap ? priv.get(this) : this._listeners;
    var ret = [];
    var eventCount = 0;

    events = parseEvents(events || this.getEvents());

    for (var i = 0, len = events.length; i < len; i++) {

      ++eventCount;

      var event = events[i][0];
      var tags = events[i][1];
      var evListeners = listeners[event];
      var evListenersLength = evListeners.length;

      if (evListenersLength) {

        if (!tags.length) {

          ret = ret.concat(listeners[event]);

        }
        else {

          for (var ii = 0; ii < evListenersLength; ii++) {

            var listener = evListeners[ii];
            var listenerData = NativeWeakMap ? priv.get(listener) : listener;

            if (tagsMatch(tags, listenerData._tags)) {

              ret.push(listener);

            }

          }

        }

      }

    }

    return eventCount > 1 && ret.length > 1 ? uniqListeners(ret).sort(compareListeners) : ret;

  };

  /**
   * Venttiseiska listener instance constructor.
   *
   * @class
   * @public
   * @memberof Venttiseiska
   * @param {Venttiseiska} emitter
   * @param {String} event
   * @param {Function} fn
   * @param {Array} [tags]
   * @param {*} [context]
   * @param {Number} [cycles=0]
   */
  Venttiseiska.Listener = function (emitter, event, fn, tags, context, cycles) {

    // Allow providing a config object.
    if (!(emitter instanceof Venttiseiska)) {

      event = emitter.event;
      fn = emitter.fn;
      tags = emitter.tags;
      context = emitter.context;
      cycles = emitter.cycles;
      emitter = emitter.emitter;

    }

    // Create instance data.
    var instanceData = {
      _id: ++uid,
      _emitter: emitter,
      _event: event,
      _fn: fn,
      _tags: (tags || []).concat(),
      _context: context,
      _cycles: cycles || 0,
      _active: true,
      _bound: true
    };

    // Set instance data.
    if (NativeWeakMap) {

      priv.set(this, instanceData);

    }
    else {

      for (var i = 0, keys = Object.keys(instanceData), len = keys.length; i < len; i++) {

        this[keys[i]] = instanceData[keys[i]];

      }

    }

    // Get listeners.
    var listeners = NativeWeakMap ? priv.get(emitter) : emitter._listeners;

    // Push instance to emitter's event listeners collection.
    (listeners[event] = listeners[event] || []).push(this);

  };

  /**
   * Unbind listener instance.
   *
   * @public
   * @memberof Venttiseiska.Listener.prototype
   * @returns {Venttiseiska.Listener}
   */
  Venttiseiska.Listener.prototype.off = function () {

    var listenerData = NativeWeakMap ? priv.get(this) : this;

    if (listenerData._bound) {

      listenerData._emitter.off(listenerData._event, listenerData._id);

    }

    return this;

  };

  /**
   * Emit listener instance.
   *
   * @public
   * @memberof Venttiseiska.Listener.prototype
   * @param {Array} [args]
   * @param {*} [context]
   * @returns {Venttiseiska.Listener}
   */
  Venttiseiska.Listener.prototype.emit = function (args, context) {

    var listenerData = NativeWeakMap ? priv.get(this) : this;

    if (listenerData._bound && listenerData._active) {

      var fn = listenerData._fn;
      var ctx = arguments.length > 1 ? context : listenerData._context;
      var argsLength = args ? args.length : 0;

      if (!argsLength) {

        fn.call(ctx);

      }
      else {

        argsLength === 1 ? fn.call(ctx, args[0]) :
        argsLength === 2 ? fn.call(ctx, args[0], args[1]) :
        argsLength === 3 ? fn.call(ctx, args[0], args[1], args[2]) :
        argsLength === 4 ? fn.call(ctx, args[0], args[1], args[2], args[3]) :
        argsLength === 5 ? fn.call(ctx, args[0], args[1], args[2], args[3], args[4]) :
                           fn.apply(ctx, args.concat());

      }

      if (listenerData._cycles && --listenerData._cycles === 0) {

        this.off();

      }

    }

    return this;

  };

  /**
   * Update listener's data.
   *
   * @public
   * @memberof Venttiseiska.Listener.prototype
   * @param {Object} data
   * @param {Function} [data.fn]
   * @param {Array} [data.tags]
   * @param {*} [data.context]
   * @param {Number} [data.cycles]
   * @param {Boolean} [data.active]
   * @returns {Venttiseiska.Listener}
   */
  Venttiseiska.Listener.prototype.update = function (data) {

    if (data && isPlainObject(data)) {

      var listenerData = NativeWeakMap ? priv.get(this) : this;

      if (listenerData._bound) {

        var props = ['fn', 'tags', 'context', 'cycles', 'active'];

        for (var i = 0; i < 5; i++) {

          var prop = props[i];

          // Update the value only if it has changed.
          if (data.hasOwnProperty(prop) && data[prop] !== listenerData['_' + prop]) {

            listenerData['_' + prop] = data[prop];

          }

        }

      }

    }

    return this;

  };

  /**
   * Inspect listener's data.
   *
   * @class
   * @public
   * @memberof Venttiseiska.Listener.prototype
   * @returns {Object}
   */
  Venttiseiska.Listener.prototype.inspect = function () {

    var listenerData = NativeWeakMap ? priv.get(this) : this;

    return {
      id: listenerData._id,
      emitter: listenerData._emitter,
      event: listenerData._event,
      fn: listenerData._fn,
      tags: listenerData._tags.concat(),
      context: listenerData._context,
      cycles: listenerData._cycles,
      active: listenerData._active,
      bound: listenerData._bound
    };

  };

  /**
   * Sanitize events data.
   *
   * @private
   * @param {Array|String} events
   * @returns {Array}
   */
  function parseEvents(events) {

    var ret = [];
    var retIndex = 0;

    events = typeof events === 'string' ? events.split(eventDelimiter) : events;

    for (var i = 0, len = events.length; i < len; i++) {

      var eventTags = events[i].split(tagDelimiter);
      var eventName = eventTags.shift();

      if (eventName) {

        ret[retIndex++] = [eventName, eventTags];

      }

    }

    return ret;

  }

  /**
   * Check if value is a plain object.
   *
   * @public
   * @param {*} value
   * @returns {Boolean}
   */
  function isPlainObject(value) {

    return typeof value === 'object' && value !== null && Object.prototype.toString.call(value) === '[object Object]';

  }

  /**
   * Check if provided listener tags match with the provided comparison tags.
   *
   * @private
   * @param {Array} tagsA
   * @param {Array} tagsB
   * @returns {Boolean}
   */
  function tagsMatch(tagsA, tagsB) {

    for (var i = 0, len = tagsA.length; i < len; i++) {

      if (tagsB.indexOf(tagsA[i]) < 0) {

        return false;

      }

    }

    return true;

  }

  /**
   * Returns a new duplicate free version of the provided array.
   *
   * @param {Array} array
   * @returns {Array}
   */
  function uniqListeners(array) {

    var ret = [];
    var hash = NativeWeakSet ? new NativeWeakSet : Object.create(null);
    var i = array.length;

    if (NativeWeakSet) {

      while (i--) {

        if (!hash.has(array[i])) {

          hash.add(array[i]);
          ret.push(array[i]);

        }

      }

    }
    else {

      while (i--) {

        var listener = array[i];
        var id = NativeWeakMap ? priv.get(listener)._id : listener._id;

        if (!hash[id]) {

          hash[id] = 1;
          ret.push(listener);

        }

      }

    }

    return ret;

  }

  /**
   * Sort function for ordering event listener objects by id.
   *
   * @private
   * @param {Object} a
   * @param {Object} b
   * @returns {Number}
   */
  function compareListeners(a, b) {

    var idA = NativeWeakMap ? priv.get(a)._id : a._id;
    var idB = NativeWeakMap ? priv.get(b)._id : b._id;

    if (idA < idB) {

      return -1;

    }

    if (idA > idB) {

      return 1;

    }

    return 0;

  }

  function checkSupport(feature) {

    var Symbol = glob.Symbol;

    return feature && typeof Symbol === 'function' && typeof Symbol.toString === 'function' && Symbol(feature).toString().indexOf('[native code]') > -1 && feature;

  }

  return Venttiseiska;

}));

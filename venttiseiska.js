/*!
 * @license
 * Venttiseiska v0.0.1
 * https://github.com/niklasramo/venttiseiska
 * Copyright (c) 2016 Niklas Rämö <inramo@gmail.com>
 * Released under the MIT license
 */

/*

TODO
****
- Add listener.isBound() method or listener._bound boolean flag.
- Perf: allow passing "trusted" args for listener.emit() method so it can
  skip the array cloning routine.
- Perf: allow fetching listeners with emitter.getListeners() method without
  sorting so inner methods can use it without a performance hit.
- Perf: Use a hash map in tagsMatch helper function.
- Unification: use emitter.getListeners() method in emitter.emit() method to
  reduce the codebase size. Also consider using it for emitter.off() method.
- Unit tests.
- Perf testing.

EXPLORE
********
- Explore ES6/ES7 language contructs to help make the code more performant.
  E.g. making the listeners collection a Map/weakMap and event collection a
  WeakSet/Set.
- Should Event be a class with 'name' and 'listeners' props?
- Allow providing multiple targets for emitter.off() method (a mixture of ids
  and functions).
- Targeting functions across events with emitter.off() method. In other words
  allowing user to easily unbind all listeners which have the same callback
  function.
- "Freezing" a listener making it immune to unbinding.
- Merging event collections.

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

}(typeof window === 'object' && window.window || this, function (glob, undefined) {

  'use strict';

  var uid = 0;
  var eventDelimiter = ' ';
  var tagDelimiter = ':';
  var vProto = Venttiseiska.prototype;
  var Set = Set && Symbol && Set.prototype[Symbol.iterator] === Set.prototype.values && Set;

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
    this._listeners = {};

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

    // Loop sanitize events and create new Listener instances.
    forEachEvent(events, function (event, tags) {

      ret.push(new Venttiseiska.Listener(instance, event, listener, tags, context, cycles));

    });

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

    var instance = this;
    var listeners = instance._listeners;

    // If no events are provided, let's remove all listeners from the instance.
    if (!events) {

      for (var i = 0, keys = Object.keys(listeners), len = keys.length; i < len; i++) {

        listeners[keys[i]].length = 0;

      }

    }

    // Otherwise let's only unbind stuff from specified events.
    else {

      var targetId = typeof target === 'number';
      var targetFn = typeof target === 'function';

      forEachEvent(events, function (eventName, eventTags) {

        // Get event's data.
        var eventListeners = listeners[eventName];
        var hasTags = eventTags.length;
        var counter = eventListeners ? eventListeners.length : 0;

        // Make sure that at least one event listener exists before unbinding.
        if (counter) {

          // If target is defined or if event tags are specified, let's unbind
          // event's listeners one by one.
          if (target || hasTags) {

            while (counter--) {

              var listener = eventListeners[counter];

              // Make sure the listener's tags match the targeted tags (if
              // provided) and then make sure that the provided target (if
              // provided) matches the event's id or function.
              if ((!hasTags || tagsMatch(eventTags, listener._tags)) && (!target || ((targetFn && target === listener._fn) || (targetId && target === listener._id)))) {

                eventListeners.splice(counter, 1);

              }

            }

          }

          // If no target or tags are defined, let's unbind all the event's
          // listeners.
          else {

            eventListeners.length = 0;

          }

        }

      });

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

    var instance = this;
    var listeners = instance._listeners;
    var hasContext = arguments.length > 1;

    forEachEvent(events, function (event, tags) {

      var evListeners = listeners[event];
      var evListenersLength = evListeners && evListeners.length;
      var hasTags = tags.length;

      if (evListenersLength) {

        for (var i = 0; i < evListenersLength; i++) {

          var listener = evListeners[i];

          if (!hasTags || tagsMatch(tags, listener._tags)) {

            if (hasContext) {
              listener.emit(args, context);
            }
            else {
              listener.emit(args);
            }

          }

        }

      }

    });

  };

  /**
   * Disable events temporarily. The listeners are kept in the event collection
   * but they won't be emitted until they are enabled.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String} [events]
   */
  vProto.disable = function (events) {

    var listeners = this.getListeners(events);

    for (var i = 0, len = listeners.length; i < len; i++) {

      listeners[i].update({active: false});

    }

  };

  /**
   * Enbale events.
   *
   * @public
   * @memberof Venttiseiska.prototype
   * @param {Array|String} [events]
   */
  vProto.enable = function (events) {

    var listeners = this.getListeners(events);

    for (var i = 0, len = listeners.length; i < len; i++) {

      listeners[i].update({active: true});

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

    var listeners = this._listeners;
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

    var listeners = this._listeners;
    var ret = [];
    var eventCount = 0;

    events = events || this.getEvents();

    forEachEvent(events, function (event, tags) {

      ++eventCount;

      var evListeners = listeners[event];
      var evListenersLength = evListeners.length;

      if (evListenersLength) {

        if (!tags.length) {

          ret = ret.concat(listeners[event]);

        }
        else {

          for (var i = 0; i < evListenersLength; i++) {

            var listener = evListeners[i];

            if (tagsMatch(tags, listener._tags)) {

              ret.push(listener);

            }

          }

        }

      }

    });

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

    // Get emitter listeners.
    var listeners = emitter._listeners;

    // Create instance data.
    this._id = ++uid;
    this._emitter = emitter;
    this._event = event;
    this._fn = fn;
    this._tags = tags || [];
    this._context = context;
    this._cycles = cycles || 0;
    this._active = true;

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

    this._emitter.off(this._event, this._id);

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

    if (this._active) {

      this._fn.apply(arguments.length > 1 ? context : this._context, Array.isArray(args) ? args.concat() : []);

      if (this._cycles && --this._cycles === 0) {

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

    var props = ['fn', 'tags', 'context', 'cycles', 'active'];

    for (var i = 0; i < 5; i++) {

      var prop = props[i];

      // Update the value only if it has changed.
      if (data.hasOwnProperty(prop) && data[prop] !== this['_' + prop]) {

        this['_' + prop] = data[prop];

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

    return {
      id: this._id,
      event: this._event,
      fn: this._fn,
      tags: this._tags,
      context: this._context,
      cycles: this._cycles
    };

  };

  /**
   * Sanitize events query.
   *
   * @private
   * @param {Array|String} events
   * @returns {Array}
   */
  function parseEvents(events) {

    return typeof events === 'string' ? events.split(eventDelimiter) : events;

  }

  /**
   * Parse event query and loop over each event.
   *
   * @private
   * @param {Array|String} events
   * @param {Function} callback
   */
  function forEachEvent(events, callback) {

    events = parseEvents(events);

    for (var i = 0, len = events.length; i < len; i++) {

      var eventTags = events[i].split(tagDelimiter);
      var eventName = eventTags.shift();

      if (eventName) {

        callback(eventName, eventTags);

      }

    }

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
    var hash = Set ? new Set : Object.create(null);
    var i = array.length;

    if (Set) {

      while (i--) {

        if (!hash.has(array[i]._id)) {

          hash.add(array[i]._id);
          ret[ret.length] = array[i];

        }

      }

    }
    else {

      while (i--) {

        if (!hash[array[i]._id]) {

          hash[array[i]._id] = 1;
          ret.push(array[i]);

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

    if (a._id < b._id) {

      return -1;

    }

    if (a._id > b._id) {

      return 1;

    }

    return 0;

  }

  return Venttiseiska;

}));

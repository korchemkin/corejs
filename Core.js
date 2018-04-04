/**
 *
 * @class Core
 * singletone
 */
var Core = (function() {
    'use strict';

    var _instance;
    // All dynamic data should storing here
    var _storage = {};
    // Cache for event handlers
    var _cache = {};
    // App config
    var _config = {};

    /**
     *
     * @constructor
     */
    function Core() {};
    /**
     *
     * @destructor
     */
    Core.prototype.destroy = function() {
        // remove all event handlers
        for (var prop in _cache) {
            _cache[prop] = [];
            delete _cache[prop];
        };

        // clear storage
        for (var prop in _storage) {
            _storage[prop] = null;
            delete _storage[prop];
        };

        // destroy instance
        _instance = null;

        return 0;
    };
    /**
     * Subscribe on Core event, can be many subscribers
     * @param <String> type
     * @param <Function> handler
     */
    Core.prototype.on = function(type, handler) {
        if (type == null || handler == null) {
            return;
        }

        if (!_cache.hasOwnProperty(type)) {
            _cache[type] = [];
        }

        _cache[type].push(handler);
    };
    /**
     * Unsubscribe
     * @param <String> type
     * @param <Function> handler
     */
    Core.prototype.off = function(type, handler) {
        var temp = [];
        var i;
        var len;

        if (!_cache.hasOwnProperty(type) || !_cache[type].length) {
            return;
        }

        // remove all identical handlers
        for (i = 0, len = _cache[type].length; i < len; i++) {
            if (_cache[type][i].toString() !== handler.toString()) {
                temp.push(_cache[type][i]);
            }
        }

        if (!temp.length) {
            // remove event type if has no handlers
            _cache[type] = null;
            delete _cache[type];
        } else {
            // update handlers
            _cache[type] = temp.slice(0);;
        }
    };
    /**
     * Trigger event
     * @param <String> type
     * @param <Any> data
     */
    Core.prototype.emit = function(type, data) {
        if (!_cache.hasOwnProperty(type)
            || !_cache[type].length) {
            return;
        }

        for (var i = 0, len = _cache[type].length; i < len; i++) {
            _cache[type][i](data);
        }
    };
    /**
     *
     * @param <String> key
     * @returns <Any>
     */
    Core.prototype.storageGet = function(key) {
        if (!key || typeof key !== 'string') {
            return;
        }

        return _storage[key];
    };
    /**
     *
     * @param <String> key
     * @param <Any> value
     */
    Core.prototype.storageSet = function(key, value) {
        if (!key
            || typeof key !== 'string'
            || typeof value === 'undefined') {
            return;
        }

        _storage[key] = value;
    };
    /**
     *
     * @param <String> key
     */
    Core.prototype.storageRemove = function(key) {
        if (!key || typeof key !== 'string') {
            return;
        }

        _storage[key] = null;
        delete _storage[key];
    };
    /**
     *
     * @param <String> section
     * @param <String> key
     * @param <String> value
     */
    Core.prototype.setConfigProp = function(section, key, value) {
        if (!section
            || !_config.hasOwnProperty(section)
            || !_config[section].hasOwnProperty(key)
            || typeof value !== 'string') {
            return;
        }

        _config[section][key] = value;
    };


    return {
        getInstance: function() {
            if (!_instance) {
                _instance = new Core();
            }

            return _instance;
        }
    };

}());

// this needs for testing
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') module.exports = Core;

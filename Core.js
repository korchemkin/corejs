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
            _cache[prop] = null;
            delete _cache[prop];
        };

        // clear storage
        for (var prop in _storage) {
            _storage[prop] = null;
            delete _storage[prop];
        };

        // destroy instance
        _instance = null;
    };
    /**
     * Subscribe on Core event, can be many subscribers
     * @param <String> type
     * @param <Function> handler
     */
    Core.prototype.on = function(type, handler) {
        if (type == null 
            || (typeof handler !== 'function')) {
            return;
        }

        if (!_cache.hasOwnProperty(type)) {
            _cache[type] = [];
        }

        if (!_cache[type].length) {
            _cache[type].push(handler);
        } else {
            // write only unique handlers
            for (var i = 0, len = _cache[type].length; i < len; i++) {
                if (_cache[type][i] && (_cache[type][i].toString() !== handler.toString())) {
                    _cache[type].push(handler);
                }
            }
        }
    };
    /**
     * Unsubscribe
     * @param <String> type
     * @param <Function> handler
     */
    Core.prototype.off = function(type, handler) {
        if (!_cache.hasOwnProperty(type) 
            || !_cache[type].length 
            || (typeof handler !== 'function')) {
            return;
        }

        // remove handler
        for (var i = 0, len = _cache[type].length; i < len; i++) {
            if (_cache[type][i] && (_cache[type][i].toString() === handler.toString())) {
                _cache[type].splice(i, 1);
            }
        }

        if (!_cache[type].length) {
            // remove event type if has no handlers
            _cache[type] = null;
            delete _cache[type];
        }
    };
    /**
     * Trigger event
     * @param <String> type
     * @param <Any> data?
     */
    Core.prototype.emit = function(type, data) {
        if (!_cache.hasOwnProperty(type)
            || !_cache[type].length) {
            return;
        }

        for (var i = 0, len = _cache[type].length; i < len; i++) {
            if (typeof _cache[type][i] === 'function') {
                _cache[type][i](data);
            }
        }
    };
    /**
     *
     * @param <String> key
     * @returns <Any>
     */
    Core.prototype.storageGet = function(key) {
        if (typeof key !== 'string') {
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
        if (typeof key !== 'string'
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
        if (typeof key !== 'string') {
            return;
        }

        _storage[key] = null;
        delete _storage[key];
    };
    /**
     * @return <Object>
     */
    Core.prototype.http = (function() {
        /**
         * 
         * @param <Object> obj
         * @private
         */
        var _toQueryString = function(obj) {
            var str = [];
            for(var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    str.push(encodeURIComponent(prop) + "=" + encodeURIComponent(obj[prop]));
                }
            }
            return str.join("&");
         }
        /**
         * 
         * @param <String> method 
         * @param <String> url 
         * @param <Any> data 
         * @param <Array> headers?
         * @constructor
         */
        function Request(method, url, data, headers) {
            if (typeof method !== 'string' 
                || typeof url !== 'string') {
                return;
            }

            var xhr = new XMLHttpRequest();
            xhr.open(method, url);

            if (headers instanceof Array) {
                headers.forEach(function(header) {
                    for (var key in header) {
                        xhr.setRequestHeader(key, header[key]);
                    }
                });
            }

            xhr.addEventListener("load", function() {
                if (typeof this.done !== 'function') {
                    return;
                }
                this.done(xhr);
            }.bind(this));

            xhr.addEventListener("error", function() {
                if (typeof this.fail !== 'function') {
                    return;
                }
                this.fail(xhr);
            }.bind(this));

            xhr.send(data);
        };
        /**
         * 
         * @param <Function> callback
         * @return <Object>
         */
        Request.prototype.done = function(callback) {
            if (typeof callback !== 'function') {
                return;
            }
            
            this.done = callback;
            return this;
        };
        /**
         * 
         * @param <Function> callback
         * @return <Object>
         */
        Request.prototype.fail = function(callback) {
            if (typeof callback !== 'function') {
                return;
            }
            
            this.fail = callback;
            return this;
        };

        return {
            get: function(url, data) {
                url += '?' + _toQueryString(data);
                return new Request('GET', url, null);
            },
            post: function(url, data) {
                return new Request('POST', url, JSON.stringify(data), [{'Content-Type': 'application/json'}]);
            },
            put: function(url, data) {
                return new Request('PUT', url, JSON.stringify(data), [{'Content-Type': 'application/json'}]);
            },
            delete: function(url, data) {
                url += '?' + _toQueryString(data);
                return new Request('DELETE', url, null);
            },
            upload: function(url, formData) {
                return new Request('POST', url, formData, [{'Content-Type': 'multipart/form-data'}]);
            },
        }
    }());

    return {
        getInstance: function() {
            if (!_instance) {
                _instance = new Core();
            }

            return _instance;
        }
    };

}());

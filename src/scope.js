'use strict';

const _ = require('lodash');

function Scope() {
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
}

function initWatchVal() { }

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq) {
    const watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn || function() { },
        valueEq: !!valueEq,
        last: initWatchVal
    }

    this.$$watchers.push(watcher);
}

Scope.prototype.$$digestOnce = function() {
    var self = this;
    var newValue, oldValue;
    var dirty = false;
    _.forEach(this.$$watchers, function(watcher) {
        newValue = watcher.watchFn(self);
        oldValue = watcher.last;
        if (!self.$$areEqual(newValue, oldValue, watcher.valueEq)) {
            self.$$lastDirtyWatch = watcher;
            watcher.last = watcher.valueEq ? _.cloneDeep(newValue) : newValue;
            watcher.listenerFn(newValue, 
                (oldValue === initWatchVal ? newValue : oldValue),
                self);
            dirty = true;
        } else if (self.$$lastDirtyWatch === watcher) {
            return false; 
        }
    });
    return dirty;
}

Scope.prototype.$digest = function() {
    var ttl = 10
    var dirty;
    this.$$lastDirtyWatch = null;
    do {
        dirty = this.$$digestOnce();
        if (dirty && !(ttl--)) {
            throw '10 digest iterations reached';
        }
    } while (dirty);
}

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq) {
    return valueEq ? _.isEqual(newValue, oldValue) : newValue === oldValue;
}

module.exports = {
    Scope: Scope
}
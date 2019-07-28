const Scope = require('../src/scope').Scope;

describe('Scope', function() {
    it('can be constructed and used as an object', function() {
        var scope = new Scope();
        scope.aProperty = 1;

        expect(scope.aProperty).toBe(1);
    })
})

describe('digest', function() {
    let scope;

    beforeEach(function() {
        scope = new Scope();
    })

    it('call the listener function of a watch on first $digest', function() {
        const watchFn = function() {
            return 'wat';
        };

        const listenerFn = jasmine.createSpy();

        scope.$watch(watchFn, listenerFn);

        scope.$digest();

        expect(listenerFn).toHaveBeenCalled();
    })

    it('call the listener function with the scope as the  argument', function() {
        const watchFn = jasmine.createSpy();
        const listenerFn = function() { }

        scope.$watch(watchFn, listenerFn);

        scope.$digest();

        expect(watchFn).toHaveBeenCalledWith(scope);
    })


    it('call the listener function when the watched value changes', function() {
        scope.someValue = 'a';
        scope.counter = 0;
        scope.$watch(
            function(scope) { return scope.someValue; },
            function(newValue, oldValue, scope) {
                scope.counter ++;
            }
        )
        expect(scope.counter).toBe(0);

        scope.$digest();
        expect(scope.counter).toBe(1);

        scope.someValue = 'b';
        expect(scope.counter).toBe(1);

        scope.$digest();
        expect(scope.counter).toBe(2);
    })

    it('call the listener when watch value is first undefined', function() {
        scope.counter = 0;

        scope.$watch(
            function(scope) { return scope.someValue; },
            function(newValue, oldValue, scope) {
                scope.counter ++;
            }
        )

        scope.$digest();
        expect(scope.counter).toBe(1);
    })

    it('call listener with new value as old value the first time', function() {
        scope.someValue = 123;
        let oldValueGiven;

        scope.$watch(
            function(scope) { 
                return scope.someValue;
            },
            function(newValue, oldValue, scope) {
                oldValueGiven = oldValue;
            }
        )

        scope.$digest();
        expect(oldValueGiven).toBe(123);
    })

    it('may have watchers that omit the listener function', function() {
        const watchFn = jasmine.createSpy().and.returnValue('sometime');
        scope.$watch(watchFn);

        scope.$digest();

        expect(watchFn).toHaveBeenCalled();
    })

    it('triggers chained watchers in the same digest', function() {
        scope.name = 'Arthur';
        
        scope.$watch(
            function(scope) { return scope.nameUpper; },
            function(newValue, oldValue, scope) {
                if (newValue) {
                    scope.initial = newValue.substring(0, 1) + '.';
                }
            }
        );

        scope.$watch(
            function(scope) { return scope.name; },
            function(newValue, oldValue, scope) {
                if (newValue) {
                    scope.nameUpper = newValue.toUpperCase();
                }
            }
        );

        scope.$digest();

        expect(scope.initial).toBe('A.');

        scope.name = 'Bob';
        scope.$digest();
        expect(scope.initial).toBe('B.')

    })
})
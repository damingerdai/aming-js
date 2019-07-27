const sayHello = require('../src/hello').sayHello;

describe('Hello', function() {

    it('say hello to receiver', function() {
        expect(sayHello('Arthur')).toBe('Hello, Arthur!');
    })
});
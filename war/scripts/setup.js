/**
 * setup.js
 *
 * This file contains all the architecture needed to initialize the game. It declares
 * the global m3 object that contains all other game modules.
 *
 * Include this script before any other.
 */

// The global game object.
var m3 = {

    // A "container" object to hold the constructors for our objects.
    types: {},

    // Holds the constructors for our state objects.
    states: {}
};

// Implement Object.create if the browser didn't.
if (typeof Object.create !== "function") {
    Object.create = function(o) {
        var F = function() {};
        F.prototype = o;
        return new F();
    };
}

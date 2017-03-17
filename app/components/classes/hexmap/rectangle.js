var game = angular.module('bloqhead.genetixApp');

game.factory('Rectangle', function() {
    /**
     * A Rectangle is x and y origin and width and height
     * @constructor
     */
    var Rectangle = function(x, y, width, height) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    };

    return Rectangle;
});
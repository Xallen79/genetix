var game = angular.module('bloqhead.genetixApp');

game.factory('Point', function() {
    /**
     * A Point is simply x and y coordinates
     * @constructor
     */
    var Point = function(x, y) {
        this.X = x;
        this.Y = y;
    };

    return Point;
});
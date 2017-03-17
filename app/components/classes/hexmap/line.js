var game = angular.module('bloqhead.genetixApp');

game.factory('Line', function() {
    /**
     * A Line is x and y start and x and y end
     * @constructor
     */
    var Line = function(x1, y1, x2, y2) {
        this.X1 = x1;
        this.Y1 = y1;
        this.X2 = x2;
        this.Y2 = y2;
    };

    return Line;
});
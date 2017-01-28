var game = angular.module('bloqhead.genetixApp');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

game.constant('gameStates', {
    PAUSED: 0,
    RUNNING: 1
});

game.service('gameService', [
    '$window', '$rootScope', 'gameStates',
    function($window, $rootScope, gameStates) {
        var self = this;
        self.init = function(config) {
            if (!angular.isDefined(config)) config = {};
            self.stepTimeMs = config.stepTimeMs || 1000;
            self.lastTime = 0;
            self.currentState = gameStates.PAUSED;
            self.gameLoop(0);
        };

        self.getState = function() {
            return self.currentState;
        };
        self.setState = function(newState) {
            self.currentState = newState;
        };

        self.gameLoop = function(step) {
            var self = this;
            var steps = 0;
            while (self.lastTime + step > (self.stepTimeMs * (steps + 1))) {
                steps++;
            }
            self.lastTime = (self.lastTime - (self.stepTimeMs * steps));
            if (self.currentState == gameStates.RUNNING && steps > 0) {
                $rootScope.$emit('gameLoopEvent', steps);
            }
            $window.requestAnimationFrame(this.gameLoop.bind(this));
        };

        self.SubscribeGameLoopEvent = function(scope, callback) {
            var handler = $rootScope.$on('gameLoopEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };

    }
]);
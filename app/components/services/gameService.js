var game = angular.module('bloqhead.genetixApp');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

game.constant('gameStates', {
    PAUSED: 0,
    RUNNING: 1
});
// this should probably have a name specific to gameService
game.constant("defaultConfig", {
    gameServiceConfig: {
        stempTimeMs: 100
    },
    populationServiceConfig: {
        breedSteps: 6,
        populationConfig: {
            initialSize: 2,
            maxSize: 20,
            breederMutationBits: 5,
            breederGenesUnlocked: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 42],
            breederMuatationChance: 10
        }
    }
});

game.service('gameService', [
    '$window', '$rootScope', 'gameStates', 'logService', 'defaultConfig',
    function($window, $rootScope, gameStates, logService, defaultConfig) {
        var self = this;
        self.init = function(config) {
            config = config || defaultConfig;

            self.stepTimeMs = config.gameServiceConfig.stepTimeMs || 1000;
            self.lastTime = 0;
            self.currentState = gameStates.PAUSED;
            self.startGame(config);

        };

        self.getState = function() {
            return self.currentState;
        };
        self.setState = function(newState) {
            self.currentState = newState;
            if (newState === gameStates.PAUSED) logService.logGeneralMessage("Game paused.");
            else logService.logGeneralMessage("Game resumed.");
        };

        self.gameLoop = function(step) {
            var self = this;
            var steps = 0;
            while (self.lastTime + step > (self.stepTimeMs * (steps + 1))) {
                steps++;
            }
            self.lastTime = (self.lastTime - (self.stepTimeMs * steps));
            if (self.currentState == gameStates.RUNNING && steps > 0) {
                $rootScope.$apply($rootScope.$emit('gameLoopEvent', steps));
            }
            $window.requestAnimationFrame(this.gameLoop.bind(this));
        };

        self.SubscribeGameLoopEvent = function(scope, callback) {
            var handler = $rootScope.$on('gameLoopEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };
        self.SubscribeInitializeEvent = function(scope, callback) {
            var handler = $rootScope.$on('initializeEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };
        self.startGame = function(config) {
            config = config || defaultConfig;
            self.currentState = gameStates.PAUSED;
            logService.init(false);
            $rootScope.$emit('initializeEvent', config);
            self.gameLoop(0);
            self.currentState = gameStates.RUNNING;
        };

    }
]);
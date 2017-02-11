var game = angular.module('bloqhead.genetixApp');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

game.service('gameLoopService', ['$window', '$rootScope', 'gameStates', 'logService',
    function($window, $rootScope, gameStates, logService) {
        var self = this;
        self.initialized = false;
        self.init = function(state) {
            state = state || {};
            self.stepTimeMs = state.stepTimeMs || self.stepTimeMs || 1000;
            self.lastTime = 0;
            self.currentState = gameStates.PAUSED;
            if (!self.initialized) {
                self.initialized = true;
                self.gameLoop(0);
            }

            self.currentState = state.currentState || self.currentState || gameStates.RUNNING;
        };

        self.getState = function() {
            return {
                stepTimeMs: self.stepTimeMs,
                currentState: self.currentState
            };
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

    }
]);

game.service('gameService', [
    '$rootScope', 'gameSaveKey', 'defaultState', 'logService', 'gameLoopService', 'populationService', 'achievementService',
    'resourceService', 'buildingService', 'LZString', 'traitDefinitions', 'workerService',
    function($rootScope, gameSaveKey, defaultState, logService, gameLoopService, populationService, achievementService,
        resourceService, buildingService, LZString, traitDefinitions, workerService) {
        var self = this;
        var initialized = false;
        self.init = function(state) {
            var json = LZString.decompressFromBase64(localStorage.getItem(gameSaveKey));
            var savedState = (json) ? angular.fromJson(json) : undefined;
            self.gameState = state || savedState || defaultState;
            self.autoSaveSteps = self.gameState.autoSaveSteps || self.autoSaveSteps || 10;
            self.startGame();
            self.stepsSinceSave = 0;
            if (!initialized) {
                gameLoopService.SubscribeGameLoopEvent($rootScope, handleLoop);
                initialized = true;
            }
        };
        self.startGame = function() {
            logService.init(self.gameState.clearLog);

            populationService.init(
                angular.merge({},
                    defaultState.populationServiceState,
                    self.gameState.populationServiceState
                )
            );

            resourceService.init(
                angular.merge({},
                    defaultState.resourceServiceState,
                    self.gameState.resourceServiceState
                )
            );

            achievementService.init(
                angular.merge({},
                    defaultState.achievementServiceState,
                    self.gameState.achievementServiceState
                )
            );

            buildingService.init(
                angular.merge({},
                    defaultState.buildingServiceState,
                    self.gameState.buildingServiceState
                )
            );
            workerService.init(defaultState.workerServiceState);
            gameLoopService.init(
                angular.merge({},
                    defaultState.gameLoopServiceState,
                    self.gameState.gameLoopServiceState
                )
            );



        };
        self.hardReset = function() {
            localStorage.removeItem(gameSaveKey);
            self.init();
        };

        self.saveGame = function(autosave) {
            var saveState = angular.copy(self.gameState);
            saveState.populationServiceState = angular.copy(populationService.getState());
            saveState.resourceServiceState = angular.copy(resourceService.getState());
            saveState.achievementServiceState = angular.copy(achievementService.getState());
            saveState.buildingServiceState = angular.copy(buildingService.getState());
            saveState.gameLoopServiceState = angular.copy(gameLoopService.getState());
            var save = LZString.compressToBase64(angular.toJson(angular.copy(saveState)));
            localStorage.setItem(gameSaveKey, save);
            if (autosave)
                logService.logGeneralMessage('Game autosaved.');
            else
                logService.logGeneralMessage('Game saved.');
        };


        function handleLoop(event, steps) {
            self.stepsSinceSave += steps;

            // testing
            var d = resourceService.getResource('DIRT');
            // if (d >= 25)
            //     resourceService.changeResource("DIRT", -d);
            // else
            //     resourceService.changeResource("DIRT", 1);

            if (self.stepsSinceSave > self.autoSaveSteps) {
                self.saveGame(true);
                self.stepsSinceSave = 0;
            }
        }

    }
]);
var game = angular.module('bloqhead.genetixApp');
game.service('populationService', [
    '$rootScope', 'gameService', 'Population', 'logService',
    function($rootScope, gameService, Population, logService) {
        var self = this;
        self.init = function(config) {
            if (!angular.isDefined(config)) config = {};

            self.breedSteps = config.breedSteps || self.breedSteps || 6;
            self.stepsSinceBreed = 0;

            self.population = config.population || new Population({ size: 10 });
            self.logService = logService;

            gameService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
        };

        self.handleGameLoop = function(event, steps) {
            if (event.name !== 'gameLoopEvent') {
                console.log('populateService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            if (self.population.isBreeding()) {
                self.stepsSinceBreed += steps;
                while (self.stepsSinceBreed >= self.breedSteps) {
                    self.stepsSinceBreed -= self.breedSteps;
                    console.log("BREED!");
                    $rootScope.$apply(self.logService.logMessage("BREED!"));
                    $rootScope.$emit('populationUpdateEvent', self.population.members);
                }
            }

        };

        self.addBreeder = function(id) {
            if (self.population.breeders.indexOf(id) === -1) {
                self.population.breeders.push(id);
                $rootScope.$emit('breederUpdateEvent', self.population.breeders);
                self.logService.logMessage("Breeder added: " + self.population.getById(id).name);
            }
        };
        self.removeBreeder = function(id) {
            var index = self.population.breeders.indexOf(id);
            if (index !== -1) {
                self.population.breeders.splice(index, 1);
                if (!self.population.isBreeding()) self.stepsSinceBreed = 0;
                $rootScope.$emit('breederUpdateEvent', self.population.breeders);
                self.logService.logMessage("Breeder removed: " + self.population.getById(id).name);
            }
        };


        self.SubscribeBreederUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('breederUpdateEvent', callback);
            scope.$on('$destroy', handler);
            $rootScope.$emit('breederUpdateEvent', self.population.breeders);
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('populationUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            $rootScope.$emit('populationUpdateEvent', self.population.members);
        };
    }
]);
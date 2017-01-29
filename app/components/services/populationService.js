var game = angular.module('bloqhead.genetixApp');
game.service('populationService', [
    '$rootScope', 'gameService', 'Population', 'logService',
    function($rootScope, gameService, Population, logService) {
        var self = this;

        self.init = function(event, config) {
            config = config || {};
            var myConfig = config.populationServiceConfig || {};

            self.breedSteps = myConfig.breedSteps || self.breedSteps || 6;
            self.stepsSinceBreed = 0;

            self.population = new Population(myConfig.populationConfig);
            self.logService = logService;

        };

        self.handleGameLoop = function(event, steps) {
            var popUpdated = false;
            if (event.name !== 'gameLoopEvent') {
                console.log('populateService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            if (self.population.isBreeding()) {
                self.stepsSinceBreed += steps;
                while (self.stepsSinceBreed >= self.breedSteps) {
                    self.stepsSinceBreed -= self.breedSteps;
                    var offspring = self.population.breed();
                    if (offspring !== null) {
                        logService.logBreedMessage("New offspring! " + offspring.name);
                        popUpdated = true;
                    }
                }
                if (popUpdated)
                    $rootScope.$emit('populationUpdateEvent', { population: self.population.members, maxSize: self.population.maxSize });
            }

        };

        self.addBreeder = function(id) {
            if (self.population.breeders.indexOf(id) === -1) {
                self.population.breeders.push(id);
                $rootScope.$emit('breederUpdateEvent', self.population.breeders);
                self.logService.logBreedMessage("Breeder added: " + self.population.getById(id).name);
            }
        };
        self.removeBreeder = function(id) {
            var index = self.population.breeders.indexOf(id);
            if (index !== -1) {
                self.population.breeders.splice(index, 1);
                if (!self.population.isBreeding()) self.stepsSinceBreed = 0;
                $rootScope.$emit('breederUpdateEvent', self.population.breeders);
                self.logService.logBreedMessage("Breeder removed: " + self.population.getById(id).name);
            }
        };
        self.updateMember = function(id, geneIndex, geneValues) {
            var member = self.population.getById(id);
            member.genes[geneIndex] = geneValues;
            member.update();
            $rootScope.$emit('populationUpdateEvent', self.population.members);
        };

        self.SubscribeBreederUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('breederUpdateEvent', callback);
            scope.$on('$destroy', handler);
            $rootScope.$emit('breederUpdateEvent', self.population.breeders);
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('populationUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            $rootScope.$emit('populationUpdateEvent', { population: self.population.members, maxSize: self.population.maxSize });
        };

        gameService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
        gameService.SubscribeInitializeEvent($rootScope, self.init);
    }
]);
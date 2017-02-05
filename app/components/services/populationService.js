var game = angular.module('bloqhead.genetixApp');
game.service('populationService', [
    '$rootScope', 'gameLoopService', 'Population', 'logService', 'achievementService',
    function($rootScope, gameLoopService, Population, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};
            self.breedSteps = state.breedSteps || state.breedSteps || 6;
            self.stepsSinceBreed = state.stepsSinceBreed || self.stepsSinceBreed || 0;
            self.populationState = state.populationState || self.populationState;
            self.population = (self.populationState) ? new Population(self.populationState) : self.population || new Population();

            self.logService = logService;
            self.sendBreederUpdateEvent();
            self.sendPopulationUpdateEvent();

        };
        self.getState = function() {
            var state = {
                breedSteps: self.breedSteps,
                stepsSinceBreed: self.stepsSinceBreed
            };
            state.populationState = self.population.getState();
            return state;
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
                        var strBase = 0,
                            intBase = 0,
                            endBase = 0,
                            chrBase = 0,
                            lckBase = 0;
                        var genes = offspring.genes;
                        for (var g = 0; g < genes.length; g++) {
                            if (g < 10)
                                strBase += genes[g][1] - genes[g][0];
                            else if (g < 20)
                                intBase += genes[g][1] - genes[g][0];
                            else if (g < 30)
                                endBase += genes[g][1] - genes[g][0];
                            else if (g < 40)
                                chrBase += genes[g][1] - genes[g][0];
                            else
                                lckBase += genes[g][1] - genes[g][0];
                        }
                        console.log(strBase);
                        achievementService.updateProgress('A_BIRTHS', 1);
                        popUpdated = true;
                    }
                }
                self.sendBreederUpdateEvent();
                if (popUpdated)
                    self.sendPopulationUpdateEvent();
            }

        };

        self.addBreeder = function(id) {
            if (self.population.breeders.indexOf(id) === -1 && self.population.breeders.length < self.population.breederLimit) {
                self.population.breeders.push(id);
                self.sendBreederUpdateEvent();
                self.logService.logBreedMessage("Breeder added: " + self.population.getById(id).name);
            }
        };
        self.removeBreeder = function(id) {
            var index = self.population.breeders.indexOf(id);
            if (index !== -1) {
                self.population.breeders.splice(index, 1);
                if (!self.population.isBreeding()) self.stepsSinceBreed = 0;
                self.sendBreederUpdateEvent();
                self.logService.logBreedMessage("Breeder removed: " + self.population.getById(id).name);
            }
        };
        self.updateMember = function(id, geneIndex, geneValues) {
            var member = self.population.getById(id);
            member.genes[geneIndex] = geneValues;
            member.update();
            self.sendPopulationUpdateEvent();
        };
        self.setBreederLimit = function(newLimit) {
            self.population.breederLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setPopulationLimit = function(newLimit) {
            self.population.maxSize = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.sendBreederUpdateEvent = function() {
            $rootScope.$emit('breederUpdateEvent', { breeders: self.population.breeders, isBreeding: self.population.isBreeding(), stepsSinceBreed: self.stepsSinceBreed, breedSteps: self.breedSteps });
        };
        self.sendPopulationUpdateEvent = function() {
            $rootScope.$emit('populationUpdateEvent', { population: self.population.members, maxSize: self.population.maxSize, breederLimit: self.population.breederLimit });
        };

        self.SubscribeBreederUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('breederUpdateEvent', callback);
            scope.$on('$destroy', handler);
            self.sendBreederUpdateEvent();
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('populationUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendPopulationUpdateEvent();
        };

        gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
    }
]);
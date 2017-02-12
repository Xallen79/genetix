var game = angular.module('bloqhead.genetixApp');
game.service('populationService', [
    '$rootScope', 'gameLoopService', 'Population', 'logService', 'achievementService',
    function($rootScope, gameLoopService, Population, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};
            self.breedSteps = state.breedSteps || self.breedSteps || 6;
            self.stepsSinceBreed = angular.isDefined(state.stepsSinceBreed) ? state.stepsSinceBreed : self.stepsSinceBreed || 0;
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
                console.error('populateService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            if (self.population.isBreeding()) {
                self.stepsSinceBreed += steps;
                while (self.stepsSinceBreed >= self.breedSteps) {
                    self.stepsSinceBreed -= self.breedSteps;
                    var offspring = self.population.breed();
                    if (offspring !== null) {
                        logService.logBreedMessage("New offspring! " + offspring.name);
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
        self.setUnitJob = function(id, job) {
            self.population.getById(id).currentJob = job;
            self.sendPopulationUpdateEvent();
        };
        self.setBreederLimit = function(newLimit) {
            self.population.breederLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setNurseryLimit = function(newLimit) {
            self.population.newbornLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setPopulationLimit = function(newLimit) {
            self.population.maxSize = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.processNewbornFate = function(unitid, fate) {
            self.population.processNewbornFate(unitid, fate);
            self.sendPopulationUpdateEvent();
        };
        self.sendBreederUpdateEvent = function() {
            $rootScope.$emit('breederUpdateEvent', { breeders: self.population.breeders, isBreeding: self.population.isBreeding(), stepsSinceBreed: self.stepsSinceBreed, breedSteps: self.breedSteps });
        };
        self.sendPopulationUpdateEvent = function() {
            $rootScope.$emit('populationUpdateEvent', { population: self.population.members, newborns: self.population.newborns, maxSize: self.population.maxSize, breederLimit: self.population.breederLimit, newbornLimit: self.population.newbornLimit });
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
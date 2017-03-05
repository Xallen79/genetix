var game = angular.module('bloqhead.genetixApp');
game.service('hiveService', [
    '$rootScope', '$filter', 'gameLoopService', 'Hive', 'logService', 'achievementService',
    function($rootScope, $filter, gameLoopService, Hive, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};
            self.breedSteps = state.breedSteps || self.breedSteps || 6;
            self.stepsSinceBreed = angular.isDefined(state.stepsSinceBreed) ? state.stepsSinceBreed : self.stepsSinceBreed || 0;
            self.hiveState = state.hiveState || self.hiveState;
            self.hive = (self.hiveState) ? new Hive(self.hiveState) : self.hive || new Hive();

            self.logService = logService;
            //self.sendBreederUpdateEvent();
            self.sendPopulationUpdateEvent();

        };
        self.getState = function() {
            var state = {
                breedSteps: self.breedSteps,
                stepsSinceBreed: self.stepsSinceBreed
            };
            state.hiveState = self.hive.getState();
            return state;
        };

        self.handleGameLoop = function(event, steps) {
            var popUpdated = false;
            if (event.name !== 'gameLoopEvent') {
                console.error('hiveService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            /*
            if (self.hive.isBreeding()) {
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
            */
        };
        /*
        self.addBreeder = function(id) {
            if (self.population.breeders.indexOf(id) === -1) {
                var genderToAdd = self.population.getById(id).hasTrait('Male') ? 'Male' : 'Female';
                var unit = {};
                if (self.population.breeders.length < self.population.breederLimit) {
                    if (self.population.breeders.length > 0) {
                        unit = self.population.getById(self.population.breeders[0]); //assuming only 2 breeders will exist
                        if (unit.hasTrait(genderToAdd)) {
                            self.removeBreeder(unit.id);
                        }
                    }
                    self.population.breeders.push(id);
                    self.logService.logBreedMessage("Breeder added: " + self.population.getById(id).name);
                    self.sendBreederUpdateEvent();
                } else {
                    for (var b = 0; b < self.population.breeders.length; b++) {
                        unit = self.population.getById(self.population.breeders[b]);
                        if (unit.hasTrait(genderToAdd)) {
                            self.removeBreeder(unit.id);
                            self.addBreeder(id);
                            break;
                        }
                    }
                }
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
        */
        self.updateMember = function(id, geneIndex, geneValues) {
            var member = self.hive.getById(id);
            member.genes[geneIndex] = geneValues;
            member.update();
            self.sendPopulationUpdateEvent();
        };
        self.setUnitJob = function(id, jid, jobName) {
            var unit = self.hive.getById(id);
            unit.jid = jid;
            unit.onStrike = false;
            var f = jobName.charAt(0).toLowerCase();
            var article = (f === 'a' || f === 'e' || f === 'i' || f === 'o' || f === 'u') ? 'an' : 'a';
            var msg = $filter('fmt')('%(name)s is now %(article)s %(job)s', { name: unit.name, article: article, job: jobName });
            self.logService.logWorkMessage(msg);
            self.sendPopulationUpdateEvent();
        };
        self.setBreederLimit = function(newLimit) {
            self.hive.breederLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setNurseryLimit = function(newLimit) {
            self.hive.newbornLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setPopulationLimit = function(newLimit) {
            self.hive.maxSize = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.processNewbornFate = function(unitid, fate) {
            self.hive.processNewbornFate(unitid, fate);
            self.sendPopulationUpdateEvent();
        };
        /*
        self.sendBreederUpdateEvent = function() {
            $rootScope.$emit('breederUpdateEvent', { breeders: self.hive.breeders, isBreeding: self.hive.isBreeding(), stepsSinceBreed: self.stepsSinceBreed, breedSteps: self.breedSteps });
        };
        */
        self.sendPopulationUpdateEvent = function() {
            $rootScope.$emit('populationUpdateEvent', { population: self.hive.members, newborns: self.hive.newborns, maxSize: self.hive.maxSize, breederLimit: self.hive.breederLimit, newbornLimit: self.hive.newbornLimit });
        };

        self.SubscribeBreederUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('breederUpdateEvent', callback);
            scope.$on('$destroy', handler);
            self.sendBreederUpdateEvent();
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('hiveUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendPopulationUpdateEvent();
        };

        gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
    }
]);
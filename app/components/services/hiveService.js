var game = angular.module('bloqhead.genetixApp');
game.service('hiveService', [
    '$rootScope', '$filter', 'gameLoopService', 'Hive', 'logService', 'achievementService',
    function($rootScope, $filter, gameLoopService, Hive, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};
            self.msSinceEgg = angular.isDefined(state.msSinceEgg) ? state.msSinceEgg : self.msSinceEgg || 0;
            self.hiveState = state.hiveState || self.hiveState;
            self.hive = (self.hiveState) ? new Hive(self.hiveState) : self.hive || new Hive();

            self.logService = logService;
            //self.sendBreederUpdateEvent();
            self.sendPopulationUpdateEvent();

        };
        self.getState = function() {
            var state = {
                eggLayMs: self.eggLayMs,
                msSinceEgg: self.msSinceEgg
            };
            state.hiveState = self.hive.getState();
            return state;
        };

        self.handleGameLoop = function(event, ms) {
            var popUpdated = false;
            if (event.name !== 'gameLoopEvent') {
                console.error('hiveService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            if (self.hive.canLayEggs()) {
                var eggLayMs = self.hive.getHeadQueen().getAbility('PRD_E').value;
                self.msSinceEgg += ms;
                while (self.msSinceEgg >= eggLayMs) {
                    self.msSinceEgg -= eggLayMs;
                    var eggName = self.hive.layEgg();
                    if (eggName !== null) {
                        logService.logBreedMessage($filter('fmt')("New egg! %1s", eggName));
                    }
                }
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

        self.sendPopulationUpdateEvent = function() {
            $rootScope.$emit('hiveUpdateEvent', {
                queen: self.hive.queen,
                drones: self.hive.drones,
                workers: self.hive.workers,
                eggs: self.hive.eggs,
                larva: self.hive.larva
            });
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('hiveUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendPopulationUpdateEvent();
        };

        gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
    }
]);
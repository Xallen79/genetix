var game = angular.module('bloqhead.genetixApp');
game.service('hiveService', [
    '$rootScope', '$filter', 'gameLoopService', 'Hive', 'logService', 'achievementService',
    function($rootScope, $filter, gameLoopService, Hive, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};
            //self.msSinceEgg = angular.isDefined(state.msSinceEgg) ? state.msSinceEgg : self.msSinceEgg || 0;
            //self.hiveState = state.hiveState || self.hiveState;
            //self.hive = (self.hiveState) ? new Hive(self.hiveState) : self.hive || new Hive();

            self.hives = self.hives || [];
            if (state.hiveStates) {
                self.hives = [];
                for (var h = 0; h < state.hiveStates.length; h++) {
                    self.hives.push(new Hive(state.hiveStates[h]));
                }
            } else {
                self.hives.push(new Hive({ id: 1 }));
            }

            self.logService = logService;
            //self.sendBreederUpdateEvent();
            self.sendPopulationUpdateEvent();

        };
        self.getState = function() {
            var state = {};
            state.hiveStates = [];
            for (var h = 0; h < self.hives.length; h++) {
                state.hiveStates.push(self.hives[h].getState());
            }
            return state;
        };

        self.handleGameLoop = function(event, ms) {
            var popUpdated = false;
            if (event.name !== 'gameLoopEvent') {
                console.error('hiveService.handleGameLoop - Invalid event: ' + event);
                return;
            }
            for (var h = 0; h < self.hives.length; h++) {
                var hive = self.hives[h];
                if (hive.canLayEggs()) {
                    var eggLayMs = hive.getHeadQueen().getAbility('PRD_E').value;
                    hive.msSinceEgg += ms;
                    while (hive.msSinceEgg >= eggLayMs) {
                        hive.msSinceEgg -= eggLayMs;
                        var eggName = hive.layEgg();
                        if (eggName !== null) {
                            logService.logBreedMessage($filter('fmt')("New egg! %1s", eggName));
                        }
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
            // var unit = self.hive.getById(id);        
            // unit.jid = jid;
            // unit.onStrike = false;
            // var f = jobName.charAt(0).toLowerCase();
            // var article = (f === 'a' || f === 'e' || f === 'i' || f === 'o' || f === 'u') ? 'an' : 'a';
            // var msg = $filter('fmt')('%(name)s is now %(article)s %(job)s', { name: unit.name, article: article, job: jobName });
            // self.logService.logWorkMessage(msg);
            // self.sendPopulationUpdateEvent();
        };
        self.setNurseryLimit = function(newLimit, hiveId) {
            var hive = $filter('filter')(self.hives, { id: hiveId })[0];
            hive.newbornLimit = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.setPopulationLimit = function(newLimit, hiveId) {
            var hive = $filter('filter')(self.hives, { id: hiveId })[0];
            hive.maxSize = newLimit;
            self.sendPopulationUpdateEvent();
        };
        self.processFate = function(unitid, fate, hiveId) {
            var hive = $filter('filter')(self.hives, { id: hiveId })[0];
            if (fate === 'DRONE' || fate === 'LARVA')
                hive.processEggFate(unitid, fate);
            else
                hive.processLarvaFate(unitid, fate);
            self.sendPopulationUpdateEvent();
        };

        self.sendPopulationUpdateEvent = function() {
            var data = [];
            for (var h = 0; h < self.hives.length; h++) {
                var hive = self.hives[h];
                data.push({
                    id: hive.id,
                    queens: hive.queens,
                    drones: hive.drones,
                    workers: hive.workers,
                    eggs: hive.eggs,
                    larva: hive.larva
                });
            }
            $rootScope.$emit('hiveUpdateEvent', data);
        };

        self.SubscribePopulationUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('hiveUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendPopulationUpdateEvent();
        };

        gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
    }
]);
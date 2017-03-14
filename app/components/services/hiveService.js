var game = angular.module('bloqhead.genetixApp');
game.service('hiveService', [
    '$rootScope', '$filter', '$q', 'gameLoopService', 'Hive', 'logService', 'achievementService',
    function($rootScope, $filter, $q, gameLoopService, Hive, logService, achievementService) {
        var self = this;

        self.init = function(state) {
            state = state || {};

            self.hives = [];
            if (state.hiveStates) {
                for (var h = 0; h < state.hiveStates.length; h++) {
                    self.hives.push(new Hive(state.hiveStates[h]));
                }
            } else {
                self.hives.push(new Hive({
                    "id": 1,
                    "initialSize": 2,
                    "maxSize": 5,
                    "beeMutationChance": 0.0025,
                    "pos": "D2"
                }));
                self.hives.push(new Hive({
                    "id": 2,
                    "initialSize": 2,
                    "maxSize": 5,
                    "beeMutationChance": 0.0025,
                    "pos": "Q13"
                }));
            }

            self.logService = logService;
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
            if (ms === 0) return;
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
                            logService.logBreedMessage($filter('fmt')("New egg laid in Hive#%1d! (%2s)", hive.id, eggName));
                        }
                    }
                }
            }
        };
        self.getObjectPositions = function(hiveId) {

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
            if (fate === 'DRONE' || fate === 'LARVA' || fate === 'CONSUME_EGG')
                hive.processEggFate(unitid, fate);
            else
                hive.processLarvaFate(unitid, fate);
            self.sendPopulationUpdateEvent();
        };

        self.getHive = function(hiveId) {
            return $filter('filter')(self.hives, { id: hiveId })[0];
        };

        self.sendPopulationUpdateEvent = function() {
            var data = [];
            for (var h = 0; h < self.hives.length; h++) {
                var hive = self.hives[h];
                data.push({
                    id: hive.id,
                    pos: hive.pos,
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
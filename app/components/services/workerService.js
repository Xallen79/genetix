/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.service('workerService', [
    '$rootScope', '$filter', 'jobTypes', 'resourceTypes', 'resourceService', 'achievementService', 'gameLoopService', 'logService',
    function($rootScope, $filter, jobTypes, resourceTypes, resourceService, achievementService, gameLoopService, logService) {
        var self = this;
        var initialized = false;
        var state;
        var lastSnapshot;
        var resourceStats = {};
        self.init = function(loadState) {
            state = loadState || state || {};
            if (!initialized) {
                gameLoopService.SubscribeGameLoopEvent($rootScope, handleLoop);
                //hiveService.SubscribePopulationUpdateEvent($rootScope, self.handlePopulationUpdate);
                initialized = true;
            } else {
                //self.handlePopulationUpdate(null, hiveService.hives);
            }
            for (var res in resourceTypes) {
                resourceStats[res] = {
                    rate: 0,
                    working: 0,
                    stepsSinceUpdate: 0

                };
            }
            self.getWorkersSnapshot();
        };

        self.getState = function() {
            return state;
        };
        self.addWorker = function(jid, unitid) {
            var notWorking = $filter('filter')(state.workers, {
                unitid: unitid
            }).length === 0;
            var tmpWorkers = [];
            if (!notWorking)
                tmpWorkers = state.workers.filter(function(worker) {
                    return worker.unitid !== unitid || (worker.unitid === unitid && worker.jid === jid);
                });

            if (notWorking || tmpWorkers.length != state.workers.length) {
                if (!notWorking)
                    state.workers = angular.copy(tmpWorkers);
                state.workers.push({
                    jid: jid,
                    unitid: unitid,
                    stepsSinceWork: 0
                });
                //hiveService.setUnitJob(unitid, jid, jobTypes[jid].name);
                self.getWorkersSnapshot();
            }
        };

        self.getWorkersSnapshot = function() {
            var snapshot = [];
            for (var key in jobTypes) {
                if (jobTypes.hasOwnProperty(key)) {
                    var group = $filter('filter')(state.workers, {
                        jid: key
                    });
                    var gatherRatePerSec = getGatherRate(group, key);
                    var jt = jobTypes[key];
                    snapshot.push({
                        jid: jt.jid,
                        resource: jt.resource,
                        name: jt.name,
                        description: jt.description,
                        count: group.length,
                        rate: gatherRatePerSec
                    });
                }
            }
            if (!angular.equals(lastSnapshot, snapshot)) {
                $rootScope.$emit('workersChangedEvent', angular.copy(snapshot));
            }
            lastSnapshot = snapshot;
            return angular.copy(snapshot);
        };

        self.SubscribeWorkersChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('workersChangedEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
            $rootScope.$emit('workersChangedEvent', self.getWorkersSnapshot());
        };

        self.handlePopulationUpdate = function(event, data) {
            if (data.length > 0) {
                for (var m = 0; m < data[0].workers.length; m++) {
                    var unit = data[0].workers[m];
                    if (unit.jid) {

                        self.addWorker(unit.jid, unit.id);

                    }
                }
            }
            self.getWorkersSnapshot();
        };

        function handleLoop(event, steps) {}

        function getGatherRate(workers, jid) {
            //var resources = resourceService.getResourcesSnapshot();
            var gatherRate = 0;
            return gatherRate * gameLoopService.stepTimeMs / 1000;
        }

    }
]);
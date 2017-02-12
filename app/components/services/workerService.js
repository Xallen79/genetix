var game = angular.module('bloqhead.genetixApp');

game.service('workerService', [
    '$rootScope', '$filter', 'jobTypes', 'resourceTypes', 'resourceService', 'populationService', 'achievementService', 'gameLoopService',
    function($rootScope, $filter, jobTypes, resourceTypes, resourceService, populationService, achievementService, gameLoopService) {
        var self = this;
        var initialized = false;
        var state;
        var lastSnapshot;
        self.init = function(loadState) {
            state = loadState || state || {};
            if (!initialized) {
                gameLoopService.SubscribeGameLoopEvent($rootScope, handleLoop);
                initialized = true;
            }

            self.getWorkersSnapshot();
        };

        self.getState = function() {
            return state;
        };
        self.addWorker = function(workerType, unitid) {
            var notWorking = $filter('filter')(state.workers, { unitid: unitid }).length === 0;
            var tmpWorkers = [];
            if (!notWorking)
                tmpWorkers = state.workers.filter(function(worker) {
                    return worker.unitid !== unitid || (worker.unitid === unitid && worker.jobType === workerType);
                });

            if (notWorking || tmpWorkers.length != state.workers.length) {
                if (!notWorking)
                    state.workers = angular.copy(tmpWorkers);
                state.workers.push({
                    type: workerType,
                    unitid: unitid,
                    stepsSinceWork: 0
                });
                populationService.setUnitJob(unitid, workerType);
                self.getWorkersSnapshot();
            }
        };

        self.getWorkersSnapshot = function() {
            var snapshot = [];
            for (var key in jobTypes) {
                if (jobTypes.hasOwnProperty(key)) {
                    var group = $filter('filter')(state.workers, { type: key });
                    snapshot.push({
                        type: key,
                        name: jobTypes[key].name,
                        description: jobTypes.description,
                        count: group.length
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

        function handleLoop(event, steps) {
            var resources = resourceService.getResourcesSnapshot();
            for (var i = 0; i < state.workers.length; i++) {
                var worker = state.workers[i];
                var job = jobTypes[worker.type];
                var elapsed = 0;
                worker.stepsSinceWork += steps;
                while (worker.stepsSinceWork >= job.baseWorkerSteps) {
                    elapsed++;
                    worker.stepsSinceWork -= job.baseWorkerSteps;
                }
                resources[job.resource].gatherAmount = resources[job.resource].gatherAmount || 0;
                resources[job.resource].gatherAmount += (job.baseAmount * elapsed);

            }
            for (var key in resources) {
                if (resources.hasOwnProperty(key) && resources[key].gatherAmount) {
                    resourceService.changeResource(key, resources[key].gatherAmount);
                }
            }
        }
    }
]);
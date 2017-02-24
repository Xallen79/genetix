var game = angular.module('bloqhead.genetixApp');

game.service('workerService', [
    '$rootScope', '$filter', 'jobTypes', 'resourceTypes', 'resourceService', 'populationService', 'achievementService', 'gameLoopService', 'logService',
    function($rootScope, $filter, jobTypes, resourceTypes, resourceService, populationService, achievementService, gameLoopService, logService) {
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
        self.addWorker = function(jid, unitid) {
            var notWorking = $filter('filter')(state.workers, { unitid: unitid }).length === 0;
            var tmpWorkers = [];
            if (!notWorking)
                tmpWorkers = state.workers.filter(function(worker) {
                    return worker.unitid !== unitid || (worker.unitid === unitid && worker.jobType === jid);
                });

            if (notWorking || tmpWorkers.length != state.workers.length) {
                if (!notWorking)
                    state.workers = angular.copy(tmpWorkers);
                state.workers.push({
                    jid: jid,
                    unitid: unitid,
                    stepsSinceWork: 0
                });
                populationService.setUnitJob(unitid, jid, jobTypes[jid].name);
                self.getWorkersSnapshot();
            }
        };

        self.getWorkersSnapshot = function() {
            var snapshot = [];
            for (var key in jobTypes) {
                if (jobTypes.hasOwnProperty(key)) {
                    var group = $filter('filter')(state.workers, { jid: key });
                    var jt = jobTypes[key];
                    snapshot.push({
                        jid: jt.jid,
                        resource: jt.resource,
                        name: jt.name,
                        description: jt.description,
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
                var unit = populationService.population.getById(worker.unitid);
                var job = jobTypes[worker.jid];
                var elapsed = 0;
                worker.stepsSinceWork += steps;
                while (worker.stepsSinceWork >= job.baseWorkerSteps) {
                    elapsed++;
                    worker.stepsSinceWork -= job.baseWorkerSteps;
                }
                resources[job.resource].gatherAmount = resources[job.resource].gatherAmount || 0;
                if (elapsed > 0 && ((resources[job.resource][0] + resources[job.resource].gatherAmount) < resources[job.resource][1] || resources[job.resource][1] === -1)) {
                    var a = unit.getAttribute(resourceTypes[job.resource].attr);
                    gatherAmount = Math.round((job.baseAmount * elapsed * resources[job.resource][3] * Math.pow(10, a)));
                    resources[job.resource].gatherAmount += gatherAmount;
                    var msg = $filter('fmt')('%(name)s produced %(amt)d %(res)s.', { name: unit.name, amt: gatherAmount, res: resourceTypes[job.resource].name });
                    //logService.logWorkMessage(msg);
                }



            }
            for (var key in resources) {
                if (resources.hasOwnProperty(key) && resources[key].gatherAmount) {
                    resourceService.changeResource(key, resources[key].gatherAmount);
                }
            }
        }
    }
]);
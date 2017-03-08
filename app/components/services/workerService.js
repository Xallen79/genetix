var game = angular.module('bloqhead.genetixApp');

game.service('workerService', [
    '$rootScope', '$filter', 'jobTypes', 'resourceTypes', 'resourceService', 'hiveService', 'achievementService', 'gameLoopService', 'logService',
    function($rootScope, $filter, jobTypes, resourceTypes, resourceService, hiveService, achievementService, gameLoopService, logService) {
        var self = this;
        var initialized = false;
        var state;
        var lastSnapshot;
        var resourceStats = {};
        self.init = function(loadState) {
            state = loadState || state || {};
            if (!initialized) {
                gameLoopService.SubscribeGameLoopEvent($rootScope, handleLoop);
                hiveService.SubscribePopulationUpdateEvent($rootScope, self.handlePopulationUpdate);
                initialized = true;
            } else {
                self.handlePopulationUpdate(null, { workers: hiveService.hive.workers });
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
            var notWorking = $filter('filter')(state.workers, { unitid: unitid }).length === 0;
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
                hiveService.setUnitJob(unitid, jid, jobTypes[jid].name);
                self.getWorkersSnapshot();
            }
        };

        self.getWorkersSnapshot = function() {
            var snapshot = [];
            for (var key in jobTypes) {
                if (jobTypes.hasOwnProperty(key)) {
                    var group = $filter('filter')(state.workers, { jid: key });
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
            for (var m = 0; m < data.workers.length; m++) {
                var unit = data.workers[m];
                if (unit.jid) {

                    self.addWorker(unit.jid, unit.id);

                }
            }
            self.getWorkersSnapshot();
        };

        function handleLoop(event, steps) {
            var resources = resourceService.getResourcesSnapshot();
            resources.HAPPINESS.gatherAmount = 0;
            var workCost = Math.ceil(hiveService.hive.workers.length / 5);
            var workerStats = [];
            while (steps > 0) {
                for (var i = 0; i < state.workers.length; i++) {
                    var worker = state.workers[i];
                    var unit = hiveService.hive.getById(worker.unitid);
                    var job = jobTypes[worker.jid];
                    var elapsed = 0;
                    resources[job.resource].gatherAmount = resources[job.resource].gatherAmount || 0;
                    var canGather = ((resources[job.resource][0] + resources[job.resource].gatherAmount) < resources[job.resource][1] || resources[job.resource][1] === -1);
                    if (!canGather) {
                        unit.stepsSinceWork = 0;
                        continue;
                    }
                    if (worker.jid !== 'IDLE' && worker.stepsSinceWork === 0) {
                        var sMsg;
                        var currentHappiness = resources.HAPPINESS.gatherAmount + resources.HAPPINESS[0];
                        if (currentHappiness >= workCost) {
                            resources.HAPPINESS.gatherAmount -= workCost;
                        }
                        if (currentHappiness < workCost) {
                            if (!unit.onStrike) {
                                unit.onStrike = true;
                                sMsg = $filter('fmt')('%(name)s is on strike!', { name: unit.name });
                                logService.logWorkMessage(sMsg);
                            }
                            continue;
                        }
                        unit.onStrike = false;
                        // sMsg = $filter('fmt')('%(name)s started collecting %(res)s, %(cost)d Happiness has been deducted.', { name: unit.name, res: resourceTypes[job.resource].name, cost: workCost });
                        // logService.logWorkMessage(sMsg);

                    }
                    worker.stepsSinceWork++;
                    if (worker.stepsSinceWork >= job.baseWorkerSteps) {
                        elapsed = 1;
                        worker.stepsSinceWork -= job.baseWorkerSteps;

                    }
                    resources[job.resource].gatherAmount = resources[job.resource].gatherAmount || 0;
                    if (elapsed > 0 && canGather) {
                        //var a = unit.getAttribute(resourceTypes[job.resource].attr);
                        gatherAmount = Math.round((job.baseAmount * elapsed * resources[job.resource][3] /** Math.pow(10, a)*/ ));
                        resources[job.resource].gatherAmount += gatherAmount;

                        if (!angular.isDefined(workerStats[unit.name])) {
                            workerStats[unit.name] = {};
                            workerStats[unit.name].gatherAmount = 0;
                            workerStats[unit.name].resource = resourceTypes[job.resource].name;
                        }

                        workerStats[unit.name].gatherAmount = workerStats[unit.name].gatherAmount || 0;
                        workerStats[unit.name].gatherAmount += gatherAmount;
                        unit.earnings[job.resource].amount += gatherAmount;
                        //console.log(unit.earnings);
                    }



                }
                steps--;
            }
            for (var key in resources) {
                if (resources.hasOwnProperty(key) && resources[key].gatherAmount) {
                    resourceService.changeResource(key, resources[key].gatherAmount);
                }
            }
            // for (var name in workerStats) {
            //     var msg = $filter('fmt')('%(name)s produced %(amt)d %(res)s.', { name: name, amt: workerStats[name].gatherAmount, res: workerStats[name].resource });
            //     logService.logWorkMessage(msg);
            // }
            self.getWorkersSnapshot();
        }

        function getGatherRate(workers, jid) {
            var resources = resourceService.getResourcesSnapshot();
            var gatherRate = 0;
            for (var w = 0; w < workers.length; w++) {
                var unit = hiveService.hive.getById(workers[w].unitid);
                var job = jobTypes[jid];
                /*if (unit.onStrike) continue;*/
                //var a = unit.getAttribute(resourceTypes[job.resource].attr);
                if (resources[job.resource][1] === -1 || resources[job.resource][0] < resources[job.resource][1])
                    gatherRate += Math.round((job.baseAmount * resources[job.resource][3] /** Math.pow(10, a)*/ )) / job.baseWorkerSteps;

            }
            if (jid === "IDLE") {
                var workCost = Math.ceil(hiveService.hive.workers.length / 5);
                var realJobs = $filter('filter')(state.workers, { jid: '!' + jid });
                for (var i = 0; i < realJobs.length; i++) {
                    var worker = realJobs[i];
                    var j = jobTypes[worker.jid];
                    var u = hiveService.hive.getById(worker.unitid);
                    if ( /*!u.onStrike && */ (resources[j.resource][1] === -1 || resources[j.resource][0] < resources[j.resource][1]))
                        gatherRate -= (workCost / j.baseWorkerSteps);
                }
            }

            return gatherRate * gameLoopService.stepTimeMs / 1000;
        }

    }
]);
/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.factory('Hive', [
    '$rootScope', '$filter', '$q', 'Bee', 'logService', 'jobTypes',
    function($rootScope, $filter, $q, Bee, logService, jobTypes) {

        /* constructor */
        var Hive = function(state) {
            this.update(state);
        };
        /* public functions */
        Hive.prototype.update = function(state) {
            state = state || {};
            this.id = state.id || this.id;
            this.pos = state.pos || this.pos || 'A1';
            this.currentGeneration = state.currentGeneration || this.currentGeneration || 0;
            this.newbornLimit = state.newbornLimit || this.newbornLimit || 0;
            this.beeMutationChance = state.beeMutationChance || this.beeMutationChance || 0.005;
            this.nextId = state.nextId || this.nextId || 0;

            this.bees = this.bees || [];
            if (state.queenStates) {
                for (var q = 0; q < state.queenStates.length; q++) {
                    this.bees.push(new Bee.Queen(state.queenStates[q]));
                }
            }
            if (this.getBeesByType(Bee.Types.QUEEN).length === 0) {
                this.createInitialQueen(true);
            }

            if (state.droneStates) {
                for (var d = 0; d < state.droneStates.length; d++) {
                    this.bees.push(new Bee.Drone(state.droneStates[d]));
                }
            }
            if (state.workerStates) {
                for (var w = 0; w < state.workerStates.length; w++) {
                    this.bees.push(new Bee.Worker(state.workerStates[w]));
                }
            }
            if (state.eggStates) {
                for (var e = 0; e < state.eggStates.length; e++) {
                    this.bees.push(new Bee.Egg(state.eggStates[e]));
                }
            }
            if (state.larvaStates) {
                this.larva = [];
                for (var l = 0; l < state.larvaStates.length; l++) {
                    this.bees.push(new Bee.Larva(state.larvaStates[l]));
                }
            }
        };

        Hive.prototype.getState = function() {
            var self = this;
            var state = {
                id: this.id,
                currentGeneration: this.currentGeneration,
                beeMutationChance: this.beeMutationChance,
                nextId: this.nextId,
                queenStates: [],
                droneStates: [],
                workerStates: [],
                eggStates: [],
                larvaStates: [],
                msSinceEgg: this.msSinceEgg,
                pos: this.pos
            };
            var queens = self.getBeesByType(Bee.Types.QUEEN);
            var drones = self.getBeesByType(Bee.Types.DRONE);
            var workers = self.getBeesByType(Bee.Types.WORKER);
            var eggs = self.getBeesByType(Bee.Types.EGG);
            var larva = self.getBeesByType(Bee.Types.LARVA);
            for (var q = 0; q < queens.length; q++) {
                state.queenStates.push(queens[q].getState());
            }
            for (var d = 0; d < drones.length; d++) {
                state.droneStates.push(drones[d].getState());
            }
            for (var w = 0; w < workers.length; w++) {
                state.workerStates.push(workers[w].getState());
            }
            for (var e = 0; e < eggs.length; e++) {
                state.eggStates.push(eggs[e].getState());
            }
            for (var l = 0; l < larva.length; l++) {
                state.larvaStates.push(larva[l].getState());
            }
            return state;
        };
        Hive.prototype.getNextId = function() {
            return $filter('fmt')('%d-H%d', ++this.nextId, this.id);
        };
        Hive.prototype.createInitialQueen = function(inseminate) {
            var queen = new Bee.Queen({
                id: this.getNextId(),
                generation: 0,
                dominant: true, // 
                beeMutationChance: this.beeMutationChance,
                jid: 'BREEDER'
            });
            if (inseminate) {
                for (var d = 0; d < 10; d++) {
                    var drone = new Bee.Drone({
                        id: this.getNextId(),
                        generation: 0,
                        beeMutationChance: this.beeMutationChance
                    });
                    queen.mate(drone);
                }
            }
            queen.update();
            this.bees.push(queen);
        };

        Hive.prototype.getBeesByType = function(type) {
            return $filter('filter')(this.bees, { beetype: type }, true);
        };

        Hive.prototype.getBeeById = function(id) {
            return $filter('filter')(this.bees, { id: id }, true)[0];
        };
        Hive.prototype.getNurseryCount = function() {
            return this.getBeesByType(Bee.Types.EGG).length + this.getBeesByType(Bee.Types.LARVA).length;
        };
        Hive.prototype.getNurseryLimit = function() {
            return 5; //TODO remove hardcode.
        };
        Hive.prototype.getPopulationCount = function() {
            return this.bees.length - this.getNurseryCount();
        };
        Hive.prototype.getPopulationLimit = function() {
            return 20; //TODO remove hardcode.
        };
        Hive.prototype.getHeadQueen = function() {
            return $filter('filter')(this.getBeesByType(Bee.Types.QUEEN), { jid: 'BREEDER' })[0];
        };

        Hive.prototype.processEggFate = function(id, fate) {
            var index;
            var egg = this.bees.filter(function(unit, i) {
                if (unit.id === id && unit.beetype === Bee.Types.EGG) {
                    index = i;
                    return true;
                }
            })[0];
            var msg = "";
            switch (fate) {
                case "DRONE":
                    var drone = egg.hatch(Bee.Types.DRONE);
                    this.bees[index] = drone;
                    msg = $filter('fmt')('New drone in Hive#%(id)d! (%(newname)s)', { id: this.id, newname: drone.name });
                    break;
                case "LARVA":
                    var queen = this.getHeadQueen();
                    if (!queen) {
                        msg = $filter('fmt')('Cannot fertilize egg. There is no queen assigned to breeding duties.');
                    } else {
                        var larva = queen.fertilizeEgg(egg, egg.id);
                        this.bees[index] = larva;
                        msg = $filter('fmt')('New larva in Hive#%(id)d! (%(newname)s)', { id: this.id, newname: larva.name });
                    }
                    break;
                case "CONSUME_EGG":
                    msg = $filter('fmt')("%(name)s has been turned into food for Hive#%(id)d", { name: egg.name, id: this.id });
                    this.bees.splice(index, 1);
                    break;
                default:
                    msg = $filter('fmt')('Invalid %(fate)s', { fate: fate });
                    console.error("Invalid fate: " + fate);
                    break;
            }
            logService.logBreedMessage(msg);
        };
        Hive.prototype.processLarvaFate = function(id, fate) {
            var index;
            var newborn = this.bees.filter(function(unit, i) {
                if (unit.id === id) {
                    index = i;
                    return true;
                }
            })[0];
            var msg = "";
            switch (fate) {
                case "WORKER":
                    var worker = newborn.mature(Bee.Types.WORKER);
                    this.bees[index] = worker;
                    msg = $filter('fmt')("New worker in Hive#%(id)d! (%(name)s)", { name: newborn.name, id: this.id });
                    break;
                case "QUEEN":
                    var queen = newborn.mature(Bee.Types.QUEEN);
                    this.bees[index] = queen;
                    msg = $filter('fmt')("New queen in Hive#%(id)d! (%(name)s)", { name: newborn.name, id: this.id });
                    break;
                case "CONSUME_LARVA":
                    msg = $filter('fmt')("%(name)s will be turned into food for Hive#%(id)d", { name: newborn.name, id: this.id });
                    newborn.die();
                    break;
                default:
                    msg = msg = $filter('fmt')("Invalid %(fate)s", { fate: fate });
                    console.error("Invalid fate: " + fate);
                    break;
            }
            logService.logBreedMessage(msg);
        };

        Hive.prototype.setUnitJob = function(id, jid) {
            var unit = this.getBeeById(id, "WORKER");
            if (unit) {
                unit.jid = jid;
                var jobName = jobTypes[jid].name;
                var f = jobName.charAt(0).toLowerCase();
                var article = (f === 'a' || f === 'e' || f === 'i' || f === 'o' || f === 'u') ? 'an' : 'a';
                var msg = $filter('fmt')('%(name)s is now %(article)s %(job)s', { name: unit.name, article: article, job: jobName });
                logService.logWorkMessage(msg);
            }
        };

        Hive.prototype.setPopulationLimit = function(newLimit) {

        };
        Hive.prototype.processFate = function(unitid, fate) {
            if (fate === 'DRONE' || fate === 'LARVA' || fate === 'CONSUME_EGG')
                this.processEggFate(unitid, fate);
            else
                this.processLarvaFate(unitid, fate);
        };

        Hive.prototype.handleGameLoop = function(event, ms) {
            var self = this;
            if (ms === 0)
                return;

            if (event.name !== 'gameLoopEvent') {
                console.error('Hive.handleGameLoop - Invalid event: ' + event);
                return;
            }

            for (var b = 0; b < self.bees.length; b++) {
                self.bees[b].doWork(ms, this);
                //if (egg) self.eggs.push(egg);
            }

            // if (this.canLayEggs()) {
            //     var eggLayMs = this.getHeadQueen().getAbility('PRD_E').value;
            //     this.msSinceEgg += ms;
            //     while (this.msSinceEgg >= eggLayMs) {
            //         this.msSinceEgg -= eggLayMs;
            //         var eggName = this.layEgg();
            //         if (eggName !== null) {
            //             logService.logBreedMessage($filter('fmt')("New egg laid in Hive#%1d! (%2s)", this.id, eggName));
            //         }
            //     }
            // }
        };

        return Hive;
    }
]);
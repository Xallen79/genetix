/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.factory('Hive', [
    '$rootScope', '$filter', '$q', 'Bee', 'logService', 'jobTypes', 'resourceTypes', 'buildingTypes',
    function($rootScope, $filter, $q, Bee, logService, jobTypes, resourceTypes, buildingTypes) {
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
            this.updateResources(state);
            this.updateBees(state);
            this.updateBuildings(state);
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
                resources: this.resources,
                buildings: this.buildings,
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
            return this.nurseryLimit; //TODO remove hardcode.
        };
        Hive.prototype.getPopulationCount = function() {
            return this.bees.length - this.getNurseryCount();
        };
        Hive.prototype.getPopulationLimit = function() {
            return this.populationLimit; //TODO remove hardcode.
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
            var bee = this.getBeeById(id, "WORKER");
            if (bee) {
                if (bee.setJob(jid)) {
                    var jobName = jobTypes[jid].name;
                    var f = jobName.charAt(0).toLowerCase();
                    var article = (f === 'a' || f === 'e' || f === 'i' || f === 'o' || f === 'u') ? 'an' : 'a';
                    var msg = $filter('fmt')('%(name)s is now %(article)s %(job)s', { name: bee.name, article: article, job: jobName });
                    logService.logWorkMessage(msg);
                }
            }
        };

        Hive.prototype.processFate = function(unitid, fate) {
            if (fate === 'DRONE' || fate === 'LARVA' || fate === 'CONSUME_EGG')
                this.processEggFate(unitid, fate);
            else
                this.processLarvaFate(unitid, fate);
        };

        Hive.prototype.build = function(building, gifted) {
            var self = this;
            var built = true;
            var spent = [];
            if (gifted) {
                building.gifted++;
            } else {
                for (var c = 0; c < building.nextCost.length; c++) {
                    built = self.changeResource(building.nextCost[c].rid, -1 * building.nextCost[c].amount) !== -1;
                    if (!built) break;

                    spent.push(building.nextCost);
                }
            }
            // make sure the building was built, if not refund anything that was spent.
            if (built) {
                if (!gifted) building.purchased++;
                self.updateSize(building);

            } else {
                // refund
                for (var s = 0; s < spent.length; s++) {
                    self.changeResource(spent[s].rid, spent[s].amount);
                }
            }

            return built;
        };

        Hive.prototype.changeResource = function(rid, amount) {
            var self = this;
            var r = self.resources[rid];
            if (r[2] === false && r[1] !== -1) {
                console.error(rid + " is not enabled, cannot increase amount.");
                return;
            }

            r[0] += amount;
            var actualAmount = amount;
            if (r[1] != -1 && r[0] > r[1]) {
                actualAmount = amount - (r[0] - r[1]);
                r[0] = r[1];
            }
            // if this puts us negative, we cannot deduct the amount, reset and return -1 to indicate failure.
            if (r[0] < 0) {
                r[0] -= amount;
                return -1;
            }
            // we didn't actually add anything, return -2
            if (actualAmount === 0)
                return -2;
            // if (actualAmount > 0)
            //     achievementService.updateProgress('A_' + rid + '_E', actualAmount); // earning achievement
            self.updateBuildings();
            return r[0];
        };

        Hive.prototype.handleGameLoop = function(event, ms, map) {
            var self = this;
            if (ms === 0)
                return;

            if (event.name !== 'gameLoopEvent') {
                console.error('Hive.handleGameLoop - Invalid event: ' + event);
                return;
            }

            for (var b = 0; b < self.bees.length; b++) {
                self.bees[b].doWork(ms, this, map);
            }
        };

        Hive.prototype.getNextId = function() {
            return $filter('fmt')('%d-H%d', ++this.nextId, this.id);
        };


        // Privatish functions

        /* Bees related */
        Hive.prototype.updateBees = function(state) {
            var self = this;
            state = state || {};
            self.bees = self.bees || [];
            if (state.queenStates) {
                for (var q = 0; q < state.queenStates.length; q++) {
                    self.bees.push(new Bee.Queen(state.queenStates[q]));
                }
            }
            if (self.getBeesByType(Bee.Types.QUEEN).length === 0) {
                self.createInitialQueen(true);
            }

            if (state.droneStates) {
                for (var d = 0; d < state.droneStates.length; d++) {
                    self.bees.push(new Bee.Drone(state.droneStates[d]));
                }
            }
            if (state.workerStates) {
                for (var w = 0; w < state.workerStates.length; w++) {
                    self.bees.push(new Bee.Worker(state.workerStates[w]));
                }
            }
            if (state.eggStates) {
                for (var e = 0; e < state.eggStates.length; e++) {
                    self.bees.push(new Bee.Egg(state.eggStates[e]));
                }
            }
            if (state.larvaStates) {
                self.larva = [];
                for (var l = 0; l < state.larvaStates.length; l++) {
                    self.bees.push(new Bee.Larva(state.larvaStates[l]));
                }
            }
        };

        Hive.prototype.createInitialQueen = function(inseminate) {
            var self = this;
            var queen = new Bee.Queen({
                id: self.getNextId(),
                generation: 0,
                dominant: true, // 
                beeMutationChance: this.beeMutationChance,
                jid: 'BREEDER',
                pos: this.pos
            });
            if (inseminate) {
                for (var d = 0; d < 10; d++) {
                    var drone = new Bee.Drone({
                        id: self.getNextId(),
                        generation: 0,
                        beeMutationChance: this.beeMutationChance,
                        pos: this.pos
                    });
                    queen.mate(drone);
                }
            }
            queen.update();
            self.bees.push(queen);
        };

        /* Resource related */
        Hive.prototype.updateResources = function(state) {
            var self = this;
            state = state || {};
            self.resources = state.resources || self.resources || {};
            var overrideAllOn = false;
            //[0] owned, [1] max, [2] enabled
            var defaultResources = {
                NECTAR: [10, 0, true || overrideAllOn],
                POLLEN: [10, 0, true || overrideAllOn],
                WATER: [10, 0, true || overrideAllOn],
                FOOD: [10, 0, true || overrideAllOn],
                HONEY: [10, 0, true || overrideAllOn],
                ROYAL_JELLY: [0, 0, true || overrideAllOn],
                WAX: [50, 0, true || overrideAllOn],
                DEADBEES: [0, -1, true || overrideAllOn],
                DEFENSE: [0, -1, true || overrideAllOn]
            };
            for (var resourceType in resourceTypes) {
                if (resourceTypes.hasOwnProperty(resourceType)) {
                    var r = self.resources[resourceType];
                    if (typeof r == 'undefined') {
                        // if there is no default, instead of failing we are just going to add it with a max of 911 so that we are aware of the problem
                        r = defaultResources[resourceType] || [0, 911, overrideAllOn, 1];
                        self.resources[resourceType] = r;
                    }
                }
            }
        };



        /* Building related */
        Hive.prototype.updateBuildings = function(state) {
            var self = this;
            state = state || {};
            self.buildings = state.buildings || self.buildings || {};
            for (var buildingType in buildingTypes) {
                if (buildingTypes.hasOwnProperty(buildingType)) {
                    var b = self.buildings[buildingType];
                    if (typeof b == 'undefined') {
                        b = angular.copy(buildingTypes[buildingType]);
                        self.buildings[buildingType] = b;
                    }
                    if (b.rid) {
                        b.name = $filter('fmt')(b.name, { resource: resourceTypes[b.rid].name });
                        b.description = $filter('fmt')(b.description, { resource: resourceTypes[b.rid].name });
                    }
                    self.setCanBuild(b);
                    self.updateSize(b);
                }
            }

        };

        Hive.prototype.setNextCost = function(building) {
            building.nextCost = [];
            for (var i = 0; i < building.cost.length; i++) {
                var cost = building.cost[i];
                var nextAmount = Math.ceil(cost.base * Math.pow(1 + (cost.percent / 100), (building.purchased)));
                building.nextCost.push({ rid: cost.rid, resourceName: resourceTypes[cost.rid].name, amount: nextAmount });
            }
        };

        Hive.prototype.setCanBuild = function(building) {
            var self = this;
            if (!angular.isDefined(building.nextCost)) {
                self.setNextCost(building);
            }
            var nextCost = building.nextCost;
            for (var c = 0; c < nextCost.length; c++) {
                var r = self.resources[nextCost[c].rid];
                if (!angular.isDefined(r) || r[0] < nextCost[c].amount) {
                    building.canBuild = false;
                    return false;
                }
            }
            building.canBuild = true;
            return true;
        };

        Hive.prototype.getSize = function(building) {
            return Math.floor(building.size.base * Math.pow(1 + (building.size.percent / 100), (building.gifted + building.purchased - 1)));
        };

        Hive.prototype.updateSize = function(building) {
            var self = this;
            if (building.use === 'storage')
                self.resources[building.rid][1] = self.getSize(building);
            else if (building.use === 'housing')
                self.populationLimit = self.getSize(building);
            else if (building.use === 'nursery')
                self.nurseryLimit = self.getSize(building);
        };


        return Hive;
    }
]);
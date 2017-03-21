var game = angular.module('bloqhead.genetixApp');

game.factory('Hive', [
    '$rootScope', '$filter', '$q', 'Queen', 'Drone', 'Worker', 'Egg', 'Larva', 'logService',
    function($rootScope, $filter, $q, Queen, Drone, Worker, Egg, Larva, logService) {

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
            this.maxSize = state.maxSize || this.maxSize || 10;
            this.beeMutationChance = state.beeMutationChance || this.beeMutationChance || 0.005;
            this.initialSize = state.initialSize || this.initialSize || 2;
            this.nextId = state.nextId || this.nextId || 0;
            this.msSinceEgg = state.msSinceEgg || this.msSinceEgg || 0;

            this.queens = this.queens || [];
            if (state.queenStates) {
                this.queens = [];
                for (var q = 0; q < state.queenStates.length; q++) {
                    this.queens.push(new Queen(state.queenStates[q]));
                }
            }
            if (this.queens.length === 0) {
                this.createInitialQueen(true);
            }

            this.drones = this.drones || [];
            if (state.droneStates) {
                this.drones = [];
                for (var d = 0; d < state.droneStates.length; d++) {
                    this.drones.push(new Drone(state.droneStates[d]));
                }
            }
            this.workers = this.workers || [];
            if (state.workerStates) {
                this.workers = [];
                for (var w = 0; w < state.workerStates.length; w++) {
                    this.workers.push(new Worker(state.workerStates[w]));
                }
            }
            this.eggs = this.eggs || [];
            if (state.eggStates) {
                this.eggs = [];
                for (var e = 0; e < state.eggStates.length; e++) {
                    this.eggs.push(new Egg(state.eggStates[e]));
                }
            }
            this.larva = this.larva || [];
            if (state.larvaStates) {
                this.larva = [];
                for (var l = 0; l < state.larvaStates.length; l++) {
                    this.larva.push(new Larva(state.larvaStates[l]));
                }
            }
        };

        Hive.prototype.getState = function() {
            var state = {
                id: this.id,
                currentGeneration: this.currentGeneration,
                maxSize: this.maxSize,
                beeMutationChance: this.beeMutationChance,
                initialSize: this.initialSize,
                nextId: this.nextId,
                queenStates: [],
                droneStates: [],
                workerStates: [],
                eggStates: [],
                larvaStates: [],
                msSinceEgg: this.msSinceEgg,
                pos: this.pos
            };
            for (var q = 0; q < this.queens.length; q++) {
                state.queenStates.push(this.queens[q].getState());
            }
            for (var d = 0; d < this.drones.length; d++) {
                state.droneStates.push(this.drones[d].getState());
            }
            for (var w = 0; w < this.workers.length; w++) {
                state.workerStates.push(this.workers[w].getState());
            }
            for (var e = 0; e < this.eggs.length; e++) {
                state.eggStates.push(this.eggs[e].getState());
            }
            for (var l = 0; l < this.larva.length; l++) {
                state.larvaStates.push(this.larva[l].getState());
            }
            return state;
        };
        Hive.prototype.getNextId = function() {
            return ++this.nextId;
        };
        Hive.prototype.createInitialQueen = function(inseminate) {
            var queen = new Queen({
                id: this.getNextId(),
                generation: 0,
                dominant: true, // 
                beeMutationChance: this.beeMutationChance
            });
            if (inseminate) {
                for (var d = 0; d < 10; d++) {
                    var drone = new Drone({
                        id: this.getNextId(),
                        generation: 0,
                        beeMutationChance: this.beeMutationChance
                    });
                    queen.mate(drone);
                }
            }
            queen.update();
            this.queens.push(queen);
        };

        Hive.prototype.getById = function(id, type) {
            var list = [];
            switch (type) {
                case 'EGG':
                    list = this.eggs;
                    break;
                case 'LARVA':
                    list = this.larva;
                    break;
                case 'DRONE':
                    list = this.drones;
                    break;
                case 'WORKER':
                    list = this.workers;
                    break;
                case 'QUEEN':
                    list = this.queens;
                    break;
                default:
                    console.error("Invalid type: " + type);
                    return null;
            }
            return $filter('filter')(list, { id: id })[0];
        };

        Hive.prototype.getByGeneration = function(generation) {
            // return this.members.filter(function(unit) {
            //     return unit.generation === generation;
            // });
        };
        Hive.prototype.getHeadQueen = function() {
            if (this.queens.length)
                return this.queens[0]; //assuming first queen is the egg producer...

            return null;
        };

        Hive.prototype.canLayEggs = function() {
            //tired of browser locking up due to too many eggs
            return this.queens.length && this.getHeadQueen().canLayEggs() && this.eggs.length < 5;
        };

        Hive.prototype.layEgg = function() {
            //var d = $q.defer();
            var newName = null;
            if (this.canLayEggs()) {
                var queen = this.getHeadQueen();
                var egg = queen.layEgg(this.getNextId());
                this.eggs.push(egg);
                newName = egg.name;
            }
            return newName;
            //d.resolve(newName);

            //return d.promise;
        };
        Hive.prototype.processEggFate = function(id, fate) {
            var index;
            var egg = this.eggs.filter(function(unit, i) {
                if (unit.id === id) {
                    index = i;
                    return true;
                }
            })[0];
            var msg = "";
            switch (fate) {
                case "DRONE":
                    var drone = new Drone({
                        id: egg.id,
                        genomeState: egg.genome.getState(),
                        generation: egg.generation,
                        jid: 'DRONE',
                        beeMutationChance: egg.beeMutationChance
                    });
                    this.drones.push(drone);
                    this.eggs.splice(index, 1);
                    msg = $filter('fmt')('New drone in Hive#%(id)d! (%(newname)s)', { id: this.id, newname: drone.name });
                    break;
                case "LARVA":
                    var larva = this.getHeadQueen().fertilizeEgg(egg, egg.id);
                    this.larva.push(larva);
                    this.eggs.splice(index, 1);
                    msg = $filter('fmt')('New larva in Hive#%(id)d! (%(newname)s)', { id: this.id, newname: larva.name });
                    break;
                case "CONSUME_EGG":
                    msg = $filter('fmt')("%(name)s has been turned into food for Hive#%(id)d", { name: egg.name, id: this.id });
                    this.eggs.splice(index, 1);
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
            var newborn = this.larva.filter(function(unit, i) {
                if (unit.id === id) {
                    index = i;
                    return true;
                }
            })[0];
            var msg = "";
            switch (fate) {
                case "WORKER":
                    var worker = new Worker({
                        id: newborn.id,
                        genomeState: newborn.genome.getState(),
                        generation: newborn.generation,
                        jid: "IDLE",
                        beeMutationChance: newborn.beeMutationChance
                    });
                    this.workers.push(worker);
                    this.larva.splice(index, 1);
                    msg = $filter('fmt')("New worker in Hive#%(id)d! (%(name)s)", { name: newborn.name, id: this.id });
                    break;
                case "QUEEN":
                    newborn.beetype = 'queen';
                    newborn.update();
                    this.queens.push(newborn);
                    this.larva.splice(index, 1);
                    msg = $filter('fmt')("New queen in Hive#%(id)d! (%(name)s)", { name: newborn.name, id: this.id });
                    break;
                case "CONSUME_LARVA":
                    msg = $filter('fmt')("%(name)s has been turned into food for Hive#%(id)d", { name: newborn.name, id: this.id });
                    this.larva.splice(index, 1);
                    break;
                default:
                    msg = msg = $filter('fmt')("Invalid %(fate)s", { fate: fate });
                    console.error("Invalid fate: " + fate);
                    break;
            }
            logService.logBreedMessage(msg);
        };

        // these came from the hiveService
        Hive.prototype.setNurseryLimit = function(newLimit) {
            this.newbornLimit = newLimit;
            //self.sendPopulationUpdateEvent();
        };


        Hive.prototype.getObjectPositions = function() {

        };

        Hive.prototype.setUnitJob = function(id, jid, jobName) {
            // var unit = self.hive.getById(id);        
            // unit.jid = jid;
            // unit.onStrike = false;
            // var f = jobName.charAt(0).toLowerCase();
            // var article = (f === 'a' || f === 'e' || f === 'i' || f === 'o' || f === 'u') ? 'an' : 'a';
            // var msg = $filter('fmt')('%(name)s is now %(article)s %(job)s', { name: unit.name, article: article, job: jobName });
            // self.logService.logWorkMessage(msg);
            // self.sendPopulationUpdateEvent();
        };

        Hive.prototype.setPopulationLimit = function(newLimit) {
            this.maxSize = newLimit;
            //self.sendPopulationUpdateEvent();
        };
        Hive.prototype.processFate = function(unitid, fate) {
            if (fate === 'DRONE' || fate === 'LARVA' || fate === 'CONSUME_EGG')
                this.processEggFate(unitid, fate);
            else
                this.processLarvaFate(unitid, fate);
            //self.sendPopulationUpdateEvent();
        };
        Hive.prototype.handleGameLoop = function(event, ms) {
            if (ms === 0)
                return;

            if (event.name !== 'gameLoopEvent') {
                console.error('Hive.handleGameLoop - Invalid event: ' + event);
                return;
            }

            if (this.canLayEggs()) {
                var eggLayMs = this.getHeadQueen().getAbility('PRD_E').value;
                this.msSinceEgg += ms;
                while (this.msSinceEgg >= eggLayMs) {
                    this.msSinceEgg -= eggLayMs;
                    var eggName = this.layEgg();
                    if (eggName !== null) {
                        logService.logBreedMessage($filter('fmt')("New egg laid in Hive#%1d! (%2s)", this.id, eggName));
                    }
                }
            }
        };

        return Hive;
    }
]);
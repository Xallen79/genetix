var game = angular.module('bloqhead.genetixApp');

game.factory('Hive', [
    '$filter', 'Queen', 'Drone', 'Worker', 'Egg', 'Larva', 'logService',
    function($filter, Queen, Drone, Worker, Egg, Larva, logService) {

        /* constructor */
        var Hive = function(state) {
            this.update(state);
        };
        /* public functions */
        Hive.prototype.update = function(state) {
            state = state || {};
            this.id = state.id || this.id;
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
                msSinceEgg: this.msSinceEgg
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

        Hive.prototype.createInitialQueen = function(inseminate) {
            var queen = new Queen({
                id: ++this.nextId,
                generation: 0,
                dominant: true, // 
                beeMutationChance: this.beeMutationChance
            });
            if (inseminate) {
                for (var d = 0; d < 10; d++) {
                    var drone = new Drone({
                        id: ++this.nextId,
                        generation: 0,
                        beeMutationChance: this.beeMutationChance
                    });
                    queen.mate(drone);
                }
            }
            queen.update();
            this.queens.push(queen);
        };

        Hive.prototype.getById = function(id) {
            // return this.members.filter(function(unit) {
            //     return unit.id === id;
            // })[0];
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
            return this.queens.length && this.getHeadQueen().canLayEggs();
        };

        Hive.prototype.layEgg = function() {
            var newName = null;
            if (this.canLayEggs()) {
                var queen = this.getHeadQueen();
                var egg = queen.layEgg(++this.nextId);
                this.eggs.push(egg);
                newName = egg.name;
            }
            return newName;
        };

        Hive.prototype.processNewbornFate = function(id, fate) {
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
                    this.newborns.splice(index, 1);
                    msg = $filter('fmt')("%(name)s has joined the workforce", newborn);
                    break;
                case "DRONE":
                    // TODO
                    break;
                case "QUEEN":
                    // TODO    
                    break;
                case "CONSUME":
                    msg = $filter('fmt')("Bee #%(id) has been turned into food", newborn);
                    this.larva.splice(index, 1);
                    break;
                default:
                    msg = msg = $filter('fmt')("Invalid %(fate)s", { fate: fate });
                    console.error("Invalid fate: " + fate);
                    break;
            }
            logService.logBreedMessage(msg);
        };
        return Hive;
    }
]);
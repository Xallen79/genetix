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
            this.currentGeneration = state.currentGeneration || this.currentGeneration || 0;
            this.newbornLimit = state.newbornLimit || this.newbornLimit || 0;
            this.maxSize = state.maxSize || this.maxSize || 10;
            this.beeMutationChance = state.beeMutationChance || this.beeMutationChance || 0.005;
            this.initialSize = state.initialSize || this.initialSize || 2;
            if (state.queenState) {
                this.queen = new Queen(state.queenState);
            } else {
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
                currentGeneration: this.currentGeneration,
                maxSize: this.maxSize,
                beeMutationChance: this.beeMutationChance,
                initialSize: this.initialSize,
                queenState: this.queen.getState(),
                droneStates: [],
                workerStates: [],
                eggStates: [],
                larvaStates: []
            };
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
            this.queen = new Queen({
                id: 1,
                generation: 0,
                beeMutationChance: this.beeMutationChance
            });
            if (inseminate) {
                for (var d = 0; d < 10; d++) {
                    var drone = new Drone({
                        id: 1 + d,
                        generation: 0,
                        beeMutationChance: this.beeMutationChance
                    });
                    this.queen.mate(drone);
                }
            }
            this.queen.update();
            // var self = this;
            // var population = [];
            // for (var i = 0; i < count; i++) {
            //     var unit = new Bee({
            //         id: i,
            //         generation: 0,
            //         beeMutationChance: this.beeMutationChance,
            //     });
            //     unit.update();
            //     population.push(unit);
            // }
            // return population;
        };

        Hive.prototype.isBreeding = function() {

            return false;
            /*
            if (this.members.length >= this.maxSize) return false;
            if (this.newborns.length >= this.newbornLimit) return false;
            // make sure there are at least 1 male and 1 female in the bees
            var hasMale = false,
                hasFemale = false;
            for (var i = 0; i < this.bees.length; i++) {
                var unit = this.getById(this.bees[i]);
                if (unit.hasTrait('Male')) hasMale = true;
                else hasFemale = true;
                if (hasMale && hasFemale) break;
            }
            return hasMale && hasFemale;
            */
        };

        Hive.prototype.getById = function(id) {
            return this.members.filter(function(unit) {
                return unit.id === id;
            })[0];
        };

        Hive.prototype.getByGeneration = function(generation) {
            return this.members.filter(function(unit) {
                return unit.generation === generation;
            });
        };

        Hive.prototype.breed = function() {
            var self = this;
            if (!self.isBreeding()) return null;
            var p1 = self.getById(self.bees[0]);
            var p2 = self.getById(self.bees[1]);
            var child = p1.breed(p2, self.members.length);
            self.newborns.push(child);
            return child;
        };
        Hive.prototype.processNewbornFate = function(id, fate) {
            var index;
            var newborn = this.newborns.filter(function(unit, i) {
                if (unit.id === id) {
                    index = i;
                    return true;
                }
            })[0];
            var msg = "";
            switch (fate) {
                case "WORKER":
                    newborn.beetype = 'worker';
                    newborn.jid = 'IDLE';
                    this.members.push(newborn);
                    this.newborns.splice(index, 1);
                    msg = $filter('fmt')("Bee #%(id) has joined the workforce", newborn);
                    break;
                case "DRONE":
                    // TODO
                    break;
                case "QUEEN":
                    // TODO    
                    break;
                case "CONSUME":
                    msg = $filter('fmt')("Bee #%(id) has been turned into food", newborn);
                    this.newborns.splice(index, 1);
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
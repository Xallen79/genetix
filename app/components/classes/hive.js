var game = angular.module('bloqhead.genetixApp');

game.factory('Hive', [
    '$filter', 'Bee', 'logService',
    function($filter, Bee, logService) {

        /* constructor */
        var Hive = function(state) {
            this.update(state);
        };
        /* public functions */
        Hive.prototype.update = function(state) {
            state = state || {};
            this.currentGeneration = state.currentGeneration || this.currentGeneration || 0;
            this.bees = state.bees || this.bees || [];
            this.beeLimit = state.beeLimit || this.beeLimit || 0;
            this.newbornLimit = state.newbornLimit || this.newbornLimit || 0;
            this.maxSize = state.maxSize || this.maxSize || 10;
            this.beeMutationChance = state.beeMutationChance || this.beeMutationChance || 0.005;
            this.initialSize = state.initialSize || this.initialSize || 2;
            if (state.members) {
                this.members = [];
                for (var m = 0; m < state.members.length; m++) {
                    var member = state.members[m];
                    var unit = new Bee({
                        id: member.id,
                        dt: member.dt,
                        mother: member.mother || null,
                        father: member.father || null,
                        generation: member.generation,
                        genomeState: member.genomeState,
                        beeMutationChance: member.beeMutationChance,
                        name: member.name,
                        jid: member.jid,
                        earnings: member.earnings
                    });
                    unit.update();
                    this.members.push(unit);

                }
            } else this.members = this.members || this.createInitialPopulation(this.initialSize);
            this.newborns = [];
            if (state.newborns) {
                for (var n = 0; n < state.newborns.length; n++) {
                    var newborn = state.newborns[n];
                    var nb = new Bee({
                        id: newborn.id,
                        dt: newborn.dt,
                        mother: newborn.mother || null,
                        father: newborn.father || null,
                        generation: newborn.generation,
                        genomeState: newborn.genomeState,
                        beeMutationChance: newborn.beeMutationChance,
                        name: newborn.name,
                        jid: newborn.jid,
                        earnings: newborn.earnings
                    });
                    nb.update();
                    this.newborns.push(nb);
                }
            }

        };
        Hive.prototype.getState = function() {
            var state = {
                currentGeneration: this.currentGeneration,
                bees: this.bees,
                beeLimit: this.beeLimit,
                maxSize: this.maxSize,
                beeMutationChance: this.beeMutationChance,
                initialSize: this.initialSize,
                members: [],
                newborns: []
            };
            for (var m = 0; m < this.members.length; m++) {
                var member = this.members[m];
                state.members.push({
                    id: member.id,
                    dt: member.dt,
                    generation: member.generation,
                    genomeState: member.genomeState,
                    beeMutationChance: member.beeMutationChance,
                    name: member.name,
                    jid: member.jid,
                    earnings: member.earnings
                });
            }
            for (var n = 0; n < this.newborns.length; n++) {
                var nb = this.newborns[n];
                state.newborns.push({
                    id: nb.id,
                    dt: nb.dt,
                    generation: nb.generation,
                    genomeState: nb.genomeState,
                    beeMutationChance: nb.beeMutationChance,
                    name: nb.name,
                    jid: nb.jid,
                    earnings: nb.earnings
                });
            }
            return state;
        };

        Hive.prototype.createInitialPopulation = function(count) {
            var self = this;
            var population = [];
            for (var i = 0; i < count; i++) {
                var unit = new Bee({
                    id: i,
                    generation: 0,
                    beeMutationChance: this.beeMutationChance,
                });
                unit.update();
                population.push(unit);
            }
            return population;
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
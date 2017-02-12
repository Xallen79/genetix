var game = angular.module('bloqhead.genetixApp');

game.factory('Population', ['$filter', 'Breeder', 'geneDefinitions', function($filter, Breeder, geneDefinitions) {


    /* constructor */
    var Population = function(state) {
        this.update(state);
    };
    /* public functions */
    Population.prototype.update = function(state) {
        state = state || {};
        this.geneDefinitions = geneDefinitions;
        this.currentGeneration = state.currentGeneration || this.currentGeneration || 0;
        this.breeders = state.breeders || this.breeders || [];
        this.breederLimit = state.breederLimit || this.breederLimit || 0;
        this.newbornLimit = state.newbornLimit || this.newbornLimit || 0;
        this.maxSize = state.maxSize || this.maxSize || 10;
        this.breederMutationBits = state.breederMutationBits || this.breederMutationBits || 4;
        this.breederMutationChance = state.breederMutationChance || this.breederMutationChance || 5;
        this.breederGenesUnlocked = state.breederGenesUnlocked || this.breederGenesUnlocked || [42];
        this.initialSize = state.initialSize || this.initialSize || 2;
        if (state.members) {
            this.members = [];
            for (var m = 0; m < state.members.length; m++) {
                var member = state.members[m];
                var unit = new Breeder({
                    id: member.id,
                    mother: member.mother || null,
                    father: member.father || null,
                    generation: member.generation,
                    genes: member.genes,
                    mutationBits: member.mutationBits,
                    name: member.name,
                    currentJob: member.currentJob
                });
                unit.update();
                this.members.push(unit);

            }
        } else this.members = this.members || this.createInitialPopulation(this.initialSize);
        this.newborns = [];
        if (state.newborns) {
            for (var n = 0; n < state.newborns.length; n++) {
                var newborn = state.newborns[n];
                var nb = new Breeder({
                    id: newborn.id,
                    mother: newborn.mother || null,
                    father: newborn.father || null,
                    generation: newborn.generation,
                    genes: newborn.genes,
                    mutationBits: newborn.mutationBits,
                    name: newborn.name,
                    currentJob: newborn.currentJob
                });
                nb.update();
                this.newborns.push(nb);
            }
        }

    };
    Population.prototype.getState = function() {
        var state = {
            currentGeneration: this.currentGeneration,
            breeders: this.breeders,
            breederLimit: this.breederLimit,
            maxSize: this.maxSize,
            breederMutationBits: this.breederMutationBits,
            breederMutationChance: this.breederMutationChance,
            breederGenesUnlocked: this.breederGenesUnlocked,
            initialSize: this.initialSize,
            members: []
        };
        for (var m = 0; m < this.members.length; m++) {
            var member = this.members[m];
            state.members.push({
                id: member.id,
                generation: member.generation,
                genes: member.genes,
                mutationBits: member.mutationBits,
                name: member.name,
                currentJob: member.currentJob
            });
        }
        return state;
    };

    Population.prototype.createInitialPopulation = function(count) {
        var self = this;
        var population = [];
        for (var i = 0; i < count; i++) {
            var genes = [];
            for (var gn = 0; gn < self.geneDefinitions.length; gn++) {
                genes.push([0, 0, 0]);
                if (self.breederGenesUnlocked.indexOf(gn) !== -1) genes[gn][2] = self.breederMutationChance;
            }

            var r = i % 2 === 0 ? 255 : 0;
            var g = i % 2 === 0 ? 0 : 255;

            genes[42][0] = r;
            genes[42][1] = g;
            genes[42][2] = 0;

            var unit = new Breeder({
                id: i,
                generation: 0,
                genes: angular.copy(genes),
                mutationBits: self.breederMutationBits
            });
            unit.update();
            population.push(unit);
        }
        return population;
    };

    Population.prototype.isBreeding = function() {
        if (this.members.length >= this.maxSize) return false;
        if (this.newborns.length >= this.newbornLimit) return false;
        // make sure there are at least 1 male and 1 female in the breeders
        var hasMale = false,
            hasFemale = false;
        for (var i = 0; i < this.breeders.length; i++) {
            var unit = this.getById(this.breeders[i]);
            if (unit.hasTrait('Male')) hasMale = true;
            else hasFemale = true;
            if (hasMale && hasFemale) break;
        }
        return hasMale && hasFemale;
    };

    Population.prototype.getById = function(id) {
        return this.members.filter(function(unit) {
            return unit.id === id;
        })[0];
    };

    Population.prototype.getByGeneration = function(generation) {
        return this.members.filter(function(unit) {
            return unit.generation === generation;
        });
    };

    Population.prototype.breed = function() {
        var self = this;
        if (!self.isBreeding()) return null;
        var p1 = self.getById(self.breeders[0]);
        var p2 = self.getById(self.breeders[1]);
        var child = p1.breed(p2, self.members.length);
        self.newborns.push(child);
        return child;
    };
    Population.prototype.processNewbornFate = function(id, fate) {
        var index;
        var newborn = this.newborns.filter(function(unit, i) {
            if (unit.id === id) {
                index = i;
                return true;
            }
        })[0];
        switch (fate) {
            case "WORK":
                this.members.push(newborn);
                this.newborns.splice(index, 1);
                break;
            case "BANISH":
                this.newborns.splice(index, 1);
                break;
            default:
                console.error("Invalid fate: " + fate);
                break;

        }
    };
    return Population;
}]);
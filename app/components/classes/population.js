var game = angular.module('bloqhead.genetixApp');

game.factory('Population', ['$filter', 'Breeder', 'geneDefinitions', function($filter, Breeder, geneDefinitions) {


    /* constructor */
    var Population = function(config) {
        this.update(config);
    };
    /* public functions */
    Population.prototype.update = function(config) {
        config = config || {};
        this.geneDefinitions = geneDefinitions;
        this.currentGeneration = config.currentGeneration || this.currentGeneration || 0;
        this.breeders = config.breeders | this.breeders || [];
        this.maxSize = config.maxSize | this.maxSize || 10;
        this.breederMutationBits = config.breederMutationBits;
        this.breederMutationChance = config.breederMutiationChance || 5;
        this.breederGenesUnlocked = config.breederGenesUnlocked || [];



        this.members = config.members | this.members || this.createInitialPopulation(config.initialSize || 2);
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
        self.members.push(child);
        return child;
    };

    return Population;
}]);
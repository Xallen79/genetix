var game = angular.module('bloqhead.genetixApp');


game.factory('Genome', ['Chromosome', function(Chromosome) {
    var Genome = function(state) {
        state = state || {};
        this.update(state);
    };

    Genome.prototype.update = function(state) {
        this.chromosomeCount = state.chromosomeCount || this.chromosomeCount || 10;
        this.geneCount = state.GeneCount || this.geneCount || 10;
        this.mutationChance = state.mutationChance || this.mutationChance || 0;
        this.hasChromosomePairs = angular.isDefined(state.hasChromosomePairs) ? state.hasChromosomePairs : angular.isDefined(this.hasChromosomePairs) ? this.hasChromosomePairs : true;
        this.chromosomes = angular.isDefined(state.chromosomes) ? this.loadChromosomes(state.chromosomes) : this.chromosomes || this.generateNewChromosomes();
    };
    Genome.prototype.getState = function() {
        return {
            chromosomeCount: this.chromosomeCount,
            geneCount: this.geneCount,
            hasChromosomePairs: this.hasChromosomePairs,
            mutationChance: this.mutationChance,
            chromosomes: angular.copy(this.chromosomes)
        };
    };
    Genome.prototype.generateNewChromosomes = function() {
        var chromosomes = [];
        chromosomes.push([]);
        if (this.hasChromosomePairs)
            chromosomes.push([]);
        chromoState = {
            geneCount: this.geneCount,
            mutationChance: this.mutationChance
        };
        for (var i = 0; i < this.chromosomeCount; i++) {
            chromosomes[0].push(new Chromosome(chromoState));
            if (this.hasChromosomePairs)
                chromosomes[1].push(new Chromosome(chromoState));
        }
        return chromosomes;
    };
    Genome.prototype.loadChromosomes = function(state) {
        var chromosomes = [];
        chromosomes.push([]);
        if (this.hasChromosomePairs)
            chromosomes.push([]);
        for (var i = 0; i < this.chromosomeCount; i++) {
            var chromoState = {
                geneCount: state[0][i].geneCount,
                mutationChance: state[0][i].mutationChance,
                genes: state[0][i].genes,
                mutationString: state[0][i].mutationString
            };
            chromosomes[0].push(new Chromosome(chromoState));
            if (this.hasChromosomePairs) {
                chromoState = {
                    geneCount: state[1][i].geneCount,
                    mutationChance: state[1][i].mutationChance,
                    genes: state[1][i].genes,
                    mutationString: state[1][i].mutationString
                };
                chromosomes[1].push(new Chromosome(chromoState));
            }
        }
        return chromosomes;

    };

    Genome.prototype.getGene = function(chromosome, gene) {
        var on = 0;
        if (this.hasChromosomePairs)
            on = this.chromosomes[0][chromosome].getGene(gene) & this.chromosomes[1][chromosome].getGene(gene);
        else
            on = this.chromosomes[0][chromosome].getGene(gene);

        return on;
    };

    Genome.prototype.mate = function(genome) {
        if (this.hasChromosomePairs === genome.hasChromosomePairs) {
            console.error("Cannot mate these genomes.", this, genome);
            return;
        }
        var chromosomes = [];
        chromosomes.push([]);
        var baseChromo = [];
        if (this.hasChromosomePairs === false) {
            chromosomes.push(angular.copy(this.chromosomes[0]));
            baseChromo = genome.chromosomes;
        } else {
            chromosomes.push(angular.copy(genome.chromosomes[0]));
            baseChromo = this.chromosomes;
        }

        for (var i = 0; i < this.chromosomeCount; i++) {
            var p = randomIntFromInterval(0, 1);
            var newChromo = angular.copy(baseChromo[p][i]);
            newChromo.doMutation();
            chromosomes[0].push(newChromo);
        }

        var childGenome = new Genome({
            chromosomeCount: this.chromosomeCount,
            geneCount: this.geneCount,
            hasChromosomePairs: true,
            chromosomes: chromosomes
        });
        return childGenome;

    };
    Genome.prototype.getEggGenome = function() {
        var chromosomes = [];
        chromosomes.push([]);
        for (var i = 0; i < this.chromosomeCount; i++) {
            var p = randomIntFromInterval(0, 1);
            var chromo = this.chromosomes[p][i];
            chromosomes[0].push(new Chromosome({
                geneCount: chromo.geneCount,
                mutationChance: chromo.mutationChance,
                genes: chromo.genes
            }));
        }
        var egg = new Genome({
            hasChromosomePairs: false,
            chromosomeCount: this.chromosomeCount,
            geneCount: this.geneCount,
            chromosomes: chromosomes,
            mutationChance: this.mutationChance
        });
        return egg;
    };
    return Genome;
}]);

game.factory('Chromosome', [function() {
    geneMask = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    var Chromosome = function(state) {
        state = state || {};
        this.update(state);
    };
    Chromosome.prototype.update = function(state) {
        this.geneCount = state.geneCount || this.geneCount || 10;
        this.genes = angular.isDefined(state.genes) ? state.genes : angular.isDefined(this.genes) ? this.genes : randomIntFromInterval(0, Math.pow(2, this.geneCount) - 1);
        this.mutationChance = state.mutationChance || this.mutationChance || 0.01;
        this.mutationString = state.mutationString || this.mutationString || "";

        geneMask = geneMask || [];
        if (geneMask.length < this.geneCount) {
            geneMask = [];
            for (var i = 0; i < this.geneCount; i++) {
                geneMask.push(Math.pow(2, i));
            }
        }
    };
    Chromosome.prototype.toBitString = function() {
        return (this.genes).toString(2);
    };
    Chromosome.prototype.getGene = function(n) {
        return this.genes & geneMask[n];
    };
    Chromosome.prototype.doMutation = function() {
        this.mutationString = "";
        for (var i = 0; i < this.geneCount; i++) {
            if (Math.random() < this.mutationChance) {
                this.mutationString += '1';
            } else {
                this.mutationString += '0';
            }
        }
        this.gene ^= parseInt(this.mutationString, 2);
    };

    return Chromosome;

}]);
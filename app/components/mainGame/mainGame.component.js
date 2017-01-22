var game = angular.module('bloqhead.genetixApp');
game.component('bloqhead.components.mainGame', {
    templateUrl: "components/mainGame/mainGame.html",
    controller: 'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
game.controller('bloqhead.controllers.mainGame', ['$scope', '$timeout', function($scope, $timeout) {
    var self = this;
    self.helloText = "Hello main game";
    self.diggers = [];
    self.diggerOffspring = [];
    self.diggerAncestors = [];
    self.maxOffspring = 30;
    self.geneticOptions = {
        crossoverrate: 0.5,
        mutationrate: 0.25,
        mutationsize: 50
    };


    for (var d = 0; d < 2; d++) {
        var digger = {
            id: d,
            generation: 0,
            genes: []
        };
        for (var g = 0; g < 49; g++) {
            digger.genes.push([
                randomIntFromInterval(0, 255),
                randomIntFromInterval(0, 255),
                randomIntFromInterval(0, 255),
            ]);
        }
        self.diggers.push(digger);
    }


    self.getImage = function(genes, scale) {
        var image = generateBitmapDataURL(self.addRows(self.convertRedGreenMap(genes), 7), scale);
        return image;
    };
    self.getBlueImage = function(genes, scale) {
        var image = generateBitmapDataURL(self.addRows(self.convertBlueMap(genes), 7), scale);
        return image;
    };
    self.convertRedGreenMap = function(genes) {
        var result = [];
        for (var i = 0; i < genes.length; i++) {
            var r = genes[i][0];
            var g = genes[i][1];
            var bright = (Math.abs(r - g) / 255.0);

            if (r > g) g = 0;
            else r = 0;
            r *= bright;
            g *= bright;
            result.push([r, g, 0]);
        }
        return result;
    };
    self.convertBlueMap = function(genes) {
        var result = [];
        for (var i = 0; i < genes.length; i++) {
            result.push([0, 0, genes[i][2]]);
        }
        return result;
    };

    self.addRows = function(genes, cols) {
        var result = [];
        for (var j = 0; j < (genes.length / cols); j++) {
            var row = [];
            for (var i = 0; i < cols; i++) {

                row.push(genes[j + (i * cols)]);
            }
            result.push(row);
        }
        return result;
    };


    self.crossover = function(g1, g2) {
        var crossover = Math.random();
        var mutation = randomIntFromInterval(0, 255);
        var g = angular.copy(crossover <= self.geneticOptions.crossoverrate ? g1 : g2);
        var mr = mutation <= g[2] ? randomIntFromInterval(-25, 25) : 0;
        var mg = mutation <= g[2] ? randomIntFromInterval(-25, 25) : 0;
        var mb = mutation <= g[2] ? randomIntFromInterval(-25, 25) : 0;
        /*if (m !== 0)
            console.log(m);*/

        if (g[0] + mr < 0) g[0] = 0;
        else if (g[0] + mr > 255) g[0] = 255;
        else g[0] += mr;

        if (g[1] + mg < 0) g[1] = 0;
        else if (g[1] + mg > 255) g[1] = 255;
        else g[1] += mg;

        if (g[2] + mb < 0) g[2] = 0;
        else if (g[2] + mb > 255) g[2] = 255;
        else g[2] += mb;


        return g;
    };

    self.breed = function() {
        if (self.diggerOffspring.length < self.maxOffspring) {
            var p1 = self.diggers[0];
            var p2 = self.diggers[1];
            var child = {
                id: self.diggerOffspring.length,
                generation: p1.generation + 1,
                genes: []
            };
            for (var g = 0; g < p1.genes.length; g++) {
                var p1g = p1.genes[g];
                var p2g = p2.genes[g];
                child.genes.push(self.crossover(p1g, p2g));
            }
            self.diggerOffspring.push(child);
            self.breedTimer = $timeout(self.breed, 100, true);
        } else {
            self.nextGeneration();
        }
    };
    self.breed();

    self.nextGeneration = function() {
        $timeout.cancel(self.breedTimer);
        self.diggerAncestors.push(self.diggers);
        self.diggers = [];
        var newParents = self.determineNextParents(self.greenFitness);
        self.diggers.push(newParents[0]);
        self.diggers.push(newParents[1]);
        self.diggerOffspring = [];
        self.breed();
    };
    self.determineNextParents = function(fitnessFunc) {
        var numgenes = self.diggerOffspring[0].genes.length;
        var fit1 = {
                index: -1,
                value: -255 * numgenes
            },
            fit2 = {
                index: -1,
                value: -255 * numgenes
            };
        for (var i = 0; i < self.diggerOffspring.length; i++) {
            var val = fitnessFunc(self.diggerOffspring[i]);
            if (fit1.value < val) {
                fit1.index = i;
                fit1.value = val;
            } else if (fit2.value < val) {
                fit2.index = i;
                fit2.value = val;
            }
        }
        return [self.diggerOffspring[fit1.index], self.diggerOffspring[fit2.index]];
    };

    self.greenFitness = function(digger) {
        var numgenes = digger.genes.length;
        var val = 0;
        for (var g = 0; g < numgenes; g++)
            val += digger.genes[g][1] - digger.genes[g][0];
        return val;
    };

    self.redFitness = function(digger) {
        var numgenes = digger.genes.length;
        var val = 0;
        for (var g = 0; g < numgenes; g++)
            val += digger.genes[g][0] - digger.genes[g][1];
        return val;
    };

    self.blueFitness = function(digger) {
        var numgenes = digger.genes.length;
        var val = 0;
        for (var g = 0; g < numgenes; g++)
            val += digger.genes[g][2];
        return val;
    };
}]);
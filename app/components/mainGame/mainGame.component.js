var game = angular.module('bloqhead.genetixApp');
game.component('bloqhead.components.mainGame', {
    templateUrl: "components/mainGame/mainGame.html",
    controller: 'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});

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
                Math.random() * 255,
                Math.random() * 255,
                Math.random() * 255,
            ]);
        }
        self.diggers.push(digger);
    }


    self.getImage = function(genes, scale) {
        var image = generateBitmapDataURL(self.addRows(self.convertRedGreen(genes), 7), scale);
        return image;
    };

    self.convertRedGreen = function(genes) {
        var result = []; //angular.copy(genes);
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

    function randomIntFromInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    self.crossover = function(g1, g2) {
        var crossover = Math.random();
        var mutation = Math.random();
        var g = angular.copy(crossover <= self.geneticOptions.crossoverrate ? g1 : g2);
        var m = mutation <= self.geneticOptions.mutationrate ? randomIntFromInterval(-1 * g[2] / 2, g[2] / 2) : 0;
        if (g[0] + m < 0) g[0] = 0;
        else if (g[0] + m > 255) g[0] = 255;
        else g[0] += m;

        if (g[1] + m < 0) g[1] = 0;
        else if (g[1] + m > 255) g[1] = 255;
        else g[1] += m;

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
        }
        self.breedTimer = $timeout(self.breed, 100, true);
    };
    self.breed();

    self.nextGeneration = function() {
        $timeout.cancel(self.breedTimer);
        var rand1 = Math.floor(Math.random() * self.diggerOffspring.length);
        var rand2 = Math.floor(Math.random() * self.diggerOffspring.length);
        while (rand2 == rand1)
            rand2 = Math.floor(Math.random() * self.diggerOffspring.length);
        self.diggerAncestors.push(self.diggers);
        self.diggers = [];
        self.diggers.push(self.diggerOffspring[rand1]);
        self.diggers.push(self.diggerOffspring[rand2]);
        self.diggerOffspring = [];
        self.breed();
    };


}]);
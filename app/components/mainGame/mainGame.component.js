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
        for (var g = 0; g < 36; g++) {
            digger.genes.push([
                Math.random() * 255,
                Math.random() * 255,
                Math.random() * 255,
            ]);
        }
        self.diggers.push(digger);
    }


    self.getImage = function(genes, scale) {
        var image = generateBitmapDataURL(self.addRows(genes, 6), scale);
        return image;
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
        var mutation = Math.random();
        var m = mutation <= self.geneticOptions.mutationrate ? Math.floor(Math.random() * self.geneticOptions.mutationsize / 2) - self.geneticOptions.mutationsize : 0;
        var g = crossover <= self.geneticOptions.crossoverrate ? g1 : g2;
        if (g + m < 0) g = 0;
        else if (g + m > 255) g = 255;
        else g += m;

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
                child.genes.push([]);
                for (var i = 0; i < 3; i++) {
                    child.genes[g].push(self.crossover(p1g[i], p2g[i]));
                }
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
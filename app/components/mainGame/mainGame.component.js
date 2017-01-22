var game = angular.module('bloqhead.genetixApp');
game.component('bloqhead.components.mainGame', {
    templateUrl: "components/mainGame/mainGame.html",
    controller: 'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});

game.controller('bloqhead.controllers.mainGame', ['$scope', '$timeout', function($scope, $timeout) {
    var self = this;
    self.helloText = "Hello main game";
    self.baseGene = [0, 0, 0];
    self.diggers = [];
    self.diggerOffspring = [];
    self.crossoverrate = 0.5;
    self.mutationrate = 0.1;
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


    self.getImage = function(genes) {
        var image = generateBitmapDataURL(self.addRows(genes, 6), 6);
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

    self.breed = function() {

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
            var crossover1 = Math.random();
            var crossover2 = Math.random();
            var crossover3 = Math.random();
            child.genes[g].push(crossover1 > self.crossoverrate ? p1g[0] : p2g[0]);
            child.genes[g].push(crossover2 > self.crossoverrate ? p1g[1] : p2g[1]);
            child.genes[g].push(crossover3 > self.crossoverrate ? p1g[2] : p2g[2]);

        }
        self.diggerOffspring.push(child);
        self.breedTimer = $timeout(self.breed, 500, true);
    };
    self.breed();

    self.nextGeneration = function() {
        $timeout.cancel(self.breedTimer);
        var rand1 = Math.floor(Math.random() * self.diggerOffspring.length);
        var rand2 = Math.floor(Math.random() * self.diggerOffspring.length);
        self.diggers = [];
        self.diggers.push(self.diggerOffspring[rand1]);
        self.diggers.push(self.diggerOffspring[rand2]);
        self.diggerOffspring = [];
        self.breed();
    };

}]);
var game = angular.module('bloqhead.genetixApp');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


game.service('gameService', ['$window', '$rootScope', 'Breeder', function($window, $rootScope, Breeder) {
    var self = this;
    self.init = function(config) {
        if (!angular.isDefined(config)) config = {};
        self.stepTimeMs = config.stepTimeMs || 100;
        self.lastTime = 0;
        self.diggers = [];
        self.diggerOffspring = [];
        self.diggerAncestors = [];
        self.maxOffspring = config.maxOffspring || 30;

        for (var d = 0; d < 2; d++) {
            var digger = new Breeder({
                id: d,
                generation: 0,
                scale: 6,
            });
            for (var g = 0; g < 49; g++) {
                digger.genes.push([
                    randomIntFromInterval(0, 255),
                    randomIntFromInterval(0, 255),
                    randomIntFromInterval(10, 20),
                ]);
            }
            digger.update();
            self.diggers.push(digger);
        }
        self.gameLoop(0);
    };
    self.SubscribeBreedEvent = function(scope, callback) {
        var handler = $rootScope.$on('breedEvent', callback.bind(this));
        scope.$on('$destroy', handler);
    };
    self.SubscribeNewGenerationEvent = function(scope, callback) {
        var handler = $rootScope.$on('newGenerationEvent', callback);
        scope.$on('$destroy', handler);
    };

    self.breed = function(steps) {
        for (var loops = 0; loops < steps; loops++) {
            if (self.diggerOffspring.length < self.maxOffspring) {
                var child = self.diggers[0].breed(self.diggers[1], self.diggerOffspring.length);
                self.diggerOffspring.push(child);
                $rootScope.$emit('breedEvent', self.diggerOffspring);
            } else {
                self.nextGeneration();
                $rootScope.$emit('newGenerationEvent', { Ancestors: self.diggerAncestors, Diggers: self.diggers });
            }
        }
    };

    self.nextGeneration = function() {
        self.diggerAncestors.push(self.diggers);
        self.diggers = [];
        var newParents = self.determineNextParents(self.blueFitness);
        self.diggers.push(newParents[0]);
        self.diggers.push(newParents[1]);
        self.diggerOffspring = [];
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
        self.diggerOffspring[fit1.index].update({ scale: 6 });
        self.diggerOffspring[fit2.index].update({ scale: 6 });
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

    self.gameLoop = function(step) {
        var self = this;
        var steps = 0;
        while (self.lastTime + step > (self.stepTimeMs * (steps + 1))) {
            steps++;
        }
        self.lastTime = (self.lastTime - (self.stepTimeMs * steps));
        self.breed(steps);
        $window.requestAnimationFrame(this.gameLoop.bind(this));
    };

}]);
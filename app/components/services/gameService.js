var game = angular.module('bloqhead.genetixApp');

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

game.constant('gameStates', {
        PAUSED: 0,
        RUNNING: 1
});

game.service('gameService', [
    '$window', '$rootScope', 'Breeder', 'geneDefinitions', 'gameStates', 'traitDefinitions',
    function($window, $rootScope, Breeder, geneDefinitions, gameStates, traitDefinitions) {
    var self = this;
    self.init = function(config) {
        if (!angular.isDefined(config)) config = {};
        self.stepTimeMs = config.stepTimeMs || 5000;
        self.lastTime = 0;
        self.diggers = [];
        self.diggerOffspring = [];
        self.diggerAncestors = [];
        self.maxOffspring = config.maxOffspring || 30;
        self.currentState = gameStates.RUNNING;

        for (var d = 0; d < 2; d++) {
            var digger = new Breeder({
                id: d,
                generation: 0,
                scale: 6,
            });
            for (var g = 0; g < geneDefinitions.length; g++) {
                digger.genes.push([
                    0,
                    0,
                    5,
                ]);
            }

            if (d === 0) {
                /*digger.genes[0] = [0, 200, 10];
                digger.genes[2] = [0, 200, 10];
                digger.genes[4] = [0, 200, 10];
                digger.genes[5] = [0, 200, 10];
digger.genes[14] = [150, 0, 10];*/
                digger.genes[42] = [255, 0, 0];
            }
            if (d == 1) {
               /* digger.genes[0] = [150, 0, 10];
                digger.genes[4] = [0, 200, 10];
digger.genes[5] = [0, 200, 10];*/
                digger.genes[42] = [0, 255, 0];
            }
            digger.update();
            self.diggers.push(digger);
        }
        
        // we need to be able to pause this, it keeps
        // locking up my browser if i leave it open
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
    self.getState = function() {
        return self.currentState;
    };
    self.setState = function(newState) {
        self.currentState = newState;
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
        if (self.diggerAncestors.length > self.maxOffspring) self.diggerAncestors = self.diggerAncestors.slice(1);
        self.diggers = [];
        var newParents = self.determineNextParents(self.aggressive);
        self.diggers.push(newParents[0]);
        self.diggers.push(newParents[1]);
        self.diggerOffspring = [];
    };
    self.determineNextParents = function(fitnessFunc) {
        var numgenes = self.diggerOffspring[0].genes.length;
        var fitMale = {
                index: -1,
                value: -255 * numgenes
            },
            fitFemale = {
                index: -1,
                value: -255 * numgenes
            };
        for (var i = 0; i < self.diggerOffspring.length; i++) {
            var digger = self.diggerOffspring[i];
            var val = fitnessFunc(digger);
            if (digger.hasTrait('Male') && fitMale.value < val) {
                fitMale.index = i;
                fitMale.value = val;                
            } else if (digger.hasTrait('Female') && fitFemale.value < val) {
                fitFemale.index = i;
                fitFemale.value = val;
            }
        }
        self.diggerOffspring[fitMale.index].update({ scale: 6 });
        self.diggerOffspring[fitFemale.index].update({ scale: 6 });
        return [self.diggerOffspring[fitMale.index], self.diggerOffspring[fitFemale.index]];
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
    self.aggressive = function(digger) {
        var traitDefinition = traitDefinitions.filter(function(trait) {
            return trait.name ==='Aggressive';
        })[0];

        return self.traitFitness(digger, traitDefinition);
    };

    // a value between 0 and 1, the higher the better. If its not possible
    // for the digger to ever have this trait, it will return -1.
    self.traitFitness = function(digger, traitDefinition) {
        var numgenes = traitDefinition.genes.length;
        var val = 1; // the inverse of this will be returned
        for (var g = 0; g < numgenes; g++) {
            var tdg = traitDefinition.genes[g];
            var dg = digger.genes[tdg[0]];
            var dgval = dg[1] - dg[0];
            var tdval = (tdg[2] + tdg[1])/2;
            if (dg[0] === 0 && dg[1] === 0 && dg[2] === 0)
                return -1; // shootin blanks for one of the genes necessary for the trait
            
            // best cast scenario is when the diggers gene is at the exact median of the range
            // required for the trait, since val would remain the same, making them more fit
            if (dgval != tdval)
                val *= Math.abs(dgval - tdval);
        }
        return  1 / val;

    };




    self.gameLoop = function(step) {
        var self = this;
        var steps = 0;        
        while (self.lastTime + step > (self.stepTimeMs * (steps + 1))) {
            steps++;
        }
        self.lastTime = (self.lastTime - (self.stepTimeMs * steps));
        if(self.currentState == gameStates.RUNNING) {            
            self.breed(steps);
        }
        $window.requestAnimationFrame(this.gameLoop.bind(this));
    };

}]);
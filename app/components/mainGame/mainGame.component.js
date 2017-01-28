var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.mainGame', {
    templateUrl: 'components/mainGame/mainGame.html',
    controller: 'bloqhead.controllers.mainGame'
});



game.controller('bloqhead.controllers.mainGame', ['$scope', 'populationService', function($scope, populationService) {
    var self = this;
    self.$onInit = function() {
        self.breeders = [];
        self.population = [];
        populationService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);
        populationService.SubscribeBreederUpdateEvent($scope, self.updateBreeders);
    };

    self.updateGene = function(breederIndex, geneIndex, geneValues, parent) {
        if (parent) {
            var unit = self.breeders[breederIndex];
            unit.genes[geneIndex] = geneValues;
            unit.update();
        }
    };

    self.addBreeder = function(unitid) {
        populationService.addBreeder(unitid);
    };

    self.removeBreeder = function(unitid) {
        populationService.removeBreeder(unitid);
    };

    self.updateBreeders = function(event, breeders) {
        self.breeders = breeders;
    };
    self.updatePopulation = function(event, population) {
        self.population = population;
    };
}]);
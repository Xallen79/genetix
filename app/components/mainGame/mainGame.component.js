var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.home', {
    templateUrl: 'components/home.html',
    controller: 'bloqhead.controllers.home'
});
game.controller('bloqhead.controllers.home', function() {
    this.$onInit = function() {

    };
});



game.component('bloqhead.components.mainGame', {
    templateUrl: 'components/mainGame/mainGame.html',
    controller: 'bloqhead.controllers.mainGame'
});



game.controller('bloqhead.controllers.mainGame', [
    '$scope', 'populationService', 'achievementService',
    function($scope, populationService, achievementService) {
        var self = this;
        self.$onInit = function() {
            self.breeders = [];
            self.population = [];
            self.maxPopulation = 0;
            populationService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);
            populationService.SubscribeBreederUpdateEvent($scope, self.updateBreeders);

            achievementService.SubscribeNewRewardEvent($scope, self.rewardEarned);
        };

        self.rewardEarned = function(event, reward) {
            console.log(reward);
        };

        self.updateGene = function(id, geneIndex, geneValues) {
            populationService.updateMember(id, geneIndex, geneValues);
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
        self.updatePopulation = function(event, data) {
            self.population = data.population;
            self.maxPopulation = data.maxSize;
        };
    }
]);


game.component("bloqheadBreeder", {
    templateUrl: "components/mainGame/breeder.html",
    controller: "bloqheader.controllers.breeder",
    bindings: {
        unit: '<',
        assign: '&'
    }
});

game.controller("bloqheader.controllers.breeder", function() {
    var self = this;
    self.$onInit = function() {

    };
    self.assignMe = function() {
        self.assign({ $id: self.unit.id });
    };
});
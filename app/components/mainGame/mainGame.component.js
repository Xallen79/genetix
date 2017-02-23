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
    '$scope', 'populationService', 'achievementService', 'resourceService', 'workerService',
    function($scope, populationService, achievementService, resourceService, workerService) {
        var self = this;
        self.$onInit = function() {
            self.breeders = [];
            self.population = [];
            self.maxPopulation = 0;
            self.maxBreeders = 0;
            populationService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);
            populationService.SubscribeBreederUpdateEvent($scope, self.updateBreeders);
            achievementService.SubscribeNewRewardEvent($scope, self.rewardEarned);
        };

        self.rewardEarned = function(event, reward) {
            // eventually this will show a popup
            console.log(reward);
        };

        self.updateGene = function(id, geneIndex, geneValues) {
            populationService.updateMember(id, geneIndex, geneValues);
        };
        self.assign = function(unitid, jobType) {
            if (!angular.isDefined(jobType))
                self.addBreeder(unitid);
            else
                workerService.addWorker(jobType, unitid);
        };
        self.dropped = function(dragId, dropId, relativePos) {
            if (dropId === "breeder-target") {
                console.log(relativePos);
                var drag = angular.element(document.getElementById(dragId));
                this.addBreeder(drag.data('breederid'));
            }
        };
        self.addBreeder = function(unitid) {

            populationService.addBreeder(unitid);
        };

        self.removeBreeder = function(unitid) {
            populationService.removeBreeder(unitid);
        };

        self.updateBreeders = function(event, data) {
            self.breeders = data.breeders;
            self.isBreeding = data.isBreeding;
            self.stepsSinceBreed = data.stepsSinceBreed;
            self.breedSteps = data.breedSteps;
        };
        self.updatePopulation = function(event, data) {
            self.population = data.population;
            self.newborns = data.newborns;
            self.maxPopulation = data.maxSize;
            self.breederLimit = data.breederLimit;
            self.newbornLimit = data.newbornLimit;
        };
        self.decideFate = function(unitid, fate) {
            populationService.processNewbornFate(unitid, fate);
        };

    }
]);
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
    '$scope', 'hiveService', 'achievementService', 'resourceService', 'workerService',
    function($scope, hiveService, achievementService, resourceService, workerService) {
        var self = this;
        self.$onInit = function() {
            //self.breeders = [];
            self.population = [];
            self.maxPopulation = 0;
            //self.maxBreeders = 0;
            hiveService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);
            //hiveService.SubscribeBreederUpdateEvent($scope, self.updateBreeders);
            achievementService.SubscribeNewRewardEvent($scope, self.rewardEarned);
        };

        self.rewardEarned = function(event, reward) {
            // eventually this will show a popup
            console.log(reward);
        };

        self.updateGene = function(id, geneIndex, geneValues) {
            hiveService.updateMember(id, geneIndex, geneValues);
        };
        self.assign = function(unitid, jobType) {
            if (!angular.isDefined(jobType))
                self.addBreeder(unitid);
            else
                workerService.addWorker(jobType, unitid);
        };
        self.dropped = function(dragId, dropId, relativePos) {
            if (dropId === "breeder-target") {
                var drag = angular.element(document.getElementById(dragId));
                this.addBreeder(drag.data('breederid'));
            }
        };
        /*
        self.addBreeder = function(unitid) {

            hiveService.addBreeder(unitid);
        };

        self.removeBreeder = function(unitid) {
            hiveService.removeBreeder(unitid);
        };

        self.updateBreeders = function(event, data) {
            self.breeders = data.breeders;
            self.isBreeding = data.isBreeding;
            self.stepsSinceBreed = data.stepsSinceBreed;
            self.breedSteps = data.breedSteps;
        };
        */
        self.updatePopulation = function(event, data) {
            self.bees = data;
        };
        self.decideFate = function(unitid, fate) {
            hiveService.processNewbornFate(unitid, fate);
        };

    }
]);
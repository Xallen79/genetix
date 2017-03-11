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

            self.hive = hiveService.hive;
            self.maxPopulation = 0;

            hiveService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);

            achievementService.SubscribeNewRewardEvent($scope, self.rewardEarned);
        };

        self.rewardEarned = function(event, reward) {
            // eventually this will show a popup
            console.log(reward);
        };

        self.assign = function(unitid, jobType) {
            workerService.addWorker(jobType, unitid);
        };


        self.updatePopulation = function(event, data) {
            self.hive = data;
        };
        self.decideFate = function(unitid, fate) {
            hiveService.processNewbornFate(unitid, fate);
        };

    }
]);
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
    '$scope', '$filter', 'hiveService', 'achievementService', 'resourceService', 'workerService', 'mapService',
    function($scope, $filter, hiveService, achievementService, resourceService, workerService, mapService) {
        var self = this;
        self.$onInit = function() {
            self.maxPopulation = 0;

            hiveService.SubscribePopulationUpdateEvent($scope, self.updatePopulation);
            mapService.SubscribeMapUpdateEvent($scope, self.updateMap);
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
            if (!self.currentHiveID) {
                self.hive = data[0];
                self.currentHiveID = self.hive.id;
            } else {
                self.hive = $filter('filter')(data, { id: self.currentHiveID })[0];
            }
        };
        self.decideFate = function(unitid, fate) {
            hiveService.processFate(unitid, fate, self.currentHiveID);
        };

        self.updateMap = function(event, mapState) {
            if (self.currentHiveID !== mapState.currentHiveID) {
                self.currentHiveID = mapState.currentHiveID;
                self.hive = hiveService.getHive(self.currentHiveID);
            }
        };

    }
]);
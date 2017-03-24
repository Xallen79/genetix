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
    '$scope', '$filter', 'achievementService', 'mapService',
    function($scope, $filter, achievementService, mapService) {
        var self = this;
        self.$onInit = function() {
            self.maxPopulation = 0;

            mapService.SubscribeHiveChangeEvent($scope, self.updateHive);
            achievementService.SubscribeNewRewardEvent($scope, self.rewardEarned);
        };

        self.rewardEarned = function(event, reward) {
            // eventually this will show a popup
            console.log(reward);
        };

        self.assign = function(unitid, jid) {
            self.hive.setUnitJob(unitid, jid);
        };

        /*
        self.updatePopulation = function(event, data) {
            if (!self.currentHiveID) {
                self.hive = data[0];
                self.currentHiveID = self.hive.id;
            } else {
                self.hive = $filter('filter')(data, { id: self.currentHiveID })[0];
            }
            
        };
        */
        self.decideFate = function(unitid, fate) {
            self.hive.processFate(unitid, fate);
        };

        self.updateHive = function(event, data) {
            self.hive = data.currentHive;
        };

    }
]);
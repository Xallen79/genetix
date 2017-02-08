var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.achievementsUI', {
    templateUrl: 'components/achievements/achievements.html',
    controller: 'bloqhead.controllers.achievementsUI',
    bindings: {
        title: '@',
        footer: '@'
    }
});


game.controller('bloqhead.controllers.achievementsUI', [
    '$rootScope', 'achievementSetup', 'resourceTypes', 'achievementService',
    function($rootScope, achievementSetup, resourceTypes, achievementService) {
        var self = this;




        self.achievementSetup = achievementSetup;

        self.$onInit = function() {
            self.achievementProgress = achievementService.getProgressSnapshot();
            console.log(self.achievementProgress);
        };

        self.getAchievementClass = function(achSetup) {
            var ret = {};
            if (achSetup.res) {
                ret['achievement-rank-' + resourceTypes[achSetup.res].attr] = true;
            }
            return ret;
        };

        self.getAchievementRankClass = function(achSetup, rank) {
            var ret = {};
            if (achSetup.res) {
                //if (self.progre) {

                //}
                ret['achievement-rank-' + resourceTypes[achSetup.res].attr] = true;
            }
            return ret;
        };


    }
]);
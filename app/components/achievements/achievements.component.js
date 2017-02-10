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
        self.achievementService = achievementService;
        self.achievementSetup = achievementSetup;

        self.$onInit = function() {
            self.achievementProgress = achievementService.getProgressSnapshot();
            console.log(self.achievementProgress);
        };

        self.getAchievementClass = function(achSetup) {
            var ret = {};
            //if (achSetup.res) {
            //    ret['achievement-rank-' + resourceTypes[achSetup.res].attr] = true;
            //}
            return ret;
        };

        self.getAchievementRankClass = function(achSetup, ar) {
            var ret = {};
            if (achSetup.res) {
                var progress = self.achievementService.state.progress.achievements[achSetup.aid] || {};
                if (progress.lastRank >= ar[0])
                    ret['achievement-rank-' + resourceTypes[achSetup.res].attr] = true;
            }
            return ret;
        };


    }
]);
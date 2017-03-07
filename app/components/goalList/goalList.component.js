var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.farmUI', {
    templateUrl: 'components/farmUI/farmUI.html',
    controller: 'bloqhead.controllers.farmUI',
    bindings: {
        title: '@',
        footer: '@'
    }
});


game.component('bloqheadGoalList', {
    templateUrl: 'components/goalList/goalList.html',
    controller: 'bloqhead.controllers.goalList',
    bindings: {
        //canBreed: '<',
        //breederAssign: '&',
        //population: '<',
        //maxPopulation: '='
    }
});

game.controller('bloqhead.controllers.goalList', [
    '$rootScope', 'resourceTypes', 'achievementService',
    function($rootScope, resourceTypes, achievementService) {
        var self = this;
        self.resourceTypes = resourceTypes;
        self.achievementService = achievementService;

        self.$onInit = function() {

        };

    }
]);
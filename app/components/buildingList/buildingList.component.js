var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadBuildingList', {
    templateUrl: 'components/buildingList/buildingList.html',
    controller: 'bloqhead.controllers.buildingList'
});


game.controller('bloqhead.controllers.buildingList', [
    '$scope', 'buildingService', 'resourceTypes',
    function($scope, buildingService, resourceTypes) {
        var self = this;
        self.$onInit = function() {
            self.buildings = []; //buildingService.getBuildingSnapshot();
            self.resourceTypes = resourceTypes;
            buildingService.SubscribeBuildingsChangedEvent($scope, self.updateBuildings);
        };
        self.updateBuildings = function(event, buildings) {
            self.buildings = buildings;
        };

        self.build = function(type) {
            buildingService.build(type);
        };

    }
]);
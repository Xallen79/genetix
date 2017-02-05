var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadBuildingList', {
    templateUrl: 'components/buildingList/buildingList.html',
    controller: 'bloqhead.controllers.buildingList'
});


game.controller('bloqhead.controllers.buildingList', [
    '$scope', 'buildingService', '$sce',
    function($scope, buildingService, $sce) {
        var self = this;
        self.$onInit = function() {
            self.buildings = []; //buildingService.getBuildingSnapshot();
            buildingService.SubscribeBuildingsChangedEvent($scope, self.updateBuildings);
        };
        self.updateBuildings = function(event, buildings) {
            self.buildings = buildings;
            for (var i = 0; i < buildings.length; i++) {
                buildings[i].tooltip = $sce.trustAsHtml(self.getCostTooltip(buildings[i].costToBuild));
            }
            console.log(buildings);
        };
        self.getCostTooltip = function(costToBuild) {
            var tooltip = '\'<ul class="list-group">';
            for (var i = 0; i < costToBuild.length; i++) {
                tooltip += '<li class="list-group-item"><span>' + costToBuild[i].amount + '</span> <span>' + costToBuild[i].resource + '</span></li>';
            }
            tooltip += '</ul>\'';
            return tooltip;
        };

    }
]);
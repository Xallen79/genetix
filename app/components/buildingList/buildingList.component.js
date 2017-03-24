var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadBuildingList', {
    templateUrl: 'components/buildingList/buildingList.html',
    controller: 'bloqhead.controllers.buildingList',
    bindings: {
        hive: '='
    }
});


game.controller('bloqhead.controllers.buildingList', [
    '$scope', 'resourceTypes',
    function($scope, resourceTypes) {
        var self = this;
        self.$onInit = function() {
            self.buildings = self.hive.buildings;
            self.resourceTypes = resourceTypes;

        };

        self.build = function(building) {
            self.hive.build(building);
        };

    }
]);
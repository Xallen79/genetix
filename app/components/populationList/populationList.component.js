var game = angular.module('bloqhead.genetixApp');



game.component('bloqheadPopulationList', {
    templateUrl: 'components/populationList/populationList.html',
    controller: 'bloqhead.controllers.populationList',
    bindings: {
        canBreed: "<",
        breederAssign: "&",
        population: '<',
        maxPopulation: '='
    }
});

game.controller('bloqhead.controllers.populationList', [
    '$scope', 'resourceService', 'resourceTypes',
    function($scope, resourceService, resourceTypes) {
        var self = this;


        self.$onInit = function() {
            //resourceService.SubscribeResourceChangedEvent($scope, self.resourceChanged);
            //resourceService.SubscribeResourceLimitChangedEvent($scope, self.resourceLimitChanged);
            //resourceService.SubscribeResourceEnabledEvent($scope, self.resourceEnabled);
            //self.resources = resourceService.getResourcesSnapshot();
        };

        /*
        self.resourceChanged = function(event, resourceType, amount) {
            if (!self.resources[resourceType])
                self.resources[resourceType] = [];
            self.resources[resourceType][0] = amount;
        };
        self.resourceLimitChanged = function(event, resourceType, amount) {
            if (!self.resources[resourceType])
                self.resources[resourceType] = [];
            self.resources[resourceType][1] = amount;
        };
        self.resourceEnabled = function(event, resourceType, bit) {
            self.resources[resourceType][2] = bit;
        };
        */
    }




]);
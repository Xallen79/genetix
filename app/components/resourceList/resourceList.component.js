var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadResourceList', {
    templateUrl: 'components/resourceList/resourceList.html',
    controller: 'bloqhead.controllers.resourceList'
});




game.controller('bloqhead.controllers.resourceList', [
    '$scope', 'resourceService', 'resourceTypes',
    function($scope, resourceService, resourceTypes) {
        var self = this;
        self.resourceTypes = resourceTypes;
        self.resources = {};
        self.$onInit = function() {
            resourceService.SubscribeResourceChangedEvent($scope, self.resourceChanged);
            resourceService.SubscribeResourceLimitChangedEvent($scope, self.resourceLimitChanged);
            resourceService.SubscribeResourceEnabledEvent($scope, self.resourceEnabled);
            self.resources = resourceService.getResourcesSnapshot();
        };

        self.getUnlockedResources = function() {
            var ret = {};
            for (var res in self.resources)
                if (self.resources.hasOwnProperty(res))
                    if (self.resources[res][2] === true)
                        ret[res] = self.resources[res];
            return ret;
        };



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

    }
]);
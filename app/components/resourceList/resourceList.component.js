/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadResourceList', {
    templateUrl: 'components/resourceList/resourceList.html',
    controller: 'bloqhead.controllers.resourceList',
    bindings: {
        assign: "&"
    }
});




game.controller('bloqhead.controllers.resourceList', [
    '$scope', 'resourceService', 'resourceTypes', 'jobTypes',
    function($scope, resourceService, resourceTypes, jobTypes) {
        var self = this;
        self.resourceTypes = resourceTypes;
        self.jobTypes = jobTypes;
        self.resources = {};

        self.getWorkerIcon = function(res) {
            return resourceService.getWorkerIcon(res);
        };

        self.$onInit = function() {
            resourceService.SubscribeResourceChangedEvent($scope, self.resourceChanged);
            resourceService.SubscribeResourceLimitChangedEvent($scope, self.resourceLimitChanged);
            resourceService.SubscribeResourceEnabledEvent($scope, self.resourceEnabled);
            self.resources = resourceService.getResourcesSnapshot();
            self.workers = [];
        };

        self.getUnlockedResources = function() {
            var ret = {};
            for (var res in self.resources)
                if (self.resources.hasOwnProperty(res))
                    if (self.resources[res][2] === true)
                        ret[res] = self.resources[res];
            return ret;
        };

        self.getWorkerRate = function(res) {
            var ret = 0;
            for (var i = 0; i < self.workers.length; i++) {
                if (res === self.workers[i].resource)
                    ret += self.workers[i].rate;
            }
            return ret;
        };

        self.getWorkerCount = function(res) {
            var ret = 0;
            for (var i = 0; i < self.workers.length; i++) {
                if (res === self.workers[i].resource)
                    ret += self.workers[i].count;
            }
            return ret;
        };

        self.dropped = function(dragId, dropId, relativePos, resourceKey) {
            var jobType = resourceTypes[resourceKey].jids[0];
            var unitid = angular.element(document.getElementById(dragId)).data('beeid');
            self.assign({ $id: unitid, $jid: jobType });
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
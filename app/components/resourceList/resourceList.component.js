/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadResourceList', {
    templateUrl: 'components/resourceList/resourceList.html',
    controller: 'bloqhead.controllers.resourceList',
    bindings: {
        assign: "&",
        hive: "="
    }
});




game.controller('bloqhead.controllers.resourceList', [
    '$scope', 'resourceTypes', 'jobTypes',
    function($scope, resourceTypes, jobTypes) {
        var self = this;
        self.resourceTypes = resourceTypes;
        self.jobTypes = jobTypes;

        self.getWorkerIcon = function(res) {
            return self.resourceTypes[res].icon;
        };

        self.$onInit = function() {
            self.workers = self.hive.getBeesByType("worker");
        };

        self.getUnlockedResources = function() {
            var ret = {};
            for (var res in self.hive.resources)
                if (self.hive.resources.hasOwnProperty(res))
                    if (self.hive.resources[res][2] === true)
                        ret[res] = self.hive.resources[res];
            return ret;
        };

        self.getWorkerRate = function(res) {
            var ret = 0;
            // for (var i = 0; i < self.workers.length; i++) {
            //     if (res === self.workers[i].resource)
            //         ret += self.workers[i].rate;
            // }
            return ret;
        };

        self.getWorkerCount = function(res) {
            var ret = 0;
            // for (var i = 0; i < self.workers.length; i++) {
            //     if (res === self.workers[i].resource)
            //         ret += self.workers[i].count;
            // }
            return ret;
        };

        self.dropped = function(dragId, dropId, relativePos, resourceKey) {
            var jobType = resourceTypes[resourceKey].jids[0];
            var unitid = angular.element(document.getElementById(dragId)).data('beeid');
            self.assign({ $id: unitid, $jid: jobType });
        };

    }
]);
var game = angular.module('bloqhead.genetixApp');


game.component("bloqheadBee", {
    templateUrl: "components/bee/bee.html",
    controller: "bloqheader.controllers.bee",
    bindings: {
        unit: "<",
        canBreed: "<",
        assign: "&",
        mode: "@",
        display: "@"
    }
});

game.controller("bloqheader.controllers.bee", [
    "$uibModal", "jobTypes", "bloqheadGetGeneProgressStyle", 'resourceTypes', 'resourceService',
    function($uibModal, jobTypes, bloqheadGetGeneProgressStyle, resourceTypes, resourceService) {
        var self = this;
        self.$onInit = function() {
            self.display = self.display || 'TILE';
            self.jobTypes = jobTypes;
            self.resourceTypes = resourceTypes;
            self.resourceService = resourceService;
        };
        self.canFertilize = function() {
            // for (var key in self.unit.societyValue) {
            //     var cost = self.unit.societyValue[key];
            //     if (resourceService.getResource(cost.resourceType) < cost.amount) {
            //         return false;
            //     }
            // }
            return true;

        };
        self.assignMe = function(type) {
            // var doAssign = true;
            // if (type === "BANISH") {
            //     var spent = [];
            //     for (var key in self.unit.societyValue) {
            //         var cost = self.unit.societyValue[key];
            //         if (resourceService.changeResource(cost.resourceType, (-1 * cost.amount)) === -1) {
            //             doAssign = false;
            //             for (var i = 0; i < spent.length; i++) {
            //                 resourceService.changeResource(spent.type, spent.amount);
            //             }
            //             break;
            //         } else {
            //             spent.push({ type: cost.resourceType, amount: cost.amount });
            //         }
            //     }
            // } else {
            //     for (var k in self.unit.societyValue) {
            //         var value = self.unit.societyValue[k];
            //         resourceService.changeResource(value.resourceType, value.amount);
            //     }
            // }
            // if (doAssign)
            if (type === "CONSUME") {
                type = self.unit.beetype === 'egg' ? "CONSUME_EGG" : "CONSUME_LARVA";
            }
            self.assign({ $id: self.unit.id, $type: type });
        };
        self.getGeneTraitRangeStyle = function(g, t) {
            return bloqheadGetGeneProgressStyle().traitRange(g, t);
        };
        self.getGeneRangeStyle = function(gene) {
            return bloqheadGetGeneProgressStyle().range(gene[0], gene[1]);
        };
        self.getGeneValueStyle = function(g) {
            return bloqheadGetGeneProgressStyle().value(g[1] - g[0]);
        };
        self.imageHover = function(hoverEvent) {
            // var attrs = [];
            // for (var key in self.attributes) {
            //     attrs.push(key);
            // }
            // var imgWidth = hoverEvent.target.clientWidth;
            // var offsetX = hoverEvent.offsetX;
            // var attrSize = imgWidth / 5;
            // var index = Math.floor(offsetX / attrSize);
            // index = Math.min(attrs.length - 1, index);
            // self.hoverAttr = attrs[index];
        };
        self.showDetails = function(unit) {
            $uibModal.open({
                component: 'genomeEditor',
                resolve: {
                    unit: function() {
                        return self.unit;
                    }
                }
            });
        };
    }
]);
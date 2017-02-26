var game = angular.module('bloqhead.genetixApp');


game.component("bloqheadMortal", {
    templateUrl: "components/mortal/mortal.html",
    controller: "bloqheader.controllers.mortal",
    bindings: {
        unit: "<",
        canBreed: "<",
        assign: "&",
        mode: "@",
        display: "@"
    }
});

game.controller("bloqheader.controllers.mortal", [
    "$uibModal", "jobTypes", "bloqheadGetGeneProgressStyle", "geneDefinitions", "attributes", 'resourceTypes', 'resourceService',
    function($uibModal, jobTypes, bloqheadGetGeneProgressStyle, geneDefinitions, attributes, resourceTypes, resourceService) {
        var self = this;
        self.$onInit = function() {
            self.display = self.display || 'TILE';
            self.jobTypes = jobTypes;
            self.geneDefinitions = geneDefinitions;
            self.attributes = attributes;
            self.resourceTypes = resourceTypes;
            self.resourceService = resourceService;
        };
        self.canBanish = function() {
            for (var key in self.unit.banishCost) {
                var cost = self.unit.banishCost[key];
                if (resourceService.getResource(cost.resourceType) < cost.amount) {
                    return false;
                }
            }
            return true;

        };
        self.assignMe = function(type) {
            var doAssign = true;
            if (type === "BANISH") {
                var spent = [];
                for (var key in self.unit.banishCost) {
                    var cost = self.unit.banishCost[key];
                    if (resourceService.changeResource(cost.resourceType, (-1 * cost.amount)) === -1) {
                        doAssign = false;
                        for (var i = 0; i < spent.length; i++) {
                            resourceService.changeResource(spent.type, spent.amount);
                        }
                        break;
                    } else {
                        spent.push({ type: cost.resourceType, amount: cost.amount });
                    }
                }
            }
            if (doAssign)
                self.assign({ $id: self.unit.id, $type: type });
        };
        self.getGeneTraitRangeStyle = function(g, t) {
            return bloqheadGetGeneProgressStyle.traitRange(g, t);
        };
        self.getGeneRangeStyle = function(gene) {
            return bloqheadGetGeneProgressStyle.range(gene[0], gene[1]);
        };
        self.getGeneValueStyle = function(g) {
            return bloqheadGetGeneProgressStyle.value(g[1] - g[0]);
        };
        self.imageHover = function(hoverEvent) {
            var attrs = [];
            for (var key in self.attributes) {
                attrs.push(key);
            }
            var imgWidth = hoverEvent.target.clientWidth;
            var offsetX = hoverEvent.offsetX;
            var attrSize = imgWidth / 5;
            var index = Math.floor(offsetX / attrSize);
            index = Math.min(attrs.length - 1, index);
            self.hoverAttr = attrs[index];
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
var game = angular.module('bloqhead.genetixApp');

game.filter('applyPopulationFilter', function() {
    return function(input, filter) {
        var matches = [];
        var nonmatches = [];
        if (typeof filter == 'string')
            filter = JSON.parse(filter);
        for (var i = 0; i < input.length; i++) {
            var criteriaMet = true;
            if (filter && filter.traits) {
                for (var t = 0; t < filter.traits.length; t++) {
                    var trait = filter.traits[t];
                    var b = true;
                    if (trait[0] == '-') {
                        trait = trait.slice(1);
                        b = false;
                    }
                    if (b !== input[i].hasTrait(trait)) {
                        criteriaMet = false;
                        break;
                    }
                }
            }
            if (criteriaMet)
                matches.push(input[i]);
            if (!criteriaMet)
                nonmatches.push(input[i]);
        }

        return matches;
    };
});

game.service("bloqheadGetGeneProgressStyle", ['geneDefinitions', function(geneDefinitions) {
    function map(OldValue, OldMin, OldMax, NewMin, NewMax) {
        return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin;
    }

    return function(pgd) {
        var gd = pgd || geneDefinitions;
        return {
            range: function(rec, dom) {
                var ret = {};
                var os = map(-1 * rec, -255, 255, 0, 100);
                var w = map(dom, -255, 255, 0, 100);
                ret.marginLeft = os + '%';
                ret.width = (w - os) + '%';
                return ret;
            },
            traitRange: function(g, trait) {
                var ret = {};
                if (trait !== null) {
                    var i = gd.indexOf(g);
                    for (var x = 0; x < trait.genes.length; x++) {
                        var tg = trait.genes[x];
                        if (tg[0] == i) {
                            var os = map(tg[1], -255, 255, 0, 100);
                            var w = map(tg[2], -255, 255, 0, 100);
                            ret.marginLeft = os + '%';
                            ret.width = (w - os) + '%';
                        }
                    }


                }
                return ret;
            },
            value: function(v) {
                var l = map(v, -255, 255, 0, 100);
                if (l > 98) l = 98;
                if (l < 2) l = 2;
                var ret = {
                    position: 'absolute',
                    marginLeft: (l - 2) + '%',
                    top: '0px',
                    bottom: '0px',
                    width: '4%',
                    backgroundColor: 'white',
                    border: '1px solid black'
                };

                return ret;
            }
        };
    };
}]);

// POPULATION LIST

game.component('bloqheadPopulationList', {
    templateUrl: 'components/populationList/populationList.html',
    controller: 'bloqhead.controllers.populationList',
    bindings: {
        canBreed: '<',
        breederAssign: '&',
        population: '<',
        maxPopulation: '='
    }
});

game.controller('bloqhead.controllers.populationList', [
    '$uibModal', 'resourceService', 'resourceTypes', 'jobTypes',
    function($uibModal, resourceService, resourceTypes, jobTypes) {
        var self = this;
        self.jobTypes = jobTypes;
        self.criteria = [];


        self.$onInit = function() {};

        self.showDetails = function(unit) {
            $uibModal.open({
                component: 'genomeEditor',
                resolve: {
                    unit: function() {
                        return unit;
                    }
                }
            });
        };

        self.getCustomFilter = function() {
            var traits = [];
            for (var i = 0; i < self.criteria.length; i++) {
                var c = self.criteria[i];
                if (c.type == 'trait') {
                    traits.push(c.val.name);
                }
            }
            return JSON.stringify({
                traits: traits
            });
        };

        self.deleteCriteria = function(index) {
            self.criteria.splice(index, 1);
        };


        self.openTraitSelector = function(unit) {
            var modalInstance = $uibModal.open({
                animation: true,
                component: 'bloqheadTraitSelector',
                size: 'lg',
                resolve: {
                    unit: function() {
                        return unit;
                    }
                }
            });

            modalInstance.result.then(function(trait) {
                self.criteria.push({ type: 'trait', val: trait });
            }, function() {
                //$log.info('modal-component dismissed at: ' + new Date());
            });
        };


        self.showDetails = function(unit) {
            $uibModal.open({
                component: 'genomeEditor',
                resolve: {
                    unit: function() {
                        return unit;
                    }
                }
            });
        };

    }
]);

// POPULATION PANE

game.component('bloqheadPopulationPanel', {
    require: {
        parent: '^bloqheadPopulationList'
    },
    templateUrl: 'components/populationList/populationPanel.html',
    controller: 'bloqhead.controllers.populationPanel',
    bindings: {
        population: '<',
        filter: '<',
        orderBy: '<'
    }
});

game.controller('bloqhead.controllers.populationPanel', [
    'bloqheadGetGeneProgressStyle', 'geneDefinitions', 'resourceTypes', 'resourceService', 'attributes',
    function(bloqheadGetGeneProgressStyle, geneDefinitions, resourceTypes, resourceService, attributes) {
        var self = this;
        self.geneDefinitions = geneDefinitions;
        self.attributes = attributes;
        self.resourceTypes = resourceTypes;
        self.$onInit = function() {
            self.orderBy = self.orderBy || '-dt';
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
        self.getWorkerIcon = function(res) {
            return resourceService.getWorkerIcon(res);
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
    }
]);

// TRAIT SELECTOR

game.component('bloqheadTraitSelector', {
    templateUrl: 'components/populationList/traitSelector.html',
    controller: 'bloqhead.controllers.traitSelector',
    bindings: {
        resolve: '<',
        close: '&',
        dismiss: '&'
    }
});

game.controller('bloqhead.controllers.traitSelector', [
    'populationService', 'traitDefinitions', 'geneDefinitions', 'bloqheadGetGeneProgressStyle',
    function(populationService, traitDefinitions, geneDefinitions, bloqheadGetGeneProgressStyle) {
        var self = this;
        self.trait = null;


        self.showLocked = false;

        var lockedText = '?';

        self.getGeneDominant = function(g) {
            if (g.locked)
                return lockedText;
            else
                return g.dom;
        };
        self.getGeneRecessive = function(g) {
            if (g.locked)
                return lockedText;
            else
                return g.rec;
        };

        self.traitEnter = function(t) {
            self.trait = t;
        };
        self.traitLeave = function(t) {
            self.trait = null;
        };

        self.$onInit = function() {
            self.unit = self.resolve.unit;
            self.geneDefinitions = angular.copy(geneDefinitions);
            self.traitDefinitions = angular.copy(traitDefinitions);

            var arr = angular.copy(populationService.population.breederGenesUnlocked);
            arr.push(50); // gender

            for (var i = 0; i < self.geneDefinitions.length; i++) {
                self.geneDefinitions[i].unlocked = (arr.indexOf(i) !== -1);
                if (!self.geneDefinitions[i].unlocked) {
                    for (var x = 0; x < self.traitDefinitions.length; x++) {
                        var td = self.traitDefinitions[x];
                        if (typeof td.unlocked == 'undefined') td.unlocked = true;
                        for (var y = 0; y < td.genes.length; y++) {
                            if (td.genes[y][0] == i) {
                                td.unlocked = false;
                            }
                        }
                    }
                }
            }
        };



        self.select = function(t) {
            self.close({ $value: t });
        };

        self.ok = function() {
            self.close({ $value: self.trait });
        };

        self.cancel = function() {
            self.dismiss({ $value: 'cancel' });
        };
        self.getGeneRangeStyle = function(g) {
            var r = bloqheadGetGeneProgressStyle(self.geneDefinitions).traitRange(g, self.trait);
            return r;
        };


    }
]);
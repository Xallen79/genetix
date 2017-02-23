var game = angular.module('bloqhead.genetixApp');

game.filter('applyPopulationFilter', function() {
    return function(input, filter) {
        var matches = [];
        var nonmatches = [];
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

// POPULATION LIST

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
    '$uibModal', 'resourceService', 'resourceTypes', 'jobTypes',
    function($uibModal, resourceService, resourceTypes, jobTypes) {
        var self = this;
        self.jobTypes = jobTypes;
        self.criteria = [];


        self.$onInit = function() {};

        self.getCustomFilter = function() {
            var traits = [];
            for (var i = 0; i < self.criteria.length; i++) {
                var c = self.criteria[i];
                if (c.type == 'trait') {
                    traits.push(c.val);
                }
            }
            return JSON.stringify({
                traits: traits
            });
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
    function() {
        var self = this;
        self.$onInit = function() {
            self.orderBy = self.orderBy || '-dt';
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
    'traitDefinitions', 'geneDefinitions',
    function(traitDefinitions, geneDefinitions) {
        var self = this;
        self.trait = null;
        self.traitDefinitions = traitDefinitions;
        self.geneDefinitions = geneDefinitions;


        self.traitEnter = function(t) {
            self.trait = t;
        };
        self.traitLeave = function(t) {
            self.trait = null;
        };

        self.$onInit = function() {
            self.unit = self.resolve.unit;
        };
        self.getGeneStyle = function(g) {
            var ret = {};
            if (self.trait !== null) {
                var i = self.geneDefinitions.indexOf(g);
                for (var x = 0; x < self.trait.genes.length; x++) {
                    var tg = self.trait.genes[x];
                    if (tg[0] == i) {
                        var os = map(tg[1], -255, 255, 0, 100);
                        var w = map(tg[2], -255, 255, 0, 100);
                        ret.marginLeft = os + '%';
                        ret.width = (w - os) + '%';
                    }
                }


            }
            return ret;
        };
        self.ok = function() {
            self.close({ $value: self.trait });
        };

        self.cancel = function() {
            self.dismiss({ $value: 'cancel' });
        };

        function map(OldValue, OldMin, OldMax, NewMin, NewMax) {
            return (((OldValue - OldMin) * (NewMax - NewMin)) / (OldMax - OldMin)) + NewMin;
        }
    }
]);
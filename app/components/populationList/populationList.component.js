var game = angular.module('bloqhead.genetixApp');

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
    '$scope', '$uibModal', 'resourceService', 'resourceTypes', 'jobTypes',
    function($scope, $uibModal, resourceService, resourceTypes, jobTypes) {
        var self = this;
        self.jobTypes = jobTypes;

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
    }
]);


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
game.filter('applyPopulationFilter', function() {
    return function(input, filter) {
        var matches = [];
        var nonmatches = [];
        for (var i = 0; i < input.length; i++) {
            var criteriaMet = true;
            if (filter && filter.traits) {
                for (var t = 0; t < filter.traits.length; t++) {
                    if (!input[i].hasTrait(filter.traits[t])) {
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

game.controller('bloqhead.controllers.populationPanel', [
    function() {
        var self = this;
        self.$onInit = function() {
            self.orderBy = self.orderBy || '-dt';
        };

    }
]);
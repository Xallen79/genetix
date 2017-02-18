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

// not being used atm
game.component('bloqheadPopulationListMaleRow', {
    required: 'bloqheadPopulationList',
    templateUrl: 'components/populationList/maleRow.html',
    bindings: {
        canBreed: "<",
        breederAssign: "&",
        unit: '<',
        maxPopulation: '='
    }
});
// not being used atm
game.component('bloqheadPopulationListFemaleRow', {
    required: 'bloqheadPopulationList',
    templateUrl: 'components/populationList/femaleRow.html',
    bindings: {
        canBreed: "<",
        breederAssign: "&",
        unit: '<',
        maxPopulation: '='
    }
});


game.controller('bloqhead.controllers.populationList', [
    '$scope', 'resourceService', 'resourceTypes', 'jobTypes',
    function($scope, resourceService, resourceTypes, jobTypes) {
        var self = this;
        self.jobTypes = jobTypes;

        self.$onInit = function() {};
    }




]);
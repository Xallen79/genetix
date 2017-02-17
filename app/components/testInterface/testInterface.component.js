var app = angular.module('bloqhead.genetixApp');

app.component('bloqhead.components.testInterface', {
    templateUrl: 'components/testInterface/testInterface.html',
    controller: 'bloqhead.controllers.testInterface'
});

// tab components
app.component('breederTab', {
    bindings: {
        units: '<',
    },
    controller: ['Breeder', 'geneDefinitions', 'traitDefinitions', function(Breeder, geneDefinitions, traitDefinitions) {
        var self = this;

        self.lastBreederID = 0;
        self.newBreederGender = 'Male';

        self.killBreeder = function(unit) {
            self.units.splice(self.units.indexOf(unit), 1);
        };


        self.addNewBreeder = function() {
            var genes = [];
            for (var g = 0; g < geneDefinitions.length; g++) {
                genes.push([0, 0, 0]);
            }

            var gender = (self.newBreederGender == 'Male') ? 255 : 0;
            genes[42] = [gender, 255 - gender, 0];

            var unit = new Breeder({
                id: self.lastBreederID++,
                generation: 0,
                scale: 6,
                genes: genes
            });

            unit.update();
            self.units.unshift(unit);

        };
    }],
    templateUrl: 'components/testInterface/breederTab.html'
});
app.component('matingTab', {
    bindings: {
        units: '=',
    },
    controller: ['Breeder', 'geneDefinitions', 'traitDefinitions', function(Breeder, geneDefinitions, traitDefinitions) {
        var self = this;

    }],
    templateUrl: 'components/testInterface/matingTab.html'
});
app.component('configurationTab', {
    bindings: {

    },
    controller: [
        'Breeder', 'geneDefinitions', 'traitDefinitions', 'resourceTypes', 'jobTypes', 'defaultBuildings',
        function(Breeder, geneDefinitions, traitDefinitions, resourceTypes, jobTypes, defaultBuildings) {
            var self = this;
            self.$onInit = function() {
                self.snapshot = {
                    geneDefinitions: angular.copy(geneDefinitions),
                    traitDefinitions: angular.copy(traitDefinitions),
                    resourceTypes: angular.copy(resourceTypes),
                    jobTypes: angular.copy(jobTypes),
                    defaultBuildings: angular.copy(defaultBuildings)
                };
            };

        }
    ],
    templateUrl: 'components/testInterface/configurationTab.html'
});


app.component('genomeEditor', {
    bindings: {
        u: '=',
        resolve: '<'
    },
    controller: ['geneDefinitions', function(geneDefinitions) {
        var self = this;
        self.$onInit = function() {
            self.geneDefinitions = geneDefinitions;
            self.expando = true;
            self.unit = self.u || self.resolve.unit || {};
        };
        self.randomizeName = function() {
            self.unit.name = self.unit.getRandomName();
        };
        self.randomize = function(index) {
            self.unit.genes[index] = [randomIntFromInterval(0, 255), randomIntFromInterval(0, 255), randomIntFromInterval(0, 255)];
        };
        self.randomizeAll = function() {
            for (var i = 0; i < self.unit.genes.length; i++)
                self.randomize(i);

            var gender = randomIntFromInterval(0, 1) === 0 ? 255 : 0;
            self.unit.genes[42] = [gender, 255 - gender, 0];
            self.unit.update();
        };

    }],
    templateUrl: 'components/testInterface/genomeEditor.html'
});



app.controller('bloqhead.controllers.testInterface', ['$scope', '$timeout', 'gameService', 'Breeder', 'geneDefinitions', 'traitDefinitions', function($scope, $timeout, gameService, Breeder, geneDefinitions, traitDefinitions) {
    var self = this;




    self.$onInit = function() {
        self.geneDefinitions = geneDefinitions;
        self.traitDefinitions = traitDefinitions;
        //self.diggers = gameService.diggers;
        self.units = [];

        //gameService.SubscribeBreedEvent($scope, function(event, offspring) {
        //    //$scope.$apply(function() { self.diggerOffspring = offspring; });
        //});
        //gameService.SubscribeNewGenerationEvent($scope, function(event, data) {
        //    $scope.$apply(function() {
        //        self.diggers = data.Diggers;
        //        //self.diggerAncestors = data.Ancestors;
        //    });
        //});

        /*
        self.updateGene = function(diggerIndex, geneIndex, values) {
            var unit = self.units[diggerIndex];
            digger.genes[geneIndex] = values;
            digger.update();
        };
        */

    };

}]);
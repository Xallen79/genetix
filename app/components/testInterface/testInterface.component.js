var app = angular.module('bloqhead.genetixApp');

app.component('bloqhead.components.testInterface', {
    templateUrl: 'components/testInterface/testInterface.html',
    controller: 'bloqhead.controllers.testInterface'
});

app.component('genomeEditor', {
    bindings: {
        unit: '<',
        updateGene: '&'
    },
    controller: ['geneDefinitions', function(geneDefinitions) {
        var self = this;
        self.$onInit = function() {
            self.geneDefinitions = geneDefinitions;
            self.expando = false;
        };
        self.randomize = function(index) {
            var newValues = [];
            newValues.push(randomIntFromInterval(0, 255));
            newValues.push(randomIntFromInterval(0, 255));
            newValues.push(randomIntFromInterval(0, 255));
            self.updateGene({ $geneIndex: index, $values: newValues });
        };
        self.randomizeAll = function() {
            for (var i = 0; i < self.unit.genes.length; i++)
                self.randomize(i);

            var gender = randomIntFromInterval(0, 1) === 0 ? 'Male' : 'Female';
            var r = (gender == 'Male') ? 255 : 0;
            var g = (gender == 'Male') ? 0 : 255;
            self.updateGene({ $geneIndex: 42, $values: [r, g, 0] });
            self.unit.setRandomName();
        };

    }],
    templateUrl: 'components/testInterface/genomeEditor.html'


});



app.controller('bloqhead.controllers.testInterface', ['$scope', '$timeout', 'gameService', 'Breeder', 'geneDefinitions', 'traitDefinitions', function($scope, $timeout, gameService, Breeder, geneDefinitions, traitDefinitions) {
    var self = this;

    self.lastBreederID = 0;
    self.newBreederGender = 'Male';

    self.killBreeder = function(digger) {
        self.diggers.splice(self.diggers.indexOf(digger), 1);
    };


    self.addNewBreeder = function() {
        var genes = [];
        for (var g = 0; g < geneDefinitions.length; g++) {
            genes.push([0, 0, 0]);
        }
        var rv = (self.newBreederGender == 'Male') ? 255 : 0;
        var gv = (self.newBreederGender == 'Male') ? 0 : 255;

        genes[42][0] = rv;
        genes[42][1] = gv;


        var digger = new Breeder({
            id: self.lastBreederID++,
            generation: 0,
            scale: 6,
            genes: genes
        });

        digger.update();
        self.diggers.unshift(digger);

    };


    self.$onInit = function() {
        self.geneDefinitions = geneDefinitions;
        self.traitDefinitions = traitDefinitions;
        //self.diggers = gameService.diggers;
        self.diggers = [];

        //gameService.SubscribeBreedEvent($scope, function(event, offspring) {
        //    //$scope.$apply(function() { self.diggerOffspring = offspring; });
        //});
        //gameService.SubscribeNewGenerationEvent($scope, function(event, data) {
        //    $scope.$apply(function() {
        //        self.diggers = data.Diggers;
        //        //self.diggerAncestors = data.Ancestors;
        //    });
        //});

        self.updateGene = function(diggerIndex, geneIndex, values) {
            var digger = self.diggers[diggerIndex];
            digger.genes[geneIndex] = values;
            digger.update();
        };


    };

}]);
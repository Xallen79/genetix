var app = angular.module('bloqhead.genetixApp');

app.component('bloqhead.components.testInterface', {
    templateUrl: 'components/testInterface/testInterface.html',
    controller: 'bloqhead.controllers.testInterface'
});

app.component('genomeEditor',{

    bindings: {
        genes: '<',
        updateGene: '&'
    },
    controller: ['geneDefinitions', function(geneDefinitions) {
        var self = this;
        self.$onInit = function() {
            self.geneDefinitions = geneDefinitions;
        };
        self.randomize = function(index) {
            var newValues = [];
            newValues.push(randomIntFromInterval(0,255));
            newValues.push(randomIntFromInterval(0,255));
            newValues.push(randomIntFromInterval(0,255));
            self.updateGene({$geneIndex: index, $values: newValues});
        };
        
    }],
    templateUrl: 'components/testInterface/genomeEditor.html'
  

});



app.controller('bloqhead.controllers.testInterface', ['$scope', '$timeout', 'gameService', 'geneDefinitions', 'traitDefinitions', function($scope, $timeout, gameService, geneDefinitions, traitDefinitions) {
    var self = this;

    self.geneDefinitions = geneDefinitions;
    self.traitDefinitions = traitDefinitions;

    self.$onInit = function() {
        
        self.diggers = gameService.diggers;
        //self.diggerOffspring = [];
        //self.diggerAncestors = [];

        gameService.SubscribeBreedEvent($scope, function(event, offspring) {
            //$scope.$apply(function() { self.diggerOffspring = offspring; });
        });
        gameService.SubscribeNewGenerationEvent($scope, function(event, data) {
            $scope.$apply(function() {
                self.diggers = data.Diggers;
                //self.diggerAncestors = data.Ancestors;
            });
        });

        self.updateGene = function(diggerIndex, geneIndex, values) {
            self.diggers[diggerIndex].genes[geneIndex] = values;
        };


    };

}]);
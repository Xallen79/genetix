var app = angular.module('bloqhead.genetixApp');

app.component('bloqhead.components.testInterface', {
    templateUrl: 'components/testInterface/testInterface.html',
    controller: 'bloqhead.controllers.testInterface',
    controllerAs: 'ctrl'
});

app.directive('genomeEditor', ['geneDefinitions', function(geneDefinitions){

    var link = function(scope, element, attrs) {

    };

    var ctrl = function($scope, geneDefinitions) {
        var self = this;
        self.geneDefinitions = geneDefinitions;
    };




  return {
    restrict: 'E',
    scope: {
        genes: '='
    },
    link: link,
    controller: ['$scope', 'geneDefinitions', ctrl],
    controllerAs: 'ctrl',
    templateUrl: 'components/testInterface/genomeEditor.html'
  };

}]);



app.controller('bloqhead.controllers.testInterface', ['$scope', '$timeout', 'gameService', 'geneDefinitions', 'traitDefinitions', function($scope, $timeout, gameService, geneDefinitions, traitDefinitions) {
    var self = this;

    self.geneDefinitions = geneDefinitions;
    self.traitDefinitions = traitDefinitions;

    self.init = function() {
        
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


    };

    self.init();
}]);
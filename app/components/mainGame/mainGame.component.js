var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.mainGame', {
    templateUrl: 'components/mainGame/mainGame.html',
    controller: 'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});



game.controller('bloqhead.controllers.mainGame', ['$scope', '$timeout', 'gameService', function($scope, $timeout, gameService) {
    var self = this;
    self.init = function() {
        self.helloText = "Hello main game";
        self.diggers = gameService.diggers;
        self.diggerOffspring = [];
        self.diggerAncestors = [];

        gameService.SubscribeBreedEvent($scope, function(event, offspring) {
            $scope.$apply(function() { self.diggerOffspring = offspring; });
        });
        gameService.SubscribeNewGenerationEvent($scope, function(event, data) {
            $scope.$apply(function() {
                self.diggers = data.Diggers;
                self.diggerAncestors = data.Ancestors;
            });
        });


    };

    self.init();
}]);
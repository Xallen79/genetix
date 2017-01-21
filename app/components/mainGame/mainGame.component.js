var game = angular.module('bloqhead.genetixApp');
game.component('bloqhead.components.mainGame', {
    templateUrl: "/components/mainGame/mainGame.html",
    controller: 'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});

game.controller('bloqhead.controllers.mainGame', ['$scope', function($scope) {
    this.helloText = "Hello main game";
}]);
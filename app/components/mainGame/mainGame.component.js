var game = angular.module('bloqhead.genetixApp');
game.component('bloqhead.components.mainGame', {
    template: '<span ng-bind="ctrl.helloText"></span>',
    controller: function() { this.helloText = "hello main game"; }, //'bloqhead.controllers.mainGame',
    controllerAs: 'ctrl'
});

game.controller('bloqhead.controllers.mainGame', ['$scope', function($scope) {
    this.helloText = "Hello main game";
}]);
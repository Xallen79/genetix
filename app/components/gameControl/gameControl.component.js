var app = angular.module('bloqhead.genetixApp');

app.component('gameControl', {
    template: '<div><button type="button" class="btn btn-xs btn-danger" ng-click="$ctrl.toggleState();"><i class="fa" ng-class="$ctrl.getIcon()"></i></button></div>',
    controller: ['gameService', 'gameStates', function(gameService, gameStates) {
        var self = this;
        self.$onInit = function() {
            self.currentState = gameService.getState();            
        };
        self.toggleState = function() {
            self.currentState = (self.currentState === gameStates.RUNNING ? gameStates.PAUSED : gameStates.RUNNING);
            gameService.setState(self.currentState);
        };
        self.getIcon = function() {
            return self.currentState === gameStates.RUNNING ? 'fa-pause' : 'fa-play';
        };
    }]
});
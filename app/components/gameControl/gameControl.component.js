var app = angular.module('bloqhead.genetixApp');

app.component('bloqheadGameControl', {
    template: '<div>' +
        '<button title="Hard Reset" type="button" class="btn btn-xs btn-primary" ng-click="$ctrl.resetSave();"><i class="fa fa-recycle"></i></button>' +
        '<button title="Play/Pause" type="button" class="btn btn-xs btn-primary" ng-click="$ctrl.toggleState();"><i class="fa" ng-class="$ctrl.getIcon()"></i></button>' +
        '</div>',
    controller: ['$scope', 'gameService', 'gameLoopService', 'gameStates', function($scope, gameService, gameLoopService, gameStates) {
        var self = this;
        self.$onInit = function() {
            self.currentState = gameLoopService.getState().currentState;
        };
        self.toggleState = function() {
            self.currentState = (self.currentState === gameStates.RUNNING ? gameStates.PAUSED : gameStates.RUNNING);
            gameLoopService.setState(self.currentState);
        };
        self.getIcon = function() {
            return self.currentState === gameStates.RUNNING ? 'fa-pause' : 'fa-play';
        };
        self.resetSave = function() {
            gameService.hardReset();
        };
    }]
});
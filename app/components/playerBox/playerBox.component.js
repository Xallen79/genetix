var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadPlayerBox', {
    transclude: true,
    require: {
        mainCtrl: "^bloqhead.components.mainGame"
    },
    templateUrl: 'components/playerBox/playerBox.html',
    controller: 'bloqhead.controllers.playerBox',
    bindings: {
        title: '@',
        footer: '@'
    }
});


game.controller('bloqhead.controllers.playerBox', function() {
    var self = this;
    self.$onInit = function() {
        self.unit = self.mainCtrl.unit;
    };
});
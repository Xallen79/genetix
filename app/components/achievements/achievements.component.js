var game = angular.module('bloqhead.genetixApp');

game.component('bloqhead.components.achievementsUI', {
    templateUrl: 'components/achievements/achievements.html',
    controller: 'bloqhead.controllers.achievementsUI',
    bindings: {
        title: '@',
        footer: '@'
    }
});


game.controller('bloqhead.controllers.achievementsUI', function() {
    var self = this;
    self.$onInit = function() {

    };
});
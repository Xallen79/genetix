var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadPlayerBox', {
    transclude: {
        'boxTitleHtml': '?bloqheadPlayerBoxTitle'
    },
    require: {
        mainCtrl: "^bloqhead.components.home"
    },
    templateUrl: 'components/playerBox/playerBox.html',
    controller: 'bloqhead.controllers.playerBox',
    bindings: {
        boxTitle: '@',
        footer: '@',
        maxHeight: '@'
    }
});


game.controller('bloqhead.controllers.playerBox', function() {
    var self = this;
    self.$onInit = function() {
        self.unit = self.mainCtrl.unit;
    };
    self.maxHeightOveride = function() {
        var ret = {};
        if (typeof(self.maxHeight) != 'undefined') {
            ret.maxHeight = self.maxHeight;
        }
        return ret;
    };
});

game.component('bloqheadPlayerBoxTitle', {
    require: {
        playerBoxCtrl: "^bloqheadPlayerBox"
    },
});
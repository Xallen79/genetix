var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadLog', {
    templateUrl: 'components/log/log.html',
    controller: 'bloqhead.controllers.log'
});

game.constant('logTypes', {
    GENERAL: 1,
    BREED: 2,
    ACHIEVEMENT: 3
});



game.controller('bloqhead.controllers.log', ['$scope', 'logService', 'logTypes', function($scope, logService, logTypes) {
    var self = this;
    self.$onInit = function() {
        self.messages = [];
        logService.SubscribeNewMessageEvent($scope, self.receiveMessages);
    };

    self.getLogClass = function(type) {
        var prefix = 'list-group-item-';
        var a = '';
        switch (type) {
            case logTypes.GENERAL:
                a = 'color-general';
                break;
            case logTypes.ACHIEVEMENT:
                a = 'color-achievement';
                break;
            case logTypes.BREED:
                a = 'color-breed';
                break;
            default:
                a = prefix + 'none';
                break;
        }
        return a;
    };

    self.receiveMessages = function(event, messages) {
        self.messages = messages;
    };
}]);

game.service('logService', ['$rootScope', 'logTypes', function($rootScope, logTypes) {
    var self = this;
    self.init = function(clearLog) {
        if (clearLog) {
            self.messages = [];
            self.logGeneralMessage("Welcome to Genetix!");
        }
    };
    self.logGeneralMessage = function(message) {
        self.messages.push({ type: logTypes.GENERAL, timestamp: Date.now(), message: message });
        if (self.messages.length > 100)
            self.messages.splice(0, 1);
        $rootScope.$emit('newMessageEvent', self.messages);
    };
    self.logBreedMessage = function(message) {
        self.messages.push({ type: logTypes.BREED, timestamp: Date.now(), message: message });
        if (self.messages.length > 100)
            self.messages.splice(0, 1);
        $rootScope.$emit('newMessageEvent', self.messages);
    };
    self.logAchievementMessage = function(message) {
        self.messages.push({ type: logTypes.ACHIEVEMENT, timestamp: Date.now(), message: message });
        if (self.messages.length > 100)
            self.messages.splice(0, 1);
        $rootScope.$emit('newMessageEvent', self.messages);
    };

    self.SubscribeNewMessageEvent = function(scope, callback) {
        var handler = $rootScope.$on('newMessageEvent', callback.bind(this));
        scope.$on('$destroy', handler);
        $rootScope.$emit('newMessageEvent', self.messages);
    };

}]);
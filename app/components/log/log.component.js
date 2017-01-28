var app = angular.module('bloqhead.genetixApp');

app.component('bloqheadLog', {
    templateUrl: 'components/log/log.html',
    controller: 'bloqhead.controllers.log'
});

app.controller('bloqhead.controllers.log', ['$scope', 'logService', function($scope, logService) {
    var self = this;
    self.$onInit = function() {
        self.messages = [];
        logService.SubscribeNewMessageEvent($scope, self.receiveMessages);
    };

    self.receiveMessages = function(event, messages) {
        self.messages = messages;
    };
}]);

app.service('logService', ['$rootScope', function($rootScope) {
    var self = this;
    self.init = function() {
        self.messages = [];
        self.messages.push("Welcome to Genetix!");
    };
    self.logMessage = function(message) {
        self.messages.push(message);
        if (self.messages.length > 100)
            self.messages.splice(1, 1);
        $rootScope.$emit('newMessageEvent', self.messages);
    };

    self.SubscribeNewMessageEvent = function(scope, callback) {
        var handler = $rootScope.$on('newMessageEvent', callback.bind(this));
        scope.$on('$destroy', handler);
        $rootScope.$emit('newMessageEvent', self.messages);
    };

}]);
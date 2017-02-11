var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadWorkerList', {
    templateUrl: 'components/workerList/workerList.html',
    controller: 'bloqhead.controllers.workerList'
});


game.controller('bloqhead.controllers.workerList', [
    '$scope', 'workerService',
    function($scope, workerService) {
        var self = this;
        self.$onInit = function() {
            self.workers = [];
            workerService.SubscribeWorkersChangedEvent($scope, self.updateWorkers);
        };
        self.updateWorkers = function(event, workers) {
            self.workers = workers;
        };
    }
]);
var game = angular.module('bloqhead.genetixApp');

game.service('mapService', [
    '$rootScope', '$filter', 'hiveService', 'gameLoopService', 'logService',
    function($rootScope, $filter, hiveService, gameLoopService, logService) {
        var self = this;
        var state;




        self.init = function(loadState) {
            state = loadState || state || {};

            if (!angular.isDefined(state.currentHiveId))
                state.currentHiveId = hiveService.hives[0].id;

            self.hives = hiveService.hives;
            gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);

        };
        self.getState = function() {
            return state;
        };

        self.handleGameLoop = function(event, elapsedMs) {
            if (elapsedMs === 0) return;
        };


        self.selectHex = function(hexid) {
            var oldid = state.selectedHexID || null;
            state.selectedHexID = hexid;
            return oldid;
        }

    }
]);
var game = angular.module('bloqhead.genetixApp');

game.service('mapService', [
    '$rootScope', '$filter', 'hiveService', 'gameLoopService', 'logService',
    function($rootScope, $filter, hiveService, gameLoopService, logService) {
        var self = this;
        var state;




        self.init = function(loadState) {
            state = loadState || state || {};

            if (!angular.isDefined(loadState.currentHiveId))
                state.currentHiveID = hiveService.hives[0].id;
            if (!angular.isDefined(loadState.selectedHexID))
                state.selectedHexID = undefined;

            hiveService.SubscribePopulationUpdateEvent($rootScope, self.handleHiveUpdate);
            gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);
            self.sendMapUpdateEvent();

        };
        self.getState = function() {
            return state;
        };
        self.SubscribeMapUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('mapUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendMapUpdateEvent();
        };
        self.sendMapUpdateEvent = function() {
            var s = state;
            s.hives = [];
            for (var h = 0; h < self.hives.length; h++) {
                var hive = self.hives[h];
                s.hives.push({
                    id: hive.id,
                    pos: hive.pos
                });
            }
            $rootScope.$emit('mapUpdateEvent', s);
        };
        self.handleGameLoop = function(event, elapsedMs) {
            if (elapsedMs !== 0) { // do animations here
            }
            self.sendMapUpdateEvent(); //always send update so map will be rendered;
        };
        self.handleHiveUpdate = function(event, data) {
            self.hives = data;
            self.sendMapUpdateEvent();
        };

        self.selectHex = function(hexid) {
            var sendUpdate = false;
            var oldid = state.selectedHexID || null;
            state.selectedHexID = hexid;
            sendUpdate = hexid !== oldid;

            var hive = $filter('filter')(this.hives, { pos: hexid })[0];
            if (hive && hive.id != state.currentHiveID) {
                state.currentHiveID = hive.id;
                sendUpdate = true;
            }

            if (sendUpdate)
                self.sendMapUpdateEvent();

            return oldid;
        };

    }
]);
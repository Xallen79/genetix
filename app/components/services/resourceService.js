var game = angular.module('bloqhead.genetixApp');

game.constant('resourceTypes', {
    DIRT: 'dirt',
    WATER: 'water',
    WOOD: 'wood',
    GOLD: 'gold',
    BRICKS: 'bricks',
    HAPPINESS: 'happiness',
});



game.service('resourceService', [
    '$rootScope', '$filter', 'defaultState', 'logService', 'geneDefinitions', 'resourceTypes', 'achievementService',
    function($rootScope, $filter, defaultState, logService, geneDefinitions, resourceTypes, achievementService) {
        var self = this;

        self.init = function(state) {
            if (state) {
                self.state = state;
            } else {
                self.state = defaultState.resourceServiceState;
            }
        };
        self.getState = function() {
            return self.state;
        };

        self.getResource = function(resourceType) {
            return self.state.resouces[resourceType];
        };


        self.addResource = function(resourceType, amount) {
            var r = self.state.resources[resourceType];
            r[0] += amount;
            if (r[0] > r[1]) r[0] = r[1];
            if (r[0] < 0) r[0] = 0;
            switch (resourceType) {
                case resourceTypes.GOLD:
                    achievementService.updateProgress('A_GOLD', amount);
                    achievementService.updateProgress('A_GOLD_C', r[0]);
                    break;
            }
            $rootScope.$emit('resourceChangedEvent', resourceType, r[0]);
        };
        self.increaseResourceLimit = function(resourceType, amount) {
            var r = self.state.resources[resourceType];
            r[1] += amount;
            $rootScope.$emit('resourceLimitChangedEvent', resourceType, r[1]);
        };

        self.SubscribeResourceChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('resourceChangedEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };
        self.SubscribeResourceLimitChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('resourceLimitChangedEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };


    }
]);
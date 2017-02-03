var game = angular.module('bloqhead.genetixApp');

game.constant('resourceTypes', {
    DIRT: 'Dirt',
    WATER: 'Water',
    WOOD: 'Wood',
    GOLD: 'Gold',
    BRICKS: 'Bricks',
    HAPPINESS: 'Happiness',
});



game.service('resourceService', [
    '$rootScope', '$filter', 'defaultState', 'logService', 'geneDefinitions', 'resourceTypes', 'achievementService',
    function($rootScope, $filter, defaultState, logService, geneDefinitions, resourceTypes, achievementService) {
        var self = this;
        var initialized = false;

        self.init = function(state) {
            if (state) {
                self.state = state;
            } else {
                self.state = defaultState.resourceServiceState;
            }

            if (!initialized) {
                achievementService.SubscribeNewRewardEvent($rootScope, self.rewardEarned);
            }
            initialized = true;

            for (var resourceType in resourceTypes) {
                if (resourceTypes.hasOwnProperty(resourceType)) {
                    var r = self.state.resources[resourceType];
                    $rootScope.$emit('resourceChangedEvent', resourceType, r[0]);
                    $rootScope.$emit('resourceLimitChangedEvent', resourceType, r[1]);
                }
            }



        };
        self.getState = function() {
            return self.state;
        };

        self.rewardEarned = function(event, reward) {
            for (var p = 0; p < reward.perks.length; p++) {
                var perk = reward.perks[p];
                if (perk.pid === 'P_R_BONUS') {
                    self.addResource(perk.arr[1], perk.arr[2]);
                }
            }
        };

        self.getResourcesSnapshot = function() {
            return angular.copy(self.state.resources);
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
            if (scope) scope.$on('$destroy', handler);
        };
        self.SubscribeResourceLimitChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('resourceLimitChangedEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
        };


    }
]);
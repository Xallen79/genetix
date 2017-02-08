var game = angular.module('bloqhead.genetixApp');

game.service('resourceService', [
    '$rootScope', '$filter', 'logService', 'geneDefinitions', 'resourceTypes', 'achievementService',
    function($rootScope, $filter, logService, geneDefinitions, resourceTypes, achievementService) {
        var self = this;
        var initialized = false;

        self.init = function(state) {
            if (state !== null)
                self.state = state;

            if (!initialized) {
                achievementService.SubscribeNewRewardEvent($rootScope, self.rewardEarned);
            }
            initialized = true;

            // this will turn them all on for testing purposes
            var overrideAllOn = false;

            var defaultLimits = {
                DIRT: [0, 0, true || overrideAllOn],
                BRICKS: [0, 0, false || overrideAllOn],
                WATER: [0, 0, false || overrideAllOn],
                WOOD: [0, 0, false || overrideAllOn],
                GOLD: [0, 0, false || overrideAllOn],
                HAPPINESS: [0, -1, false || overrideAllOn],
                SCIENCE: [0, -1, false || overrideAllOn],
                STEEL: [0, 0, false || overrideAllOn],
                EVOCOIN: [0, -1, false || overrideAllOn]
            };

            for (var resourceType in resourceTypes) {
                if (resourceTypes.hasOwnProperty(resourceType)) {
                    var r = self.state.resources[resourceType];
                    if (typeof r == 'undefined') {
                        // if there is no default, instead of failing we are just going to add it with a max of 911 so that we are aware of the problem
                        r = defaultLimits[resourceType] || [0, 911, overrideAllOn];
                        self.state.resources[resourceType] = r;
                    }
                    $rootScope.$emit('resourceChangedEvent', resourceType, r[0]);
                    $rootScope.$emit('resourceLimitChangedEvent', resourceType, r[1]);
                    $rootScope.$emit('resourceEnabledEvent', resourceType, r[2]);
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
                    self.changeResource(perk.arr[1], perk.arr[2]);
                }
                if (perk.pid === 'P_M_HAPPINESS') {
                    self.state.resources.HAPPINESS[2] = true;
                    $rootScope.$emit('resourceEnabledEvent', 'HAPPINESS', true);
                }
            }
        };

        self.getResourcesSnapshot = function() {
            return angular.copy(self.state.resources);
        };

        self.getResource = function(resourceType) {
            return self.state.resources[resourceType][0];
        };

        self.changeResource = function(resourceType, amount) {
            var r = self.state.resources[resourceType];
            if (r[2] === false && r[1] !== -1) {
                console.error(resourceType + " is not enabled, cannot increase amount.");
                return;
            }

            r[0] += amount;
            if (r[1] != -1 && r[0] > r[1]) r[0] = r[1];
            if (r[0] < 0) r[0] = 0;

            if (amount > 0)
                achievementService.updateProgress('A_' + resourceType + '_E', amount); // earning achievement
            if (amount < 0)
                achievementService.updateProgress('A_' + resourceType + '_S', -amount); // spending achievement
            achievementService.updateProgress('A_' + resourceType + '_C', r[0]); // cumulative achievement

            if (r[2] === false) {
                $rootScope.$emit('resourceEnabledEvent', resourceType, true);
                r[2] = true;
            }

            $rootScope.$emit('resourceChangedEvent', resourceType, r[0], self.getResourcesSnapshot());
            return r[0];
        };
        self.setResourceLimit = function(resourceType, amount) {
            var r = self.state.resources[resourceType];
            if (r[1] === -1) {
                console.error("Cannot set resource limit on: " + resourceType);
                return;
            }
            r[1] = amount;
            if (r[2] === false && (amount > 0)) {
                r[2] = true;
                $rootScope.$emit('resourceEnabledEvent', resourceType, true);
            }
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
        self.SubscribeResourceEnabledEvent = function(scope, callback) {
            var handler = $rootScope.$on('resourceEnabledEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
        };


    }
]);
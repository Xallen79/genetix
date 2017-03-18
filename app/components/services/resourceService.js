var game = angular.module('bloqhead.genetixApp');

game.service('resourceService', [
    '$rootScope', '$filter', 'logService', 'resourceTypes', 'achievementService',
    function($rootScope, $filter, logService, resourceTypes, achievementService) {
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


            //[0] owned, [1] max, [2] enabled, [3] multiplier
            var defaultLimits = {
                NECTAR: [0, 0, true || overrideAllOn, 1.00],
                POLLEN: [0, 0, true || overrideAllOn, 1.00],
                WATER: [0, 0, true || overrideAllOn, 1.00],
                FOOD: [0, 0, true || overrideAllOn, 1.00],
                HONEY: [0, 0, true || overrideAllOn, 1.00],
                ROYAL_JELLY: [0, 0, true || overrideAllOn, 1.00],
                WAX: [0, 0, true || overrideAllOn, 1.00],
                DEADBEES: [0, 0, true || overrideAllOn, 1.00],
                DEFENSE: [0, -1, true || overrideAllOn, 1.00]
            };

            for (var resourceType in resourceTypes) {
                if (resourceTypes.hasOwnProperty(resourceType)) {
                    var r = self.state.resources[resourceType];
                    if (typeof r == 'undefined') {
                        // if there is no default, instead of failing we are just going to add it with a max of 911 so that we are aware of the problem
                        r = defaultLimits[resourceType] || [0, 911, overrideAllOn, 1];
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

        self.getWorkerIcon = function(res) {
            var ret = {};
            ret['fa-tint'] = (res === 'NECTAR');
            ret['icon-water'] = (res === 'WATER');
            ret['icon-tombstone'] = (res === 'DEADBEES');
            ret['icon-pollen'] = (res === 'POLLEN');
            ret['icon-honeypot'] = (res === 'HONEY');
            ret['icon-tools'] = (res === 'WAX');
            ret['fa-apple'] = (res === 'FOOD');
            ret['icon-jar'] = (res === 'ROYAL_JELLY');
            ret['icon-shield'] = (res === 'DEFENSE');
            return ret;
        };

        self.rewardEarned = function(event, reward) {
            for (var p = 0; p < reward.perks.length; p++) {
                var perk = reward.perks[p];
                if (perk.pid === 'P_R_BONUS') {
                    self.changeResource(perk.arr[1], perk.arr[2]);
                }
                if (perk.pid === 'P_R_UNLOCK') {
                    self.state.resources[perk.arr[1]][2] = true;
                    $rootScope.$emit('resourceEnabledEvent', perk.arr[1], true);
                }
                if (perk.pid === 'P_R_MULTIPLIER') {
                    self.addResourceMultiplier(perk.arr[1], perk.arr[2]);
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
            var actualAmount = amount;
            if (r[1] != -1 && r[0] > r[1]) {
                actualAmount = amount - (r[0] - r[1]);
                r[0] = r[1];
            }
            // if this puts us negative, we cannot deduct the amount, reset and return -1 to indicate failure.
            if (r[0] < 0) {
                r[0] -= amount;
                return -1;
            }

            if (actualAmount > 0)
                achievementService.updateProgress('A_' + resourceType + '_E', actualAmount); // earning achievement

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
        self.addResourceMultiplier = function(resourceType, amount) {
            self.state.resources[resourceType][3] += (amount / 100.0);
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
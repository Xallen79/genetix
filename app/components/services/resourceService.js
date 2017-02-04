var game = angular.module('bloqhead.genetixApp');

game.constant('resourceTypes', {
    DIRT: {
        name: 'Dirt',
        desc: 'Used in construction and mining.',
        attr: 'STR'
    },

    WATER: {
        name: 'Water',
        desc: 'Used in construction, mining and population expansion.',
        attr: 'END'
    },
    WOOD: {
        name: 'Wood',
        desc: 'Used in construction and mining.',
        attr: 'END'
    },
    GOLD: {
        name: 'Gold',
        desc: 'Used for purchasing gene research technologies.',
        attr: 'INT'
    },
    BRICKS: {
        name: 'Bricks',
        desc: 'Used in construction and smelting.',
        attr: 'STR'
    },
    STEEL: {
        name: 'Steel',
        desc: 'Used in advanced construction.',
        attr: 'STR'
    },
    SCIENCE: {
        name: 'Science',
        desc: 'Used in genetic modification and advanced construction.',
        attr: 'INT'
    },
    HAPPINESS: {
        name: 'Happiness',
        desc: 'Good things happen to those that are happy...',
        attr: 'CHR'
    }
});

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

            var defaultLimits = {
                DIRT: [0, 25000, true],
                BRICKS: [0, 25000, false],
                WATER: [0, 1000, false],
                WOOD: [0, 1000, false],
                GOLD: [0, 1000, false],
                HAPPINESS: [0, 10, false],
                SCIENCE: [0, 1000, false],
                STEEL: [0, 10000, false]
            };

            for (var resourceType in resourceTypes) {
                if (resourceTypes.hasOwnProperty(resourceType)) {
                    var r = self.state.resources[resourceType];
                    if (typeof r == 'undefined') {
                        r = defaultLimits[resourceType] || [0, 911, false];
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
                    self.addResource(perk.arr[1], perk.arr[2]);
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

        self.addResource = function(resourceType, amount) {
            var r = self.state.resources[resourceType];
            r[0] += amount;
            if (r[0] > r[1]) r[0] = r[1];
            if (r[0] < 0) r[0] = 0;
            achievementService.updateProgress('A_' + resourceType, amount);
            achievementService.updateProgress('A_' + resourceType + '_C', r[0]);

            if (r[2] === false) {
                $rootScope.$emit('resourceEnabledEvent', resourceType, true);
                r[2] = true;
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
        self.SubscribeResourceEnabledEvent = function(scope, callback) {
            var handler = $rootScope.$on('resourceEnabledEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
        };


    }
]);
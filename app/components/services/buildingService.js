var game = angular.module('bloqhead.genetixApp');

game.service('buildingService', [
    '$rootScope', '$filter', 'defaultBuildings', 'resourceTypes', 'resourceService', 'hiveService', 'achievementService',
    function($rootScope, $filter, defaultBuildings, resourceTypes, resourceService, hiveService, achievementService) {
        /* private members */
        var self = this;
        var state;
        var lastSnapshot;
        var initialized = false;
        self.init = function(loadState) {
            loadState.buildings = angular.merge({}, defaultBuildings, loadState.buildings);
            state = angular.merge({}, state, loadState);
            self.update('all');
            resourceService.SubscribeResourceChangedEvent($rootScope, handleResourceChange);
            if (!initialized) {
                achievementService.SubscribeNewRewardEvent($rootScope, self.rewardEarned);
            }
            initialized = true;
        };

        self.getState = function() {
            var saveState = {
                buildings: {}
            };
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    saveState.buildings[key] = {
                        purchased: building.purchased,
                        gifted: building.gifted,
                        unlocked: building.unlocked,
                        multiplier: building.multiplier
                    };
                }
            }
            return saveState;
        };


        self.getBuildingSnapshot = function() {
            var snapshot = [];
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.unlocked) {
                        var nextCost = calculateNextCost(building);
                        var size = getSize(building);
                        snapshot.push({
                            type: key,
                            name: building.name,
                            description: formatDescription(building, { size: size }),
                            size: size,
                            owned: building.purchased + building.gifted,
                            costToBuild: nextCost,
                            canBuild: canBuild(building, nextCost)

                        });
                    }
                }
            }
            if (!angular.equals(lastSnapshot, snapshot)) {
                $rootScope.$emit('buildingsChangedEvent', angular.copy(snapshot));
            }
            lastSnapshot = snapshot;
            return angular.copy(snapshot);
        };
        self.update = function(use) {
            if (!angular.isDefined(use) || use === 'all') {
                self.updateStorage();
                self.updateBreeders();
                self.updateHousing();
                self.updateNursery();
            } else if (use === 'storage') {
                self.updateStorage();
            } else if (use === 'housing') {
                self.updateHousing();
            } else if (use === 'breeding') {
                self.updateBreeders();
            } else if (use === 'newborn') {
                self.updateNursery();
            } else if (use === 'production') {
                angular.noop();
            }
            self.getBuildingSnapshot();
        };
        self.updateBreeders = function() {
            var max = 0;
            var typeMult = state.breedingSizeMultiplier || 1;
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.use === 'breeding') {
                        max += Math.floor(building.size * (building.purchased + building.gifted) * building.multiplier);
                    }
                }
            }
            max *= typeMult;
            hiveService.setBreederLimit(Math.floor(max));
        };
        self.updateNursery = function() {
            var max = 0;
            var typeMult = state.newbornSizeMultiplier || 1;
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.use === 'newborn') {
                        max += Math.floor(building.size * (building.purchased + building.gifted) * building.multiplier);
                    }
                }
            }
            max *= typeMult;
            hiveService.setNurseryLimit(Math.floor(max));
        };

        self.updateStorage = function() {
            var typeMult = state.storageSizeMultiplier || 1;
            var resources = resourceService.getResourcesSnapshot();
            var rt = [];
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.use === 'storage') {
                        rt.push(building.stores);
                        resources[building.stores].newAmount = resources[building.stores].newAmount || 0;
                        resources[building.stores].newAmount += Math.floor(building.size * (building.purchased + building.gifted) * building.multiplier);
                    }
                }

            }
            rt.filter(function(t) {
                resources[t].newAmount = Math.floor(resources[t].newAmount * typeMult);
                if (resources[t][1] != resources[t].newAmount)
                    resourceService.setResourceLimit(t, resources[t].newAmount);
            });
        };

        self.updateHousing = function() {
            var typeMult = state.housingSizeMultiplier || 1;
            var max = 0;
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.use === 'housing') {
                        max += Math.floor(building.size * (building.gifted + building.purchased) * building.multiplier);
                    }
                }
            }
            hiveService.setPopulationLimit(Math.floor(max * typeMult));
        };

        self.build = function(type) {
            var built = true;
            var spent = [];
            var building = state.buildings[type];
            var nextCost = calculateNextCost(building);
            if (canBuild(building, nextCost)) {
                for (var c = 0; c < nextCost.length; c++) {
                    var ret = resourceService.changeResource(nextCost[c].resourceType, -1 * nextCost[c].amount);
                    if (ret === -1) {
                        built = false;
                        break;
                    } else {
                        spent.push({
                            resource: nextCost[c].resourceType,
                            amount: nextCost[c].amount
                        });
                    }
                }

            }
            if (built) {
                state.buildings[type].purchased++;
                self.update(building.use);
                achievementService.updateProgress('A_' + type + '_B', 1);
            } else {
                for (var s = 0; s < spent.length; s++) {
                    resourceService.changeResource(spent[s].resourceType, nextCost[s].amount);
                }
            }
        };

        self.rewardEarned = function(event, reward) {

            for (var p = 0; p < reward.perks.length; p++) {
                var perk = reward.perks[p];
                var building = state.buildings[perk.arr[1]];
                if (perk.pid === 'P_B_BONUS') {
                    building.gifted += perk.arr[2];
                    self.update(building.use);
                }
                if (perk.pid === 'P_B_UNLOCK') {
                    building.unlocked = 1;
                    self.update(building.use);
                }
                if (perk.pid === "P_B_MULTIPLIER") {
                    building.multiplier += perk.arr[2] / 100.0;
                    self.update(building.use);
                }
            }
        };


        self.SubscribeBuildingsChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('buildingsChangedEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
            $rootScope.$emit('buildingsChangedEvent', self.getBuildingSnapshot());
        };

        /* Private functions */
        var formatDescription = function(building, format) {
            var description = building.description;
            description = $filter('fmt')(description, format);

            return description;
        };

        var getSize = function(building) {
            var size = building.size * (building.multiplier || 1);
            if (building.use === 'breeding') size *= (state.breedingSizeMultiplier || 1);
            if (building.use === 'storage') size *= (state.storageSizeMultiplier || 1);
            if (building.use === 'housing') size *= (state.housingSizeMultiplier || 1);
            return size;
        };

        var calculateNextCost = function(building) {
            var costs = [];
            for (var i = 0; i < building.baseCost.length; i++) {
                var cost = building.baseCost[i];
                var nextAmount = Math.floor(cost.amount * Math.pow(cost.costMultiplier, building.purchased));
                costs.push({ resource: resourceTypes[cost.resource].name, resourceType: cost.resource, amount: nextAmount });
            }
            return costs;
        };
        var canBuild = function(building, nextCost) {
            if (!angular.isDefined(nextCost)) {
                nextCost = calculateNextCost(building);
            }
            var resources = resourceService.getResourcesSnapshot();
            for (var c = 0; c < nextCost.length; c++) {
                var r = resources[nextCost[c].resourceType];
                if (!angular.isDefined(r) || r[0] < nextCost[c].amount) {
                    return false;
                }
            }
            return true;
        };
        var handleResourceChange = function(event, resourceType, amount) {
            self.getBuildingSnapshot();
        };

    }
]);
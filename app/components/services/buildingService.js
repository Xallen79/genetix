var game = angular.module('bloqhead.genetixApp');

game.service('buildingService', [
    '$rootScope', 'defaultBuildings', 'resourceTypes', 'resourceService', 'populationService',
    function($rootScope, defaultBuildings, resourceTypes, resourceService, populationService) {
        /* private members */
        var self = this;
        var state;
        var lastSnapshot;
        self.init = function(loadState) {
            state = angular.merge({}, state, loadState);
            state.buildings = angular.merge({}, defaultBuildings, state.buildings);
            self.updateStorage();
            self.updateBreeders();
            self.updateHousing();
            resourceService.SubscribeResourceChangedEvent($rootScope, handleResourceChange);
            self.getBuildingSnapshot();
        };

        self.getState = function() {
            return state;
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
                            name: building.name,
                            description: formatDescription(building, size),
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

        self.updateBreeders = function() {
            var max = 0;
            var typeMult = state.breedingSizeMultiplier || 1;
            for (var key in state.buildings) {
                if (state.buildings.hasOwnProperty(key)) {
                    var building = state.buildings[key];
                    if (building.use === 'breeding') {
                        var multiplier = building.sizeMultiplier || 1;
                        max += Math.floor(building.size * multiplier);
                    }
                }
            }
            max *= typeMult;
            populationService.setBreederLimit(Math.floor(max));
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
                        var multiplier = building.multiplier || 1;
                        resources[building.stores].newAmount = resources[building.stores].newAmount || 0;
                        resources[building.stores].newAmount += Math.floor((building.size * multiplier));
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
                        var multiplier = building.multiplier || 1;
                        max += Math.floor(building.size * multiplier);
                    }
                }
            }
            populationService.setPopulationLimit(Math.floor(max * typeMult));
        };

        self.SubscribeBuildingsChangedEvent = function(scope, callback) {
            var handler = $rootScope.$on('buildingsChangedEvent', callback.bind(this));
            if (scope) scope.$on('$destroy', handler);
            $rootScope.$emit('buildingsChangedEvent', self.getBuildingSnapshot());
        };

        /* Private functions */
        var formatDescription = function(building, size) {
            var description = building.description;
            if (description.indexOf('{size}') !== -1) {
                description = description.replace(/{size}/g, size);
            }

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
                var nextAmount = cost.amount * Math.pow(cost.costMultiplier, building.purchased);
                costs.push({ resource: resourceTypes[cost.resource].name, resourceType: cost.resource, amount: nextAmount });
            }
            return costs;
        };
        var canBuild = function(building, nextCost) {
            var resources = resourceService.getResourcesSnapshot();
            for (var c = 0; c < nextCost.length; c++) {
                var r = resources[nextCost[c].resourceType];
                if (r[0] < nextCost[c].amount) {
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
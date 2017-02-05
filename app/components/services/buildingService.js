var game = angular.module('bloqhead.genetixApp');

game.constant('defaultBuildings', {
    BUNGALOW: {
        name: 'Breeding Bungalow',
        description: 'A private bungalow where the magic happens.',
        use: 'breeding',
        size: 2,
        baseCost: [{
            resource: 'DIRT',
            amount: 25,
            costMultiplier: 1.05
        }],
        purchased: 0,
        gifted: 1,
        unlocked: 1

    },
    DIRTPILE: {
        name: 'Dirt pile',
        description: 'Where else would you store dirt?',
        use: 'storage',
        stores: 'DIRT',
        size: 25,
        baseCost: [{
            resource: 'DIRT',
            amount: 10,
            costMultiplier: 1.25
        }],
        purchased: 0,
        gifted: 1,
        unlocked: 1
    },
    SODHOUSE: {
        name: 'Sod house',
        description: 'Provides minimal shelter for {size} things.',
        use: 'housing',
        size: 5,
        baseCost: [{
            resource: 'DIRT',
            amount: 5,
            costMultiplier: 1.05
        }, {
            resource: 'WATER',
            amount: 5,
            costMultiplier: 1.05
        }],
        purchased: 0,
        gifted: 1,
        unlocked: 1
    },
    WELL: {
        name: 'Well',
        description: 'Used for water production.',
        use: 'production',
        produces: 'WATER',
        size: 5,
        baseCost: [{
            resource: 'BRICKS',
            amount: 100,
            costMultiplier: 1.05
        }],
        purchased: 0,
        gifted: 0,
        unlocked: 0
    }
});

// game.factory('Building', ['buildingTypes', function(buildingTypes) {
//     var Building = function(state) {
//         this.update(state);
//     };
//     Building.prototype.update = function(state) {
//         this.buildingType = state.buildingType || this.buildingType;
//     };
//     return Building;
// }]);


game.service('buildingService', [
    '$rootScope', 'defaultBuildings', 'resourceTypes', 'resourceService', 'populationService',
    function($rootScope, defaultBuildings, resourceTypes, resourceService, populationService) {
        var self = this;
        self.init = function(state) {
            self.state = state || {};
            self.state.buildings = angular.merge({}, defaultBuildings, state.buildings);
            self.updateStorage();
            self.updateBreeders();
            self.updateHousing();
        };
        self.getState = function() {
            return self.state;
        };
        self.getBuildingSnapshot = function() {
            var snapshot = [];
            for (var key in self.state.buildings) {
                if (self.state.buildings.hasOwnProperty(key)) {
                    var building = self.state.buildings[key];
                    if (building.unlocked || 0 === 1) {
                        snapshot.push({
                            name: building.name,
                            description: self.formatDescription(building),
                            owned: building.purchased + building.gifted,
                            costToBuild: self.calculateNextCost(building)

                        });
                    }
                }
            }
            return snapshot;
        };
        self.formatDescription = function(building) {
            var description = building.description;
            if (description.indexOf('{size}') !== -1) {
                var size = building.size * (building.multiplier || 1);
                if (building.use === 'breeding') size *= (self.state.breedingSizeMultiplier || 1);
                if (building.use === 'storage') size *= (self.state.storageSizeMultiplier || 1);
                if (building.use === 'housing') size *= (self.state.housingSizeMultiplier || 1);
                description = description.replace(/{size}/g, size);
            }

            return description;
        };
        self.calculateNextCost = function(building) {
            var costs = [];
            for (var i = 0; i < building.baseCost.length; i++) {
                var cost = building.baseCost[i];
                var nextAmount = cost.amount * Math.pow(cost.costMultiplier, building.purchased);
                costs.push({ resource: resourceTypes[cost.resource].name, amount: nextAmount });
            }
            return costs;
        };

        self.updateBreeders = function() {
            var max = 0;
            var typeMult = self.state.breedingSizeMultiplier || 1;
            for (var key in self.state.buildings) {
                if (self.state.buildings.hasOwnProperty(key)) {
                    var building = self.state.buildings[key];
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
            var typeMult = self.state.storageSizeMultiplier || 1;
            var resources = resourceService.getResourcesSnapshot();
            var rt = [];
            for (var key in self.state.buildings) {
                if (self.state.buildings.hasOwnProperty(key)) {
                    var building = self.state.buildings[key];
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
            var typeMult = self.state.housingSizeMultiplier || 1;
            var max = 0;
            for (var key in self.state.buildings) {
                if (self.state.buildings.hasOwnProperty(key)) {
                    var building = self.state.buildings[key];
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
    }
]);
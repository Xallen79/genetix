/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.factory('MapResource', [
    '$filter', 'logService',
    function($filter, logService) {
        /* constructor */
        var MapResource = function(config) {
            this.update(config);
        };
        /* public functions */
        MapResource.prototype.update = function(config) {
            if (typeof(config) == 'undefined') config = {};
            this.id = config.id || this.id || 0;
            this.level = config.level || this.level || 1;
            this.pos = config.pos || this.pos || 'A1';
            this.dt = config.dt || this.dt || new Date().getTime();
            this.color = config.color || this.color || 'green';
            this.image = config.image || this.image || 'bee.svg'; // this default is temporary
            this.cooldown = config.cooldown || this.cooldown || 5000; // in milliseconds
            this.cooldownRemaining = config.cooldownRemaining || this.cooldownRemaining || 0; // in milliseconds
            this.pollen = config.pollen || this.pollen || 0;
            this.col_pollen = config.col_pollen || this.col_pollen || 0;
            this.nectar = config.nectar || this.nectar || 0;
            this.col_nectar = config.col_nectar || this.col_nectar || 0;
            this.water = config.water || this.water || 0;
            this.col_water = config.col_water || this.col_water || 0;

            this.harvestMultiplier = config.harvestMultiplier || this.harvestMultiplier || 1.0;
            this.beeIsHarvesting = config.beeIsHarvesting || this.beeIsHarvesting || false;
            this.resourceName = config.resourceName || this.resourceName || '??';

            this.bees = this.bees || [];
            this.name = this.resourceName + " #" + this.id;
        };
        MapResource.prototype.getState = function() {
            var state = {
                id: this.id,
                level: this.level,
                pos: this.pos,
                dt: this.dt,
                color: this.color,
                image: this.image,
                cooldown: this.cooldown,
                cooldownRemaining: this.cooldownRemaining,
                pollen: this.pollen,
                nectar: this.nectar,
                water: this.water,
                harvestMultiplier: this.harvestMultiplier,
                beeIsHarvesting: this.beeIsHarvesting,
                resourceName: this.resourceName,
                beeids: []
            };

            for (var i = 0; i < this.bees; i++) {
                state.beeids.push(this.bees[i].id);
            }

            return state;
        };

        // occurs when a bee first lands on a resource
        MapResource.prototype.QueueHarvest = function(bee) {
            logService.logWorkMessage(bee.name + ' reached ' + this.name);
            bee.waitingAtResource = true;
            // add the bee to the collection queue
            this.bees.push(bee);
        };

        // this is called by the mapService in the gameloop
        MapResource.prototype.ProcessElapsedTime = function(ms) {
            // decrement cooldown if its above 0
            if (this.cooldownRemaining > 0) {
                this.cooldownRemaining -= ms;
            }
            // if the cooldown has elapsed and there is a bee waiting and no bees are currently harvesting
            if (this.cooldownRemaining <= 0 && this.bees.length > 0 && this.beeIsHarvesting === false) {
                this.beeIsHarvesting = true;
                var bee = this.bees.shift();
                bee.waitingAtResource = false;
                bee.harvesting = true;
            }
        };

        // occurs after a bee is done harvesting (duh)
        MapResource.prototype.DoneHarvesting = function() {
            this.cooldownRemaining = this.cooldown;
            this.beeIsHarvesting = false;
            this.col_nectar = 0;
            this.col_pollen = 0;
            this.col_water = 0;
        };
        MapResource.prototype.GetAvailable = function(rid) {
            var avail = 0;
            switch (rid) {
                case "NECTAR":
                    avail = this.nectar - this.col_nectar;
                    break;
                case "POLLEN":
                    avail = this.pollen - this.col_pollen;
                    break;
                case "WATER":
                    avail = this.water - this.col_water;
                    break;
            }
            return avail;
        };
        MapResource.prototype.Collect = function(rid, amount) {
            var harvestAmount = 0;
            var avail = 0;
            switch (rid) {
                case "NECTAR":
                    avail = this.GetAvailable(rid);
                    if (amount <= avail)
                        harvestAmount = amount;
                    else if (avail > 0)
                        harvestAmount = avail;
                    this.col_nectar += harvestAmount;

                    break;
                case "POLLEN":
                    avail = this.GetAvailable(rid);
                    if (amount <= avail)
                        harvestAmount = amount;
                    else if (avail > 0)
                        harvestAmount = avail;
                    this.col_pollen += harvestAmount;
                    break;
                case "WATER":
                    avail = this.GetAvailable(rid);
                    if (amount <= avail)
                        harvestAmount = amount;
                    else if (avail > 0)
                        harvestAmount = avail;
                    this.col_water += harvestAmount;
                    break;
            }
            return harvestAmount;
        };

        return MapResource;

    }
]);
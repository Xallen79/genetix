/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.factory('MapResource', [
    '$filter', 'resourceTypes', 'gameLoopService',
    function($filter, resourceTypes, gameLoopService) {
        /* constructor */
        var MapResource = function(config) {
            this.update(config);
        };
        /* public functions */
        MapResource.prototype.update = function(config) {
            if (typeof(config) == 'undefined') config = {};
            this.id = config.id || this.id || 0;
            this.pos = config.pos || this.pos || 'A1';
            this.dt = config.dt || this.dt || new Date().getTime();
            this.hexcolor = config.hexcolor || this.hexcolor || 'green';
            this.image = config.image || this.image || 'bee.svg'; // this default is temporary
            this.cooldown = config.cooldown || this.cooldown || 5000; // in milliseconds
            this.cooldownRemaining = config.cooldownRemaining || this.cooldownRemaining || 0; // in milliseconds
            this.pollen = config.pollen || this.pollen || 0;
            this.nectar = config.nectar || this.nectar || 0;
            this.water = config.water || this.water || 0;
            this.bees = this.bees || [];
            this.name = this.resourcetype + "#" + this.id;
        };
        MapResource.prototype.getState = function() {
            var state = {
                id: this.id,
                pos: this.pos,
                dt: this.dt,
                hexcolor: this.hexcolor,
                image: this.image,
                cooldown: this.cooldown,
                pollen: this.pollen,
                nectar: this.nectar,
                water: this.water,
                name: this.name,
                bees: []
            };

            for (var i = 0; i < this.bees; i++) {
                state.bees.push({
                    id: this.bees[i].id
                });
            }

            return state;
        };

        // occurs when a bee first lands on a resource
        MapResource.prototype.QueueHarvest = function(bee) {
            // make sure bee can harvest any of these resources, if not, log message and move on to next destination.
            // this should already be prevented in the UI, but just in case...

            // make sure bee has available storage, if not, log message and return to hive.

            // add the bee to the collection queue
            this.bees.push(bee);
        };

        // this is called by the mapService in the gameloop
        MapResource.prototype.ProcessElapsedTime = function(ms) {
            this.cooldownRemaining -= ms;
            if (this.cooldownRemaining <= 0) {
                this.cooldownRemaining = this.cooldown;
                var bee = this.bees.shift();
                bee.Harvest(this);
            }
        };

    }
]);
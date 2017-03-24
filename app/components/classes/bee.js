/* global angular */
/* global randomIntFromInterval */
var game = angular.module('bloqhead.genetixApp');

game.filter('hasTrait', function() {
    return function(units, traitName) {
        var ret = [];
        for (var i = 0; i < units.length; i++)
            if (units[i].hasTrait(traitName))
                ret.push(units[i]);
        return ret;
    };
});

game.factory('Bee', [
    '$filter', 'TraitInspector', 'Genome', 'jobTypes', 'resourceTypes',
    function($filter, TraitInspector, Genome, jobTypes, resourceTypes) {
        /* constructor */
        var Bee = function(config) {
            this.traitInspector = new TraitInspector();
            this.update(config);
        };
        /* public functions */
        Bee.prototype.update = function(config) {
            if (typeof(config) == 'undefined') config = {};
            this.id = config.id || this.id || 0;
            this.pos = config.pos || this.pos || { x: 0, y: 0 };
            this.dt = config.dt || this.dt || new Date().getTime();
            this.queenParentId = config.queenParentId || this.queenParentId || null;
            this.droneParentId = config.droneParentId || this.droneParentId || null;
            this.generation = config.generation || this.generation || 0;
            this.jid = config.currentJob || config.jid || this.jid || 'IDLE';
            this.msSinceWork = config.msSinceWork || this.msSinceWork || 0;
            this.onStrike = config.onStrike || this.onStrike || false;
            this.earnings = config.earnings || this.earnings || angular.copy(zeroEarnings);
            this.beeMutationChance = config.beeMutationChance || this.beeMutationChance || 0.005;
            this.genome = new Genome(config.genomeState || this.genomeState || { mutationChance: this.beeMutationChance });
            this.genomeState = this.genome.getState();
            this.dead = config.dead || this.dead || false;

            this.traits = this.traitInspector.getTraits(this.genome);
            this.abilities = this.traitInspector.getAbilities(this.traits);
            this.name = this.beetype + "#" + this.id;
            //this.name = (this.name && this.name !== 'Unknown Gender') ? this.name : config.name || this.getRandomName();
        };

        Bee.prototype.getState = function() {
            return {
                id: this.id,
                dt: this.dt,
                queenParentId: this.queenParentId,
                droneParentId: this.droneParentId,
                generation: this.generation,
                jid: this.jid,
                msSinceWork: this.msSinceWork,
                onStrike: this.onStrike,
                earnings: this.earnings,
                beeMutationChance: this.beeMutationChance,
                genomeState: this.genomeState
            };
        };

        Bee.prototype.getTraits = function() {
            return this.traits;
        };
        Bee.prototype.hasTrait = function(trait) {
            var result = this.traits.filter(function(myTrait) {
                return myTrait.name === trait;
            }).length;
            return result > 0;
        };
        Bee.prototype.getAbility = function(abilityId) {
            return this.abilities[abilityId];
        };

        Bee.prototype.die = function() {
            console.log(this.name + " died.");
            this.dead = true;
        };
        Bee.prototype.mature = function(type) {
            console.error(this.beetype + ' cannot mature. type: ' + type);
        };
        Bee.prototype.hatch = function(type) {
            console.error(this.beetype + ' cannot hatch. type: ' + type);
        };
        Bee.prototype.doWork = function(ms, hive) {
            // every bee consumes food before working?
            return null;
        };
        /* private members */
        var zeroEarnings = {};
        for (var key in resourceTypes) {
            zeroEarnings[key] = {
                rid: key,
                amount: 0
            };
        }

        var types = {
            QUEEN: 'queen',
            DRONE: 'drone',
            WORKER: 'worker',
            EGG: 'egg',
            LARVA: 'larva'
        };
        /* private functions */

        /* Bee types */

        //
        // Queen
        //

        var Queen = function(config) {
            this.config = config;
            this.beetype = types.QUEEN;
            this.minDrones = 10;
            Bee.call(this, config);
        };
        Queen.prototype = Object.create(Bee.prototype);

        Queen.prototype.update = function(config) {
            config = config || {};
            Bee.prototype.update.apply(this, [config]);
            this.droneGenomeStates = config.droneGenomeStates || this.droneGenomeStates || [];
            this.droneIds = config.droneIds || this.droneIds || [];
        };

        Queen.prototype.getState = function() {
            var state = Bee.prototype.getState.apply(this);
            state.droneGenomeStates = this.droneGenomeStates;
            state.droneIds = this.droneIds;
            return state;
        };

        Queen.prototype.mate = function(drone) {
            if (drone.beetype !== types.DRONE) {
                console.log("Queen cannot mate with: " + drone.beetype);
                return;
            }
            this.droneGenomeStates.push(drone.genome.getState());
            this.droneIds.push(drone.id);
            drone.die();
        };
        Queen.prototype.canLayEggs = function(hive) {
            var ready = this.droneGenomeStates.length >= this.minDrones;
            ready &= hive.getNurseryCount() < hive.getNurseryLimit();
            return ready;

        };

        Queen.prototype.layEgg = function(newId) {
            var eggGenome = this.genome.getEggGenome();
            var egg = new Egg({
                id: newId,
                dt: new Date().getTime(),
                generation: this.generation + 1,
                genomeState: eggGenome.getState(),
                queenParentId: this.id,
                beeMutationChance: this.beeMutationChance

            });
            egg.update();
            return egg;
        };

        Queen.prototype.doWork = function(ms, hive) {
            if (this.jid !== jobTypes.IDLE.jid) {
                Bee.prototype.doWork.apply(this, [ms, hive]);
                //var jobType = jobTypes[this.jid];
                var eggRate = this.getAbility("PRD_EGG").value; //TODO actions and abilities should be derived from jobType
                this.msSinceWork += ms;
                while (this.msSinceWork >= eggRate) {
                    if (this.canLayEggs(hive)) {
                        var egg = this.layEgg(hive.getNextId());
                        hive.bees.push(egg);
                    }
                    this.msSinceWork -= eggRate;
                }
            }
        };

        Queen.prototype.fertilizeEgg = function(egg, newId) {
            var d = randomIntFromInterval(0, this.droneGenomeStates.length - 1);
            var droneGenomeState = this.droneGenomeStates[d];
            var newGenome = egg.genome.fertilize(droneGenomeState);

            var child = new Larva({
                id: newId,
                dt: new Date().getTime(),
                generation: this.generation + 1,
                genomeState: newGenome.getState(),
                queenParentId: this.id,
                droneParentId: this.droneIds[d],
                beeMutationChance: this.beeMutationChance

            });
            return child;
        };

        //
        // Worker
        // 


        var Worker = function(config) {
            this.beetype = types.WORKER;
            Bee.call(this, config);
        };
        Worker.prototype = Object.create(Bee.prototype);

        Worker.prototype.update = function(config) {
            config = config || {};
            Bee.prototype.update.apply(this, [config]);

        };
        Worker.prototype.getState = function() {
            var state = Bee.prototype.getState.apply(this);

            return state;
        };


        //
        // DRONE
        //


        var Drone = function(config) {
            this.beetype = types.DRONE;
            Bee.call(this, config);
        };
        Drone.prototype = Object.create(Bee.prototype);
        Drone.prototype.update = function(config) {
            config = config || {};
            Bee.prototype.update.apply(this, [config]);
        };
        Drone.prototype.getState = function() {
            var state = Bee.prototype.getState.apply(this);

            return state;
        };

        //
        // Egg
        // 

        var Egg = function(config) {
            this.beetype = types.EGG;
            Bee.call(this, config);
        };
        Egg.prototype = Object.create(Bee.prototype);
        Egg.prototype.update = function(config) {
            config = config || {};
            Bee.prototype.update.apply(this, [config]);
        };
        Egg.prototype.getState = function() {
            var state = Bee.prototype.getState.apply(this);

            return state;
        };

        Egg.prototype.hatch = function(type) {
            if (type === types.DRONE) {
                return new Drone({
                    id: this.id,
                    genomeState: this.genome.getState(),
                    generation: this.generation,
                    jid: jobTypes.IDLE.jid,
                    beeMutationChance: this.beeMutationChance
                });
            }
        };

        //
        // Larva
        //

        var Larva = function(config) {
            this.beetype = types.LARVA;
            Bee.call(this, config);
        };
        Larva.prototype = Object.create(Bee.prototype);
        Larva.prototype.update = function(config) {
            config = config || {};
            Bee.prototype.update.apply(this, [config]);
        };
        Larva.prototype.getState = function() {
            var state = Bee.prototype.getState.apply(this);

            return state;
        };


        Larva.prototype.mature = function(type) {
            if (type === types.WORKER) {
                return new Worker({
                    id: this.id,
                    genomeState: this.genome.getState(),
                    generation: this.generation,
                    jid: jobTypes.IDLE.jid,
                    beeMutationChance: this.beeMutationChance
                });
            } else if (type === types.QUEEN) {
                return new Queen({
                    id: this.id,
                    genomeState: this.genome.getState(),
                    generation: this.generation,
                    jid: jobTypes.IDLE.jid,
                    beeMutationChance: this.beeMutationChance
                });
            }
        };

        return {
            Queen: Queen,
            Drone: Drone,
            Worker: Worker,
            Egg: Egg,
            Larva: Larva,
            Types: types
        };
    }
]);
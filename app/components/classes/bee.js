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
    '$filter', 'TraitInspector', 'Genome', 'jobTypes', 'resourceTypes', 'logService', 'Point',
    function($filter, TraitInspector, Genome, jobTypes, resourceTypes, logService, Point) {
        /* constructor */
        var Bee = function(config) {
            this.traitInspector = new TraitInspector();
            this.update(config);
        };
        /* public functions */
        Bee.prototype.update = function(config) {
            if (typeof(config) == 'undefined') config = {};
            this.id = config.id || this.id || 0;
            this.pos = config.pos || this.pos || 'A1';
            this.tripStart = config.tripStart || this.tripStart || null;
            this.tripEnd = config.tripEnd || this.tripEnd || null;
            this.tripElaspedTime = config.tripElaspedTime || this.tripElaspedTime || 0;
            this.tripTotalTime = config.tripTotalTime || this.tripTotalTime || 0;
            this.waitingAtResource = angular.isDefined(config.waitingAtResource) ? config.waitingAtResource : angular.isDefined(this.waitingAtResource) ? this.waitingAtResource : true;
            this.dt = config.dt || this.dt || new Date().getTime();
            this.queenParentId = config.queenParentId || this.queenParentId || null;
            this.droneParentId = config.droneParentId || this.droneParentId || null;
            this.generation = config.generation || this.generation || 0;
            this.jid = config.currentJob || config.jid || this.jid || 'IDLE';
            this.msSinceWork = config.msSinceWork || this.msSinceWork || 0;
            this.jobStepIndex = config.jobStepIndex || this.jobStepIndex || 0;
            this.nodeIds = config.nodeIds || this.nodeIds || [];
            this.nodes = this.nodes || [];
            this.nodeIndex = config.nodeIndex || this.nodeIndex || 0;
            this.onStrike = config.onStrike || this.onStrike || false;
            this.earnings = config.earnings || this.earnings || angular.copy(zeroEarnings);
            this.beeMutationChance = config.beeMutationChance || this.beeMutationChance || 0.005;
            this.genome = new Genome(config.genomeState || this.genomeState || { mutationChance: this.beeMutationChance });
            this.genomeState = this.genome.getState();
            this.dead = config.dead || this.dead || false;
            this.baskets = config.baskets || this.baskets || { "NECTAR": 0, "POLLEN": 0, "WATER": 0 };

            this.traits = this.traitInspector.getTraits(this.genome);
            this.abilities = this.traitInspector.getAbilities(this.traits);
            this.name = this.beetype + "#" + this.id;
            //this.name = (this.name && this.name !== 'Unknown Gender') ? this.name : config.name || this.getRandomName();
        };

        Bee.prototype.getState = function() {
            var state = {
                id: this.id,
                pos: this.pos,
                tripStart: this.tripStart,
                tripEnd: this.tripEnd,
                tripElaspedTime: this.tripElaspedTime,
                tripTotalTime: this.tripTotalTime,
                waitingAtResource: this.waitingAtResource,
                dt: this.dt,
                queenParentId: this.queenParentId,
                droneParentId: this.droneParentId,
                generation: this.generation,
                jid: this.jid,
                msSinceWork: this.msSinceWork,
                jobStepIndex: this.jobStepIndex,
                nodeIndex: this.nodeIndex,
                onStrike: this.onStrike,
                earnings: this.earnings,
                beeMutationChance: this.beeMutationChance,
                genomeState: this.genomeState,
                nodeIds: this.nodeIds
            };
            return state;
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
            logService.logBreedMessage(this.name + ' died.');
            this.dead = true;
        };
        Bee.prototype.mature = function(type) {
            logService.logGeneralMessage(this.beetype + ' cannot mature. type: ' + type);
        };
        Bee.prototype.hatch = function(type) {
            logService.logGeneralMessage(this.beetype + ' cannot hatch. type: ' + type);
        };
        Bee.prototype.storageAmount = function(rid) {
            var storage = this.getAbility('STR_' + rid).value;
            return storage - this.baskets[rid];


        };
        Bee.prototype.storageFull = function() {
            return this.storageAmount('NECTAR') + this.storageAmount('POLLEN') + this.storageAmount('WATER') === 0;
        };
        Bee.prototype.setJob = function(jid) {
            // already doing this job
            if (this.jid === jid) return;

            var jobType = jobTypes[jid];

            // can't do this job.
            if (jobType.beetypes.indexOf(this.beetype) == -1) {
                logService.logGeneralMessage(this.beetype + ' cannot be assigned to the job: ' + jid);
                return;
            }

            // new job init
            if (this.harvesting) {
                this.nodes[this.nodeIndex].mapResource.DoneHarvesting();
                this.harvesting = false;
            }
            this.jid = jid;
            this.msSinceWork = 0;
            this.jobStepIndex = -1; //start by returning home.
            this.nodes = [];
            this.nodeIds = [];
            this.nodeIndex = 0;
            this.trip = null;
            this.tripStart = null;
            this.tripEnd = null;
            this.tripTotalTime = null;
            this.tripElaspedTime = null;
            this.isMoving = false;


        };

        Bee.prototype.addNode = function(hexagon) {
            console.log(hexagon);
            if (this.jid !== jobTypes.FORAGER.jid) this.setJob(jobTypes.FORAGER.jid);
            if (this.nodeIds.indexOf(hexagon.id) === -1) {
                this.nodes.push(hexagon);
                this.nodeIds.push(hexagon.id);
            }
        };

        Bee.prototype.removeNode = function(hexagon) {
            this.nodes.splice(this.nodes.indexOf(hexagon), 1);
            this.nodeIds.splice(this.nodeIds.indexOf(hexagon.id), 1);
        };


        Bee.prototype.doSpawn = function(ms, hive, step) {
            var eggRate = this.getAbility(step.spawn.rate).value;
            this.msSinceWork += ms;
            while (this.msSinceWork >= eggRate) {
                if (this.canLayEggs(hive)) {
                    var egg = this.layEgg(hive.getNextId());
                    hive.bees.push(egg);
                }
                this.msSinceWork -= eggRate;
            }

        };
        Bee.prototype.doProduce = function(ms, hive, step) {
            var rate = this.getAbility(step.produce.rate).value;
            this.msSinceWork += ms;
            if (this.msSinceWork >= rate) {
                var ya = this.getAbility(step.produce.yield);

                while (this.msSinceWork >= rate) {
                    var spent = [];
                    var success = false;
                    for (var c = 0; c < step.produce.cost.length; c++) {
                        var ca = this.getAbility(step.produce.cost[c]);
                        success = (hive.changeResource(ca.c_rid, -1 * ca.value) >= 0);
                        if (success) {
                            spent.push({ rid: ca.c_rid, amount: ca.value });
                        } else break;
                    }
                    if (success) {
                        success = hive.changeResource(ya.rid, ya.value) >= 0;
                    }
                    // we either didn't have enough resources, or we couldn't make the 
                    // resource, refund anything that was spent
                    if (!success) {
                        for (s = 0; s < spent.length; s++) {
                            hive.changeResource(spent[s].rid, spent[s].amount);
                        }
                        this.msSinceWork = 0; //no need to keep working
                    } else {
                        this.msSinceWork -= rate;
                    }
                }
            }
        };
        Bee.prototype.doTravel = function(ms, hive, step, map) {

            if (this.tripStart !== this.pos) {
                this.isMoving = true;
                var rate = this.getAbility(step.travel.rate).value;
                this.tripStart = this.pos;
                this.tripElaspedTime = 0;
                this.tripEnd = this.nodes[this.nodeIndex].id;
                this.tripTotalTime = map.GetHexDistance(this.nodes[this.nodeIndex], map.GetHexById(this.tripStart)) * rate;
            }
            this.tripElaspedTime += ms;
            if (this.tripElaspedTime >= this.tripTotalTime) {
                this.isMoving = false;
                this.jobStepIndex++;
                this.msSinceWork = 0;
                this.tripStart = null;
                this.pos = this.nodes[this.nodeIndex].id;
                this.nodes[this.nodeIndex].mapResource.QueueHarvest(this);
            }



        };
        Bee.prototype.doCollect = function(ms, hive, step, map) {
            if (this.waitingAtResource) return;
            var resourceNode = this.nodes[this.nodeIndex].mapResource;
            var rate = this.getAbility(step.collect.rate).value * resourceNode.harvestMultiplier;
            this.msSinceWork += ms;
            while (this.msSinceWork >= rate) {
                var collected = false;
                var rid = resourceTypes.NECTAR.rid;
                if (resourceNode.GetAvailable(rid) > 0 && this.storageAmount(rid) > 0) {
                    this.baskets[rid] += resourceNode.Collect(rid, 1);
                    collected = true;
                }
                rid = resourceTypes.POLLEN.rid;
                if (!collected && resourceNode.GetAvailable(rid) > 0 && this.storageAmount(rid) > 0) {
                    this.baskets[rid] += resourceNode.Collect(rid, 1);
                    collected = true;
                }
                rid = resourceTypes.WATER.rid;
                if (!collected && resourceNode.GetAvailable(rid) > 0 && this.storageAmount(rid) > 0) {
                    this.baskets[rid] += resourceNode.Collect(rid, 1);
                    collected = true;
                }
                if (!collected) {
                    logService.logWorkMessage(this.name + " done harvesting.");
                    this.harvesting = false;
                    this.nodes[this.nodeIndex].mapResource.DoneHarvesting();
                    this.msSinceWork -= rate;
                    if (this.nodeIndex + 1 === this.nodes.length) {
                        this.nodeIndex = 0;
                        this.goHome(0, hive, map);
                    } else if (this.storageFull()) {
                        this.goHome(0, hive, map);
                    } else {
                        this.jobStepIndex = 0;
                        this.nodeIndex++;
                    }
                } else {
                    this.msSinceWork -= rate;
                }

            }

        };
        Bee.prototype.doDeposit = function(ms, hive, step) {
            var rate = this.getAbility(step.deposit.rate).value;
            this.msSinceWork += ms;
            if (this.msSinceWork >= rate) {
                var deposited = false;
                var rid = resourceTypes.NECTAR.rid;
                if (this.baskets[rid] > 0) {
                    if (hive.changeResource(rid, 1) >= 0) {
                        this.baskets[rid]--;
                        deposited = true;
                    }
                }
                rid = resourceTypes.POLLEN.rid;
                if (this.baskets[rid] > 0) {
                    if (hive.changeResource(rid, 1) >= 0) {
                        this.baskets[rid]--;
                        deposited = true;
                    }
                }
                rid = resourceTypes.WATER.rid;
                if (this.baskets[rid] > 0) {
                    if (hive.changeResource(rid, 1) >= 0) {
                        this.baskets[rid]--;
                        deposited = true;
                    }
                }
                if (!deposited) {
                    this.jobStepIndex = 0;
                }
                this.msSinceWork -= rate;
            }
        };
        Bee.prototype.goHome = function(ms, hive, map) {

            if (this.tripStart !== this.pos) {
                this.jobStepIndex = -1;
                var rate = this.getAbility('SPD_FLY').value;
                this.tripStart = this.pos;
                this.tripElaspedTime = 0;
                this.tripEnd = hive.pos;
                this.tripTotalTime = map.GetHexDistance(map.GetHexById(this.tripEnd), map.GetHexById(this.tripStart)) * rate;
                this.isMoving = true;
            }
            this.tripElaspedTime += ms;
            if (this.tripElaspedTime >= this.tripTotalTime) {
                this.isMoving = false;
                var jobType = jobTypes[this.jid];
                this.jobStepIndex = 0;
                this.msSinceWork = 0;
                this.tripStart = null;
                this.pos = this.tripEnd;
                logService.logWorkMessage(this.name + ' returned home.');
                var jobStepIndex = this.jobStepIndex;
                if (jobType.jid === jobTypes.FORAGER.jid) {
                    jobType.steps.filter(function(e, i) {
                        if (e.hasOwnProperty("deposit")) {
                            jobStepIndex = i;
                        }
                    });
                    this.jobStepIndex = jobStepIndex;
                }
            }

        };
        Bee.prototype.doWork = function(ms, hive, map) {
            var jobType = jobTypes[this.jid];
            if (this.jobStepIndex === -1) {
                this.goHome(ms, hive, map);
                return;
            }

            var step = jobType.steps[this.jobStepIndex];
            switch (this.jid) {
                case jobTypes.BREEDER.jid:
                    if (step.hasOwnProperty('spawn'))
                        this.doSpawn(ms, hive, step);
                    break;
                case jobTypes.NURSE.jid:
                case jobTypes.PRODUCER_FOOD.jid:
                case jobTypes.PRODUCER_HONEY.jid:
                case jobTypes.BUILDER.jid:
                case jobTypes.UNDERTAKER.jid:
                    if (step.hasOwnProperty('produce')) {
                        this.doProduce(ms, hive, step);
                    }
                    break;
                case jobTypes.FORAGER.jid:
                    if (step.hasOwnProperty('travel')) {
                        this.doTravel(ms, hive, step, map);
                    } else if (step.hasOwnProperty('collect')) {
                        this.doCollect(ms, hive, step, map);
                    } else if (step.hasOwnProperty('deposit')) {
                        this.doDeposit(ms, hive, step);
                    }
                    break;
                default:
                    this.msSinceWork = 0;
                    break;
            }

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
                beeMutationChance: this.beeMutationChance,
                pos: this.pos

            });
            egg.update();
            return egg;
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
                beeMutationChance: this.beeMutationChance,
                pos: this.pos

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
                    beeMutationChance: this.beeMutationChance,
                    pos: this.pos
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
                    beeMutationChance: this.beeMutationChance,
                    pos: this.pos
                });
            } else if (type === types.QUEEN) {
                return new Queen({
                    id: this.id,
                    genomeState: this.genome.getState(),
                    generation: this.generation,
                    jid: jobTypes.IDLE.jid,
                    beeMutationChance: this.beeMutationChance,
                    pos: this.pos
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
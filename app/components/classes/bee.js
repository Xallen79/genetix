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
            this.baseUpdate(config);
        };
        /* public functions */
        Bee.prototype.baseUpdate = function(config) {
            if (typeof(config) == 'undefined') config = {};
            this.id = config.id || this.id || 0;
            this.dt = config.dt || this.dt || new Date().getTime();
            this.queenParentId = config.queenParentId || this.queenParentId || null;
            this.droneParentId = config.droneParentId || this.droneParentId || null;
            this.generation = config.generation || this.generation || 0;
            this.jid = config.currentJob || config.jid || this.jid || 'IDLE';
            this.onStrike = config.onStrike || this.onStrike || false;
            this.earnings = config.earnings || this.earnings || angular.copy(zeroEarnings);
            this.beeMutationChance = config.beeMutationChance || this.beeMutationChance || 0.005;
            this.genome = new Genome(config.genomeState || this.genomeState || { mutationChance: this.beeMutationChance });
            this.genomeState = this.genome.getState();
            this.dead = config.dead || this.dead || false;
            //this.redGreenImage = getRedGreenImage(this.genes, this.genesUnlocked, this.beeGeneCap);

            this.traits = this.traitInspector.getTraits(this.genome);
            this.name = this.beetype + "#" + this.id;
            //this.name = (this.name && this.name !== 'Unknown Gender') ? this.name : config.name || this.getRandomName();
        };

        Bee.prototype.baseGetState = function() {
            return {
                id: this.id,
                dt: this.dt,
                queenParentId: this.queenParentId,
                droneParentId: this.droneParentId,
                generation: this.generation,
                jid: this.jid,
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
        /*
        Bee.prototype.getRandomName = function() {
            if (!this.genes || this.genes.length === 0) {
                return 'Unknown Gender';
            }

            var firstName = (this.hasTrait('Male')) ? nameList1[randomIntFromInterval(0, nameList1.length - 1)] : nameList2[randomIntFromInterval(0, nameList2.length - 1)];
            var lastName = nameList3[randomIntFromInterval(0, nameList3.length - 1)] + nameList4[randomIntFromInterval(0, nameList4.length - 1)] + nameList5[randomIntFromInterval(0, nameList5.length - 1)];
            return firstName + lastName;
        };
        */

        /* private members */
        var geneticOptions = {
            crossoverrate: 0.5
        };

        var zeroEarnings = {};
        for (var key in resourceTypes) {
            zeroEarnings[key] = {
                rid: key,
                amount: 0
            };
        }



        /*

        // male first names
        var nameList1 = ['Diggy ', 'Dean ', 'Duke ', 'Doyle ', 'Dirk ', 'Dag ', 'Dimitri ', 'Dru '];
        // female first names
        var nameList2 = ['Daggy ', 'Daisy ', 'Dinah ', 'Dharma ', 'Dee ', 'Daphne ', 'Dixie ', 'Darcy '];
        // last name prefixes (empty strings and dupes are for controlling the odds)
        var nameList3 = ['', '', '', '', '', 'Van ', 'Von ', 'O\'', 'Mc', 'Mc'];
        // last names
        var nameList4 = ['Doog', 'Dibb', 'Dabb', 'Dig', 'Dang', 'Dugg'];
        // last name suffixes (empty strings and dupes are for controlling the odds)
        var nameList5 = ['', '', '', 'ler', 'ler', 'er', 'er', 'er', 'wuerst', 'erwuerst', 'erton', 'erton', 'ski'];







        /* private functions */

        function gcd(a, b) {
            return !b ? a : gcd(b, a % b);
        }

        function lcm(a, b) {
            return (a * b) / gcd(a, b);
        }

        function getRedGreenImage(genes, genesUnlocked, beeGeneCap) {
            if (genes.length === 0) return;
            var unlocked = {
                "STR": [],
                "INT": [],
                "END": [],
                "CHR": [],
                "LCK": []
            };
            var genesToUse = [];
            // sort the unlocked genes into arrays.
            for (var u = 0; u < genesUnlocked.length; u++) {
                var attr = geneDefinitions[genesUnlocked[u]].attr;
                unlocked[attr].push(genes[genesUnlocked[u]]);
            }
            // get the least common multiple for that lengths of each array to determine the number of pixels necessary
            // this assumes each attribute has at least 1 gene unlocked.
            var arr = [unlocked.STR.length, unlocked.INT.length, unlocked.END.length, unlocked.CHR.length, unlocked.LCK.length];
            var multiple = Math.min(unlocked.STR.length, unlocked.INT.length, unlocked.END.length, unlocked.CHR.length, unlocked.LCK.length);
            arr.forEach(function(n) {
                multiple = lcm(multiple, n);
            });
            while (multiple < 5) { multiple *= 2; }
            for (var key in unlocked) {
                var geneSize = multiple / unlocked[key].length;
                for (var g = 0; g < unlocked[key].length; g++) {
                    for (var s = 0; s < geneSize; s++) {
                        genesToUse.push(unlocked[key][g]);
                    }
                }
            }
            return generateBitmapDataURL(addRows(convertRedGreenMap(genesToUse, beeGeneCap), genesToUse.length), 1);
        }


        function convertRedGreenMap(genes, beeGeneCap) {
            var result = [];
            var minColorRatio = 1 + beeGeneCap / 50.0;
            var colorRatio = 205.0 / beeGeneCap;
            for (var i = 0; i < genes.length; i++) {
                var r = genes[i][0];
                var g = genes[i][1];
                var bright = Math.abs(r - g) * colorRatio;
                if (r > g) {
                    r = bright;
                    r *= minColorRatio;
                    g = 0;
                } else {
                    r = 0;
                    g = bright;
                    g *= minColorRatio;
                }
                //if (r > 0) r += minColor;
                //if (g > 0) g += minColor;
                if (r > 255) r = 255;
                if (g > 255) g = 255;

                result.push([r, g, 0]);
            }
            return result;
        }

        function addRows(genes, cols) {
            var result = [];
            for (var j = 0; j < (genes.length / cols); j++) {
                var row = [];
                for (var i = 0; i < cols; i++) {
                    row.push(genes[i + (j * cols)]);
                }
                result.push(row);
            }
            return result;
        }

        return Bee;
    }
]);


game.factory('Queen', [
    'Bee', 'Egg',
    function(Bee, Egg) {
        var Queen = function(config) {
            this.beetype = "queen";
            this.minDrones = 10;
            this.update(config);
        };
        Queen.prototype = new Bee();

        Queen.prototype.update = function(config) {
            config = config || {};
            this.baseUpdate(config);
            this.droneGenomeStates = config.droneGenomeStates || this.droneGenomeStates || [];
            this.droneIds = config.droneIds || this.droneIds || [];
        };

        Queen.prototype.getState = function() {
            var state = this.baseGetState();
            state.droneGenomeStates = this.droneGenomeStates;
            state.droneIds = this.droneIds;
            return state;
        };

        Queen.prototype.mate = function(drone) {
            if (drone.beetype !== "drone") {
                console.log("Queen cannot mate with: " + drone.beetype);
                return;
            }
            this.droneGenomeStates.push(drone.genome.getState);
            this.droneIds.push(drone.id);
            drone.die();
        };
        Queen.prototype.canLayEggs = function() {
            var ready = this.droneGenomeStates.length >= this.minDrones;

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

        Queen.prototype.fertilizeEgg = function(egg, newId) {
            var d = randomIntFromInterval(0, this.droneGenomeStates.length - 1);
            var droneGenome = new Genome(this.droneGenomeStates[d]);
            var newGenome = egg.genome.fertilize(droneGenome);

            var child = new Larva({
                id: newId,
                dt: new Date().getTime(),
                generation: this.generation + 1,
                genomeState: newGenome.getState(),
                queenParentId: this.id,
                droneParentId: this.droneIds[d],
                beeMutationChance: this.beeMutationChance

            });
            child.update();
            return child;
        };

        return Queen;
    }

]);

game.factory('Worker', [
    'Bee',
    function(Bee) {
        var Worker = function(config) {
            this.beetype = "worker";
            this.update(config);
        };
        Worker.prototype = new Bee();

        Worker.prototype.update = function(config) {
            config = config || {};
            this.baseUpdate(config);

        };
        Worker.prototype.getState = function() {
            var state = this.baseGetState();

            return state;
        };

        return Worker;
    }
]);

game.factory('Drone', [
    'Bee',
    function(Bee) {
        var Drone = function(config) {
            this.beetype = "drone";
            this.update(config);
        };
        Drone.prototype = new Bee();
        Drone.prototype.update = function(config) {
            config = config || {};
            this.baseUpdate(config);
        };
        Drone.prototype.getState = function() {
            var state = this.baseGetState();

            return state;
        };
        Drone.prototype.die = function() {
            console.log("Drone died. Id: " + this.id);
            this.dead = true;
        };
        return Drone;
    }
]);

game.factory('Egg', [
    'Bee',
    function(Bee) {
        var Egg = function(config) {
            this.beetype = "egg";
            this.update(config);
        };
        Egg.prototype = new Bee();
        Egg.prototype.update = function(config) {
            config = config || {};
            this.baseUpdate(config);
        };
        Egg.prototype.getState = function() {
            var state = this.baseGetState();

            return state;
        };


        return Egg;
    }
]);

game.factory('Larva', [
    'Bee',
    function(Bee) {
        var Larva = function(config) {
            this.beetype = "larva";
            this.update(config);
        };
        Larva.prototype = new Bee();
        Larva.prototype.update = function(config) {
            config = config || {};
            this.baseUpdate(config);
        };
        Larva.prototype.getState = function() {
            var state = this.baseGetState();

            return state;
        };


        return Larva;
    }
]);
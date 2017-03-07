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
            this.dt = config.dt || this.dt || new Date().getTime();
            this.queenParent = config.queenParent || this.queenParent || null;
            this.droneParent = config.droneParent || this.droneParent || null;
            this.beetype = config.beetype || this.beetype || 'hatchling';
            this.generation = config.generation || this.generation || 0;
            this.jid = config.currentJob || config.jid || this.jid || 'IDLE';
            this.onStrike = config.onStrike || this.onStrike || false;
            this.earnings = config.earnings || this.earnings || angular.copy(zeroEarnings);
            this.beeMutationChance = config.beeMutationChance || this.beeMutationChance || 0.005;
            this.genome = new Genome(config.genomeState || this.genomeState || { mutationChance: this.beeMutationChance });
            this.genomeState = this.genome.getState();
            //this.redGreenImage = getRedGreenImage(this.genes, this.genesUnlocked, this.beeGeneCap);
            //this.blueImage = getBlueImage(this.genes);

            this.traits = this.traitInspector.getTraits(this.genome);
            //this.attributes = this.traitInspector.getAttributes(this.genes);
            //this.societyValue = getSocietyValue(this.attributes);

            //this.name = (this.name && this.name !== 'Unknown Gender') ? this.name : config.name || this.getRandomName();
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
        Bee.prototype.getAttribute = function(attr) {
            return this.attributes[attr];
        };


        // queen functions
        Bee.prototype.breed = function(partner, newId) {

            // this must be a queen and partner must be a drone
            if (this.beetype !== 'queen' || partner.beetype !== 'drone')
                return null;

            var queen = this;
            var drone = partner;

            var newGenome = queen.genome.mate(drone.genome);

            var child = new Bee({
                id: newId,
                dt: new Date().getTime(),
                generation: queen.generation,
                genomeState: newGenome.getState(),
                queenParent: queen,
                droneParent: drone,
                beetype: 'hatchling'

            });
            child.update();
            return child;
        };



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
        function crossover(g1, g2, geneCap) {
            var crossoverfn = Math.random();
            var geneRatio = geneCap / 255.0;
            var g = angular.copy(g1);
            g[0] = (crossoverfn <= geneticOptions.crossoverrate ? g1[0] : g2[0]);
            g[1] = (crossoverfn <= geneticOptions.crossoverrate ? g2[1] : g1[1]);
            g[0] /= geneRatio;
            g[1] /= geneRatio;
            var mutationRate = g[2] / 255.0;
            var bitStringR = '';
            var bitStringG = '';

            for (var i = 0; i < 8; i++) {
                if (Math.random() < mutationRate) {
                    bitStringR += '1';
                } else {
                    bitStringR += '0';
                }
                if (Math.random() < mutationRate) {
                    bitStringG += '1';
                } else {
                    bitStringG += '0';
                }
            }
            var oldR = g[0];
            var oldG = g[1];

            g[0] ^= parseInt(bitStringR, 2);
            g[1] ^= parseInt(bitStringG, 2);
            var newR = g[0];
            g[0] = Math.round(g[0] * geneRatio);
            g[1] = Math.round(g[1] * geneRatio);

            //console.log($filter('fmt')('mutate %d -> %d -> %d - string: %s geneCap: %d', oldR, newR, g[0], bitStringR, geneCap));
            return g;
        }

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

        function getBlueImage(genes) {
            return generateBitmapDataURL(addRows(convertBlueMap(genes), genes.length), 1);
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

        function convertBlueMap(genes) {
            var result = [];
            for (var i = 0; i < genes.length; i++) {
                result.push([0, 0, genes[i][2]]);
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

        function getSocietyValue(attr) {
            var costs = [];
            var total = 0;
            for (var key in attributes) {
                var a = attr[key];
                if (a < 0) {
                    total -= Math.pow(10, (-1 * a));
                } else {
                    total += Math.pow(10, a);
                }
            }

            if (total < 0) total = 0;

            costs.push({ resource: resourceTypes.HAPPINESS.name, resourceType: 'HAPPINESS', amount: total });
            return costs;

        }

        return Bee;
    }
]);
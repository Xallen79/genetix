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


game.factory('Breeder', ['$filter', 'TraitInspector', 'geneDefinitions', 'jobTypes', function($filter, TraitInspector, geneDefinitions, jobTypes) {



    /* constructor */
    var Breeder = function(config) {
        this.traitInspector = new TraitInspector();
        this.update(config);
    };
    /* public functions */
    Breeder.prototype.update = function(config) {
        if (typeof(config) == 'undefined') config = {};
        this.id = config.id || this.id || 0;
        this.dt = config.dt || this.dt || new Date();
        this.mother = config.mother || this.mother || null;
        this.father = config.father || this.father || null;
        this.generation = config.generation || this.generation || 0;
        this.genes = config.genes || this.genes || [];
        this.breederGeneCap = config.breederGeneCap || this.breederGeneCap || 25;
        this.genesUnlocked = config.genesUnlocked || this.genesUnlocked || [];
        this.currentJob = config.currentJob || this.currentJob || null;

        this.redGreenImage = getRedGreenImage(this.genes, this.genesUnlocked, this.breederGeneCap);
        //this.blueImage = getBlueImage(this.genes);

        this.traits = this.traitInspector.getTraits(this.genes);
        this.attributes = this.traitInspector.getAttributes(this.genes);

        this.name = (this.name && this.name !== 'Unknown Gender') ? this.name : config.name || this.getRandomName();

    };
    Breeder.prototype.breed = function(partner, newId) {
        var p1 = this;
        var p2 = partner;

        var myGender = this.hasTrait('Male') ? 'Male' : 'Female';

        var child = new Breeder({
            id: newId,
            dt: new Date(),
            generation: p1.generation,
            genes: [],
            genesUnlocked: p1.genesUnlocked,
            breederGeneCap: p1.breederGeneCap,
            mother: myGender == 'Female' ? p1 : p2,
            father: myGender == 'Male' ? p1 : p2

        });
        for (var g = 0; g < p1.genes.length; g++) {
            if (geneDefinitions[g].dom === "Female") {
                child.genes.push(randomIntFromInterval(0, 1) > 0 ? p1.genes[g] : p2.genes[g]);
            } else {
                var p1g = p1.genes[g];
                var p2g = p2.genes[g];
                child.genes.push(crossover(p1g, p2g, this.breederGeneCap));
            }
        }
        child.update();
        return child;
    };
    Breeder.prototype.getTraits = function() {
        return this.traits;
    };
    Breeder.prototype.hasTrait = function(trait) {
        var result = this.traits.filter(function(myTrait) {
            return myTrait.name === trait;
        }).length;
        return result > 0;
    };
    Breeder.prototype.getRandomName = function() {
        if (!this.genes || this.genes.length === 0) {
            return 'Unknown Gender';
        }

        var firstName = (this.hasTrait('Male')) ? nameList1[randomIntFromInterval(0, nameList1.length - 1)] : nameList2[randomIntFromInterval(0, nameList2.length - 1)];
        var lastName = nameList3[randomIntFromInterval(0, nameList3.length - 1)] + nameList4[randomIntFromInterval(0, nameList4.length - 1)] + nameList5[randomIntFromInterval(0, nameList5.length - 1)];
        return firstName + lastName;
    };
    Breeder.prototype.getAttribute = function(attr) {
        return this.attributes[attr];
    };
    // we need to return all relations to account for inbreeding (aka uncle brother)
    /* this is way wrong....
    Breeder.prototype.getRelations = function(they) {
        var mypaternal = [];
        var mymaternal = [];
        var myGender = this.hasTrait('Male') ? 'Male' : 'Female';
        var theypaternal = [];
        var theymaternal = [];
        var theyGender = they.hasTrait('Male') ? 'Male' : 'Female';

        var u;
        // build 'my' list of mothers and fathers
        u = this;
        while (u.mother != null)
        {
            mymaternal.push(u.mother);
            u = u.mother;
        }
        u = this;
        while (u.father != null)
        {
            mypaternal.push(u.father);
            u = u.father;
        }
        // build 'they' list of mothers and fathers
        u = they;
        while (u.mother != null)
        {
            theymaternal.push(u.mother);
            u = u.mother;
        }
        u = they;
        while (u.father != null)
        {
            theypaternal.push(u.father);
            u = u.father;
        }


        var ret = [];

        // check for maternal relationships
        for (var h = 0; h < mymaternal.length; h++)
            for (var k = 0; k < theymaternal.length; k++)
                if (mymaternal[h].id == theymaternal.id)
                {
                    // check same mother
                    if (h == 0 && kk == 0)
                        ret.push(((this.father.id != they.father.id) ? 'Half ' : '') + ((theyGender == 'Female') ? 'Sister' : 'Brother'));
                    

                    if (h > k)
                        ret.push('Grand '.repeat((h-k) - 1) +  ((theyGender == 'Female') ? 'Neice' : 'Nephew'));
                    if (h > k)
                        ret.push('Grand '.repeat((h-k) - 1) +  ((theyGender == 'Female') ? 'Neice' : 'Nephew'));
                }

        




    };
    */


    /* private members */
    var geneticOptions = {
        crossoverrate: 0.5
    };




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
        var crossover = Math.random();
        var geneRatio = geneCap / 255.0;
        var g = angular.copy(g1);
        g[0] = (crossover <= geneticOptions.crossoverrate ? g1[0] : g2[0]);
        g[1] = (crossover <= geneticOptions.crossoverrate ? g2[1] : g1[1]);
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

    function getRedGreenImage(genes, genesUnlocked, breederGeneCap) {
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
        return generateBitmapDataURL(addRows(convertRedGreenMap(genesToUse, breederGeneCap), genesToUse.length), 1);
    }

    function getBlueImage(genes) {
        return generateBitmapDataURL(addRows(convertBlueMap(genes), genes.length), 1);
    }

    function convertRedGreenMap(genes, breederGeneCap) {
        var result = [];
        var minColorRatio = 1 + breederGeneCap / 50.0;
        var colorRatio = 205.0 / breederGeneCap;
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

    return Breeder;
}]);
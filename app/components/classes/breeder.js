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


game.factory('Breeder', ['$filter', 'TraitInspector', function($filter, TraitInspector) {



    /* constructor */
    var Breeder = function(config) {
        this.traitInspector = new TraitInspector();
        this.update(config);
        this.name = this.getRandomName();
    };
    /* public functions */
    Breeder.prototype.update = function(config) {
        if (typeof(config) == 'undefined') config = {};
        this.id = config.id || this.id || 0;
        this.mother = config.mother || this.mother || null;
        this.father = config.father || this.father || null;
        this.generation = config.generation || this.generation || 0;
        this.genes = config.genes || this.genes || [];
        //(max number of bits that can mutate, limits the max/min values for each gene)
        // 4 = max 15, 5 = max 31... 8 = max 255
        this.mutationBits = config.mutationBits || this.mutationBits || 4;

        this.redGreenImage = getRedGreenImage(this.genes, this.mutationBits);
        this.blueImage = getBlueImage(this.genes);
        this.traits = this.traitInspector.getTraits(this.genes);
        this.attributes = this.traitInspector.getAttributes(this.genes);

    };
    Breeder.prototype.breed = function(partner, newId) {
        var p1 = this;
        var p2 = partner;

        var myGender = this.hasTrait('Male') ? 'Male' : 'Female';

        var child = new Breeder({
            id: newId,
            generation: p1.generation + 1,
            genes: [],
            mother: myGender == 'Female' ? p1 : p2,
            father: myGender == 'Male' ? p1 : p2

        });
        for (var g = 0; g < p1.genes.length; g++) {
            var p1g = p1.genes[g];
            var p2g = p2.genes[g];
            child.genes.push(crossover(p1g, p2g, this.mutationBits));
        }
        child.name = child.getRandomName();
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
    function crossover(g1, g2, maxBits) {
        var crossover = Math.random();
        var g = angular.copy(crossover <= geneticOptions.crossoverrate ? g1 : g2);
        var mutationRate = g[2] / 255.0;
        var bitStringR = '';
        var bitStringG = '';
        for (var i = 0; i < maxBits; i++) {
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
        return g;
    }

    function getRedGreenImage(genes, mutationBits) {
        return generateBitmapDataURL(addRows(convertRedGreenMap(genes, mutationBits), genes.length), 20);
    }

    function getBlueImage(genes) {
        return generateBitmapDataURL(addRows(convertBlueMap(genes), genes.length), 20);
    }

    function convertRedGreenMap(genes, mutationBits) {
        var result = [];
        var minColor = 50;
        var factor = 255 / (Math.pow(2, mutationBits) - 1);
        for (var i = 0; i < genes.length; i++) {
            var r = genes[i][0];
            var g = genes[i][1];
            var bright = Math.abs(r - g) / 255;
            bright *= factor;
            if (r > g) {
                g = 0;
            } else {
                r = 0;
            }
            r *= bright;
            g *= bright;

            if (r > 0) r += minColor;
            if (g > 0) g += minColor;
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
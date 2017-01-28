var game = angular.module('bloqhead.genetixApp');


game.factory('Breeder', ['$filter', 'TraitInspector', function($filter, TraitInspector) {



    /* constructor */
    var Breeder = function(config) {
        this.traitInspector = new TraitInspector();
        this.update(config);
        this.setRandomName();
    };
    /* public functions */
    Breeder.prototype.update = function(config) {
        if (typeof(config) == 'undefined') config = {};
        this.id = config.id || this.id || 0;
        this.generation = config.generation || this.generation || 0;
        this.scale = config.scale || this.scale || 6;
        this.genes = config.genes || this.genes || [];
        this.redGreenImage = getRedGreenImage(this.genes, this.scale);
        this.blueImage = getBlueImage(this.genes, this.scale);
        this.traits = this.traitInspector.getTraits(this.genes);
    };
    Breeder.prototype.breed = function(partner, newId) {
        var p1 = this;
        var p2 = partner;
        var child = new Breeder({
            id: newId,
            generation: p1.generation + 1,
            genes: []
        });
        for (var g = 0; g < p1.genes.length; g++) {
            var p1g = p1.genes[g];
            var p2g = p2.genes[g];
            child.genes.push(crossover(p1g, p2g));
        }
        child.update({ scale: 20 });
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
    Breeder.prototype.setRandomName = function() {
        this.name = this.getRandomName();
    };
    Breeder.prototype.getRandomName = function() {
        if (!this.genes || this.genes.length === 0) {
            return 'Unknown Gender';
        }

        var firstName = (this.hasTrait('Male')) ?
            nameList1[randomIntFromInterval(0, nameList1.length - 1)] :
            nameList2[randomIntFromInterval(0, nameList2.length - 1)];

        var lastName = nameList3[randomIntFromInterval(0, nameList3.length - 1)] +
            nameList4[randomIntFromInterval(0, nameList4.length - 1)] +
            nameList5[randomIntFromInterval(0, nameList5.length - 1)];

        return firstName + lastName;
    };



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
    function crossover(g1, g2) {
        var crossover = Math.random();
        //var mutation = randomIntFromInterval(0, 255);
        var g = angular.copy(crossover <= geneticOptions.crossoverrate ? g1 : g2);
        var mutationRate = g[2] / 255.0;
        //var mr = mutation < g[2] ? randomIntFromInterval(-25, 25) : 0;
        //var mg = mutation < g[2] ? randomIntFromInterval(-25, 25) : 0;
        //var mb = mutation < g[2] ? randomIntFromInterval(-25, 25) : 0;
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
        //if(oldR !== g[0]) console.log('Mutation! R: '+oldR+' to '+g[0]);
        //if(oldG !== g[1]) console.log('Mutation! G: '+oldG+' to '+g[1]);
        /*
                if (g[0] + mr < 0) g[0] = 0;
                else if (g[0] + mr > 255) g[0] = 255;
                else g[0] += mr;

                if (g[1] + mg < 0) g[1] = 0;
                else if (g[1] + mg > 255) g[1] = 255;
                else g[1] += mg;

                if (g[2] + mb < 0) g[2] = 0;
                else if (g[2] + mb > 255) g[2] = 255;
                else g[2] += mb;
        */
        return g;
    }

    function getRedGreenImage(genes, scale) {
        return generateBitmapDataURL(addRows(convertRedGreenMap(genes), genes.length), 20);
    }

    function getBlueImage(genes, scale) {
        return generateBitmapDataURL(addRows(convertBlueMap(genes), genes.length), scale);
    }

    function convertRedGreenMap(genes) {
        var result = [];
        for (var i = 0; i < genes.length; i++) {
            var r = genes[i][0];
            var g = genes[i][1];
            var bright = (Math.abs(r - g) / 255.0);

            if (r > g) g = 0;
            else r = 0;
            r *= bright;
            g *= bright;
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
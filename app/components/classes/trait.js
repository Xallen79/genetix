var game = angular.module('bloqhead.genetixApp');

game.factory('TraitInspector', ['$filter', 'geneDefinitions', 'traitDefinitions', function($filter, geneDefinitions, traitDefinitions) {
    /* constructor */
    var TraitInspector = function(config) {
        this.update(config);
    };



    /* public functions */
    TraitInspector.prototype.update = function(config) {
        if (typeof(config) == 'undefined') config = {};
        //this.id = config.id || this.id || 0;        
    };

    TraitInspector.prototype.getTraits = function(genes) {
        var ret = [];
        var traits = buildTraits(traitDefinitions);
        if (genes.length) {
            for (var i = 0; i < traits.length; i++) {
                var td = traits[i];
                var met = true;
                for (var h = 0; h < td.genes.length && met === true; h++) {
                    var tdg = td.genes[h];
                    var v = genes[tdg[0]][1] - genes[tdg[0]][0];
                    if (v < tdg[1] || v > tdg[2])
                        met = false;
                }

                if (met) {
                    ret.push(td);
                }
            }
        }


        return ret;
    };

    TraitInspector.prototype.getAttributes = function(genes) {
        var ret = {
            "STR": 0,
            "INT": 0,
            "END": 0,
            "CHR": 0,
            "LCK": 0
        };
        if (genes.length) {
            var strBase = 0,
                intBase = 0,
                endBase = 0,
                chrBase = 0,
                lckBase = 0;
            for (var g = 0; g < genes.length; g++) {
                if (g < 10)
                    strBase += genes[g][1] - genes[g][0];
                else if (g < 20)
                    intBase += genes[g][1] - genes[g][0];
                else if (g < 30)
                    endBase += genes[g][1] - genes[g][0];
                else if (g < 40)
                    chrBase += genes[g][1] - genes[g][0];
                else
                    lckBase += genes[g][1] - genes[g][0];
            }
            ret.STR = Math.floor(Math.sqrt((Math.abs(strBase) + 20) / 25)) * (strBase < 0 ? -1 : 1);
            ret.INT = Math.floor(Math.sqrt((Math.abs(intBase) + 20) / 25)) * (intBase < 0 ? -1 : 1);
            ret.END = Math.floor(Math.sqrt((Math.abs(endBase) + 20) / 25)) * (endBase < 0 ? -1 : 1);
            ret.CHR = Math.floor(Math.sqrt((Math.abs(chrBase) + 20) / 25)) * (chrBase < 0 ? -1 : 1);
            ret.LCK = Math.floor(Math.sqrt((Math.abs(lckBase) + 20) / 25)) * (lckBase < 0 ? -1 : 1);
        }
        return ret;
    };


    /* private members */
    var checked = [];
    traits = [];
    var getTraitByName = function(name) {
        return traits.filter(function(t) {
            return name === t.name;
        })[0];
    };
    var getRequiredGenesRecursive = function(trait) {
        if (angular.isDefined(trait.requiredTraits)) {
            for (var j = 0; j < trait.requiredTraits.length; j++) {
                var requiredTrait = trait.requiredTraits[j];
                var req = getTraitByName(requiredTrait);
                if (checked.indexOf(req.name) === -1)
                    getRequiredGenesRecursive(req);
                for (var g = 0; g < req.genes.length; g++)
                    trait.genes.push(req.genes[g]);
            }
        }
        checked.push(trait.name);
    };

    var buildTraits = function(t) {
        checked = [];
        traits = t;
        for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            getRequiredGenesRecursive(trait);
        }
        return traits;
    };


    return TraitInspector;
}]);
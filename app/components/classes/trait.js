/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.factory('TraitInspector', ['$filter', 'traitDefinitions', 'beeAbilities', function($filter, traitDefinitions, beeAbilities) {
    /* constructor */
    var TraitInspector = function(config) {
        this.update(config);
    };



    /* public functions */
    TraitInspector.prototype.update = function(config) {
        if (typeof(config) == 'undefined') config = {};
        //this.id = config.id || this.id || 0;        
    };

    TraitInspector.prototype.getTraits = function(genome) {
        var ret = [];
        var traits = buildTraits(traitDefinitions);

        for (var i = 0; i < traits.length; i++) {
            var td = traits[i];
            var met = true;
            for (var h = 0; h < td.genes.length && met === true; h++) {
                var tdg = td.genes[h];
                //var v = genes[tdg[0]][1] - genes[tdg[0]][0];
                var v = genome.getGene(tdg.chromosome, tdg.gene);
                if (v !== tdg.value)
                    met = false;
            }

            if (met) {
                ret.push(td);
            }
        }


        return ret;
    };

    TraitInspector.prototype.getAbilities = function(traits) {
        var abilities = angular.copy(beeAbilities);
        for (var t = 0; t < traits.length; t++) {
            var trait = traits[t];
            for (var m = 0; m < trait.mods.length; m++) {
                var mod = trait.mods[m];
                for (var baid in mod) {
                    if (mod.hasOwnProperty(baid)) {
                        abilities[baid].add = abilities[baid].add || 0;
                        abilities[baid].percent = abilities[baid].percent || 0;
                        abilities[baid].add += (angular.isDefined(mod[baid].add) ? mod[baid].add : 0);
                        abilities[baid].percent += (angular.isDefined(mod[baid].percent) ? mod[baid].percent / 100 : 0);
                    }
                }
            }
        }
        for (var a in abilities) {
            if (abilities.hasOwnProperty(a)) {
                var ability = abilities[a];
                ability.add = ability.add || 0;
                ability.percent = ability.percent || 0;
                ability.value = ability.baseValue;
                ability.value += ability.add;
                ability.value *= 1 + ability.percent;
            }
        }
        return abilities;

    };

    // /* private members */
    var checked = [];
    var traits = [];
    var built = false;
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
                    trait.genes.push(angular.copy(req.genes[g]));
            }
        }
        checked.push(trait.name);
    };

    var buildTraits = function(t) {
        if (built) return traits;
        traits = t;
        for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            getRequiredGenesRecursive(trait);
        }
        built = true;
        return traits;
    };


    return TraitInspector;
}]);
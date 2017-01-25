var game = angular.module('bloqhead.genetixApp');


game.constant('geneDefinitions', (function() {
    var geneDefinitions = [];
    //gene :r,g,b r:recessive, g:dominant, b:mutationrate
    geneDefinitions[0] = { dom: 'Broad Shoulders', rec: 'Slender Shoulders', attr: ['STR'] };
    geneDefinitions[1] = { dom: 'Thick Skull', rec: 'Soft Skull', attr: ['STR'] };
    geneDefinitions[2] = { dom: 'Large Arms', rec: 'Small Arms', attr: ['STR'] };
    geneDefinitions[3] = { dom: 'Large Legs', rec: 'Small Legs', attr: ['STR'] };
    geneDefinitions[4] = { dom: 'Big Chest', rec: 'Weak Chest', attr: ['STR'] };
    geneDefinitions[5] = { dom: 'Tough Jaw', rec: 'Weak Jaw', attr: ['STR'] };
    geneDefinitions[6] = { dom: 'Oafish', rec: 'Mousey', attr: ['STR'] };
    geneDefinitions[7] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[8] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[9] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[10] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[11] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[12] = { dom: '', rec: '', attr: ['STR'] };
    geneDefinitions[13] = { dom: '', rec: '', attr: ['STR'] };

    geneDefinitions[14] = { dom: 'Calculated Decisions', rec: 'Reckless', attr: ['INT'] };
    geneDefinitions[15] = { dom: 'Lateral Thinker', rec: 'Single Minded', attr: ['INT'] };
    geneDefinitions[16] = { dom: 'Quick Learner', rec: 'Forgetful', attr: ['INT'] };
    geneDefinitions[17] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[18] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[19] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[20] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[21] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[22] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[23] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[24] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[25] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[26] = { dom: '', rec: '', attr: ['INT'] };
    geneDefinitions[27] = { dom: '', rec: '', attr: ['INT'] };

    geneDefinitions[28] = { dom: 'Full Lips', rec: 'Thin Lips', attr: ['CHR'] };
    geneDefinitions[29] = { dom: 'Dark Skin', rec: 'Fair Skin', attr: ['CHR'] };
    geneDefinitions[30] = { dom: 'Eloquent', rec: 'Catatonic', attr: ['CHR'] };
    geneDefinitions[31] = { dom: 'Powerful Voice', rec: 'Quiet Voice', attr: ['CHR'] };
    geneDefinitions[32] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[33] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[34] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[35] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[36] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[37] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[38] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[39] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[40] = { dom: '', rec: '', attr: ['CHR'] };
    geneDefinitions[41] = { dom: '', rec: '', attr: ['CHR'] };

    geneDefinitions[42] = { dom: 'Female', rec: 'Male', attr: ['LCK'] };
    geneDefinitions[43] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[44] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[45] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[46] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[47] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[48] = { dom: '', rec: '', attr: ['LCK'] };
    geneDefinitions[49] = { dom: '', rec: '', attr: ['LCK'] };

    return geneDefinitions;
})());

game.constant('traitDefinitions', (function() {
    var traits = [{
            name: 'Handsome',
            genes: [
                [0, -200, 200],
                [5, 50, 255]
            ],
            requiredTraits: ['Male']
        },
        {
            name: 'Pretty',
            genes: [
                [0, -200, -100],
                [4, 20, 240]
            ],
            requiredTraits: ['Female']
        },
        {
            name: 'Aggressive',
            genes: [
                [0, 200, 255],
                [2, 200, 255],
                [4, 200, 255],
                [5, 200, 255],
                [14, -255, -150]
            ]
        },
        {
            name: 'Female',
            genes: [
                [42, 0, 255]
            ]
        },
        {
            name: 'Male',
            genes: [
                [42, -255, -1]
            ]
        },
        {
            name: 'Handsome Aggressive and something',
            genes: [
                [30, 0, 0]
            ],
            requiredTraits: ['Handsome', 'Aggressive']
        }
    ];

    var checked = [];
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

    var buildTraits = function() {
        for (var i = 0; i < traits.length; i++) {
            var trait = traits[i];
            getRequiredGenesRecursive(trait);
        }
        //console.log(traits);
        return traits;
    };
    return buildTraits();
})());


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
        if (genes.length) {
            for (var i = 0; i < traitDefinitions.length; i++) {
                var td = traitDefinitions[i];
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

    /* private members */

    return TraitInspector;
}]);
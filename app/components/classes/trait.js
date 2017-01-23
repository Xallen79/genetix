var game = angular.module('bloqhead.genetixApp');


game.constant('geneDefinitions',(function(){
    var geneDefinitions = [];
    //gene :r,g,b r:recessive, g:dominant, b:mutationrate
    geneDefinitions[0]  = {dom:'Broad Shoulders', rec:'Slender Shoulders',attr: ['STR']};
    geneDefinitions[1]  = {dom:'Thick Skull', rec:'Soft Skull', attr: ['STR']};
    geneDefinitions[2]  = {dom:'Large Arms', rec:'Small Arms', attr: ['STR']};
    geneDefinitions[3]  = {dom:'Large Legs', rec:'Small Legs', attr: ['STR']};
    geneDefinitions[4]  = {dom:'Big Chest', rec:'Weak Chest', attr: ['STR']};
    geneDefinitions[5]  = {dom:'Tough Jaw', rec:'Weak Jaw', attr: ['STR']};
    geneDefinitions[6]  = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[7]  = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[8]  = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[9]  = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[10] = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[11] = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[12] = {dom:'', rec:'', attr: ['STR']};
    geneDefinitions[13] = {dom:'', rec:'', attr: ['STR']};

    geneDefinitions[14] = {dom:'Calculated Decisions', rec:'Reckless', attr: ['INT']};
    geneDefinitions[15] = {dom:'Lateral Thinker' ,rec:'Single Minded', attr: ['INT']};
    geneDefinitions[16] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[17] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[18] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[19] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[20] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[21] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[22] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[23] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[24] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[25] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[26] = {dom:'' ,rec:'', attr: ['INT']};
    geneDefinitions[27] = {dom:'' ,rec:'', attr: ['INT']};

    geneDefinitions[28] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[29] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[30] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[31] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[32] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[33] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[34] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[35] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[36] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[37] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[38] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[39] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[40] = {dom:'' ,rec:'', attr: ['CHR']};
    geneDefinitions[41] = {dom:'' ,rec:'', attr: ['CHR']};

    geneDefinitions[42] = {dom:'Female' ,rec:'Male', attr: ['LCK']};
    geneDefinitions[43] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[44] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[45] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[46] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[47] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[48] = {dom:'' ,rec:'', attr: ['LCK']};
    geneDefinitions[49] = {dom:'' ,rec:'', attr: ['LCK']};

    return geneDefinitions;
})());

game.constant('traitDefinitions',[
    {
        name: 'Handsome',
        genes: [[0, -200,200], [5,50,255]],
        requiredTraits: ['Male']
    },
    {
        name: 'Pretty',
        genes: [[0,-200,-100], [4,20,240]],
        requiredTraits: ['Female']
    },
    {
        name: 'Aggressive',
        genes: [[0,200,255],[2,200,255],[4,200,255],[5,200,255],[14,-255,-150]]
    },
    {
        name: 'Female',
        genes: [[42,0,255]]
    },
    {
        name: 'Male',
        genes: [[42,-255,-1]]
    }
]);


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
        if(genes.length) {
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
        ret = ret.filter(function(trait) {
            if(angular.isDefined(trait.requiredTraits)) {
                var allRequiredMet = true;
                for(var rt=0;rt<trait.requiredTraits.length && allRequiredMet;rt++) {
                    var required = trait.requiredTraits[rt];
                    allRequiredMet = ret.filter(function(requiredTrait) {
                        return requiredTrait.name == required;
                    }).length > 0;
                }
                return allRequiredMet;
            }
            else 
                return true;
        });

        return ret;
    };





    /* private members */

    return TraitInspector;
}]);
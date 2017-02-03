var game = angular.module('bloqhead.genetixApp');



game.constant('achievementSetup', {
    achievements: {
        A_BIRTHS: {
            aid: 'A_BIRTHS',
            name: 'The Chosen One',
            desc: 'Create a new unit',
            ranks: [
                [1, [
                    ['P_R_BONUS', 'GOLD', 50],
                    ['P_R_BONUS', 'WOOD', 100]
                ]],
                [20, [
                    ['P_R_BONUS', 'GOLD', 50],
                    ['P_M_HAPPINESS'],
                    ['P_G_ENHANCED', 14, 10]
                ]]
            ]
        },
        A_GOLD: {
            aid: 'A_GOLD',
            name: 'Oooohhh Shiiiiiny',
            desc: 'Earn gold.',
            ranks: [
                [50, [
                    ['P_R_MULTIPLIER', 'happiness', 0.1]
                ]]
            ]
        },
        A_GOLD_C: {
            aid: 'A_GOLD_C',
            name: 'Gold Hoarder',
            desc: 'Aquire gold... lots and lots of gold!',
            ranks: [
                [100, [
                    ['P_R_MULTIPLIER', 'happiness', 0.2]
                ]]
            ]
        }
    },
    perks: {
        // mechanics
        P_M_HAPPINESS: {
            pid: 'P_M_HAPPINESS',
            name: 'New Mechanic: Happiness',
            desc: 'Happiness is a representation of how content your population is.',
            once: true
        },
        P_R_MULTIPLIER: {
            pid: 'P_R_MULTIPLIER',
            name: 'Resource Muliplier',
            desc: 'The rate that you aquire [%1] has been increased by [%2]x.'
        },
        P_R_BONUS: {
            pid: 'P_R_BONUS',
            name: 'Bonus Resources',
            desc: '[%2] [%1] has been added to your coffers.'
        },
        P_G_ENHANCED: {
            pid: 'P_G_ENHANCED',
            name: 'Gene Enhancement',
            desc: 'The boundary has been increased by [%amt] for one of your [%attr] genes. ([%dom]/[%rec])'
        }
    }

});



game.service('achievementService', [
    '$rootScope', '$filter', 'logService', 'achievementSetup', 'geneDefinitions',
    function($rootScope, $filter, logService, achievementSetup, geneDefinitions) {
        var self = this;

        self.init = function(state) {

            if (state)
                self.progress = { achievements: state.achievements, perks: state.perks };
            else
                self.progress = { achievements: [], perks: [] };
        };
        self.getState = function() {
            return {
                achievements: self.progress.achievements,
                perks: self.progress.perks
            };
        };


        self.updateProgress = function(aid, amount) {
            var achProgress = self.progress.achievements[aid];
            if (!achProgress) {
                achProgress = {
                    aid: aid,
                    amount: 0
                };
                self.progress.achievements[aid] = achProgress;
            }

            var oldval = achProgress.amount;
            var newval = achProgress.amount + amount;

            achProgress.amount = newval;

            var achSetup = achievementSetup.achievements[aid];
            for (var rc = 0; rc < achSetup.ranks.length; rc++) {
                var amountRequired = achSetup.ranks[rc][0];
                if (amountRequired > oldval && amountRequired <= newval) {

                    var reward = {
                        achievement: achSetup,
                        amountRequired: amountRequired,
                        perks: []
                    };

                    // log the message
                    logService.logAchievementMessage('Achievement Earned - ' + achSetup.name + ' (' + amountRequired + ')');

                    // process the perks
                    for (var pc = 0; pc < achSetup.ranks[rc][1].length; pc++) {
                        var p = self.applyPerk(achSetup.ranks[rc][1][pc]);
                        if (p !== null) {
                            reward.perks.push(p);
                        }
                    }

                    $rootScope.$emit('newRewardEvent', reward);

                }
            }
        };

        self.applyPerk = function(arr) {
            var pid = arr[0];
            var perkSetup = achievementSetup.perks[pid];

            // if this perk can only be earned once and the player has earned it already,
            // we do not have to do anything
            if (perkSetup.once) {
                var perkSearch = $filter('filter')(self.progress.perks, { pid: pid });
                if (perkSearch.length !== 0)
                    return null;
            }

            // log the message
            var msg = perkSetup.name + ' - ' + perkSetup.desc;
            switch (perkSetup.pid) {
                case 'P_G_ENHANCED':
                    var gene = geneDefinitions[arr[1]];
                    msg = msg.replace('[%dom]', gene.dom);
                    msg = msg.replace('[%rec]', gene.rec);
                    msg = msg.replace('[%attr]', gene.attr[0]);
                    msg = msg.replace('[%amt]', arr[2]);
                    break;
                default:
                    for (var i = 1; i < arr.length; i++)
                        msg = msg.replace('[%' + i + ']', arr[i]);
                    break;
            }

            logService.logAchievementMessage(msg);

            var ret = {
                pid: pid,
                msg: msg,
                arr: arr,
                dt: (new Date()).toUTCString()
            };
            self.progress.perks.push(ret);
            return ret;

        };

        self.SubscribeNewRewardEvent = function(scope, callback) {
            var handler = $rootScope.$on('newRewardEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };

    }
]);
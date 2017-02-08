var game = angular.module('bloqhead.genetixApp');



game.service('achievementService', [
    '$rootScope', '$filter', 'achievementSetup', 'logService', 'geneDefinitions', 'resourceTypes',
    function($rootScope, $filter, achievementSetup, logService, geneDefinitions, resourceTypes) {
        var self = this;


        self.init = function(state) {

            self.state = state || {};
            self.achievementSetup = achievementSetup || {};

            if (!self.state.hasOwnProperty('progress')) {
                self.state = {
                    progress: {
                        achievements: {},
                        perks: []
                    }
                };
            }
        };
        self.getState = function() {
            return self.state;
        };

        self.getProgressSnapshot = function() {
            return angular.copy(self.state.progress);
        };


        self.updateProgress = function(aid, amount) {
            var achProgress = self.state.progress.achievements[aid];
            var achSetup = self.achievementSetup.achievements[aid];
            if (!achProgress) {
                achProgress = {
                    aid: aid,
                    amount: 0,
                    lastRank: 0
                };
                self.state.progress.achievements[aid] = achProgress;
            }

            var oldval = achProgress.amount;
            var newval = oldval;
            if (achSetup.cumulative === true) {
                if (amount > oldval) {
                    newval = amount;
                }
            } else {
                // we should never take away something they have achieved
                if (amount > 0) {
                    newval = achProgress.amount + amount;
                }
            }

            achProgress.amount = newval;

            if (oldval != newval) {
                for (var rc = 0; rc < achSetup.ranks.length; rc++) {
                    var amountRequired = achSetup.ranks[rc][0];
                    if (amountRequired > achProgress.lastRank && amountRequired > oldval && amountRequired <= newval) {

                        var msg = 'Achievement Earned - ' + achSetup.name + ' (' + amountRequired + ')';

                        achProgress.lastRank = amountRequired;

                        var reward = {
                            achievement: achSetup,
                            amountRequired: amountRequired,
                            msg: msg,
                            perks: []
                        };

                        // log the message
                        logService.logAchievementMessage(msg);

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
            }
        };

        self.applyPerk = function(arr) {
            var pid = arr[0];
            var perkSetup = achievementSetup.perks[pid];

            // if this perk can only be earned once and the player has earned it already,
            // we do not have to do anything
            if (perkSetup.once) {
                var perkSearch = $filter('filter')(self.state.progress.perks, { pid: pid });
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
                case 'P_R_BONUS':
                case 'P_R_MULTIPLIER':
                    msg = msg.replace('[%1]', resourceTypes[arr[1]].name);
                    msg = msg.replace('[%2]', arr[2]);
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
            self.state.progress.perks.push(ret);
            return ret;

        };

        self.SubscribeNewRewardEvent = function(scope, callback) {
            var handler = $rootScope.$on('newRewardEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };

    }
]);
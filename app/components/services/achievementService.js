var game = angular.module('bloqhead.genetixApp');



game.service('achievementService', [
    '$rootScope', '$filter', 'achievementSetup', 'logService', 'geneDefinitions', 'resourceTypes', 'defaultBuildings',
    function($rootScope, $filter, achievementSetup, logService, geneDefinitions, resourceTypes, defaultBuildings) {
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
                    lastRank: 0,
                    nextRank: self.getNextRankAmount(aid, 0)
                };
                self.state.progress.achievements[aid] = achProgress;
            }

            var oldval = achProgress.amount;
            var newval = oldval;
            if ((achSetup.cumulative || false) === true) {
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

                        // log the message
                        var msg = self.getAchievementMessage(achSetup.aid, amountRequired);
                        logService.logAchievementMessage(msg);


                        achProgress.lastRank = amountRequired;
                        achProgress.nextRank = self.getNextRankAmount(aid, achProgress.amount);

                        var reward = {
                            achievement: achSetup,
                            amountRequired: amountRequired,
                            msg: msg,
                            perks: []
                        };



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
            var msg = self.getPerkMessage(arr, perkSetup);
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

        self.getNextRankAmount = function(aid, currentAmount) {
            var ranks = achievementSetup.achievements[aid].ranks;
            var progress = self.state.progress.achievements[aid];

            // no progress and at least one rank
            if (!progress && ranks.length > 0) {
                return ranks[0][0];
            }

            // get the first rank above the current amount
            for (var i = 0; i < ranks.length; i++) {
                if (ranks[i][0] > progress.amount) {
                    return ranks[i][0];
                }
            }

            // no more ranks
            return -1;
        };

        self.getAchievementMessage = function(aid, amountRequired, prop) {
            var achSetup = achievementSetup.achievements[aid];
            var msg = (achSetup[prop] || achSetup.logmsg || achSetup.desc || achSetup.name || 'Unknown');
            var params = {
                name: achSetup.name,
                req: amountRequired
            };
            params.name = $filter('fmt')(params.name, params);
            return $filter('fmt')(msg, params);
        };

        self.getPerkMessage = function(arr, prop) {
            var pid = arr[0];
            var perkSetup = achievementSetup.perks[pid];
            var msg = (perkSetup[prop] || perkSetup.logmsg || perkSetup.desc || perkSetup.name || 'Unknown');
            var params = {
                name: perkSetup.name
            };
            switch (perkSetup.pid.substring(0, 4)) {
                case 'P_G_':
                    var gene = geneDefinitions[arr[1]];
                    params.dom = gene.dom;
                    params.rec = gene.rec;
                    params.attr = gene.attr[0];
                    params.amt = arr[2];
                    break;
                case 'P_R_':
                    params.res = resourceTypes[arr[1]].name;
                    params.amt = arr[2] || 0;
                    break;
                case 'P_B_':
                    params.buildingType = defaultBuildings[arr[1]].name;
                    params.amt = arr[2] || 0;
                    params.plural = params.amt > 1 ? "s" : "";
                    break;
                default:
                    for (var i = 1; i < arr.length; i++)
                        params[i] = arr[i];
                    break;
            }
            params.name = $filter('fmt')(params.name, params);
            return $filter('fmt')(msg, params);
        };


        self.SubscribeNewRewardEvent = function(scope, callback) {
            var handler = $rootScope.$on('newRewardEvent', callback.bind(this));
            scope.$on('$destroy', handler);
        };

    }
]);
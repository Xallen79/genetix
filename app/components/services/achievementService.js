var game = angular.module('bloqhead.genetixApp');



game.constant('achievementSetup', {
    achievements: [{
        aid: 'A_BIRTHS',
        name: 'The Chosen One',
        ranks: [
            [1, [
                ['R_GOLD', 100],
                ['R_WOOD', 100]
            ]],
            [18, [
                ['M_HAPPINESS']
            ]]
        ]
    }],
    perks: [{
        pid: 'M_HAPPINESS',
        name: 'New Mechanic: Happiness',
        desc: 'Happiness is a representation of how content your population is.',
        once: true
    }, {
        pid: 'R_GOLD',
        name: 'Earned Bonus Resources: Gold',
        desc: '[%1] gold has been added to your coffers.'
    }, {
        pid: 'R_WOOD',
        name: 'Earned Bonus Resources: Wood',
        desc: '[%1] wood has been added to your coffers.'
    }]
});



game.service('achievementService', [
    '$filter', 'logService', 'achievementSetup',
    function($filter, logService, achievementSetup) {
        var self = this;

        self.init = function(progress) {
            self.progress = progress || { achievements: [], perks: [] };
        };


        self.updateProgress = function(aid, amount) {
            var progressSearch = $filter('filter')(self.progress.achievements, { aid: aid });
            var achProgress;
            if (progressSearch.length === 0) {
                achProgress = {
                    aid: aid,
                    amount: 0
                };
                self.progress.achievements.push(achProgress);
            } else {
                achProgress = progressSearch[0];
            }

            var oldval = achProgress.amount;
            var newval = achProgress.amount + amount;

            achProgress.amount = newval;

            var achSetup = $filter('filter')(achievementSetup.achievements, { aid: aid })[0];
            for (var rc = 0; rc < achSetup.ranks.length; rc++) {
                var amountRequired = achSetup.ranks[rc][0];
                if (amountRequired > oldval && amountRequired <= newval) {

                    // log the message
                    logService.logAchievementMessage('Achievement Earned - ' + achSetup.name + ' (' + amountRequired + ')');

                    // process the perks
                    for (var pc = 0; pc < achSetup.ranks[rc][1].length; pc++) {
                        self.applyPerk(achSetup.ranks[rc][1][pc]);
                    }

                }
            }
        };

        self.applyPerk = function(arr) {
            var pid = arr[0];
            var perkSetup = $filter('filter')(achievementSetup.perks, { pid: pid })[0];

            // if this perk can only be earned once and the player has earned it already,
            // we do not have to do anything
            if (perkSetup.once || false) {
                var perkSearch = $filter('filter')(self.progress.perks, { pid: pid });
                if (perkSearch.length !== 0)
                    return;
            }

            // log the message
            var msg = perkSetup.name + ' - ' + perkSetup.desc;
            for (var i = 1; i < arr.length; i++)
                msg = msg.replace('[%' + i + ']', arr[i]);
            logService.logAchievementMessage(msg);

            // do the work
            switch (pid) {
                case 'R_GOLD':
                    // increase player gold by arr[1]
                    break;
                case 'R_WOOD':
                    // increase player wood by arr[1]
                    break;
            }
        };



        self.init();
    }
]);
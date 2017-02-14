/*
 (function($) {
     $(function() {
         $('body').tooltip({
             selector: '[rel=tooltip]'
         });
     });
 })(jQuery);
*/

angular.module('bloqhead.genetixApp', ['ui.router', 'lz-string', 'ui.bootstrap', 'sprintf', 'ngAnimate'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$uibTooltipProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider, $uibTooltipProvider) {
            $urlRouterProvider.otherwise('/main');
            var states = [];
            states.push({
                name: 'home',
                url: '/',
                component: 'bloqhead.components.home'

            });
            states.push({
                name: 'home.main',
                url: 'main',
                component: 'bloqhead.components.mainGame'

            });
            states.push({
                name: 'home.achievements',
                url: 'achievements',
                component: 'bloqhead.components.achievementsUI'

            });
            states.push({
                name: 'home.test',
                url: 'test',
                component: 'bloqhead.components.testInterface'

            });

            states.forEach(function(state) {
                $stateProvider.state(state);
            });

            //$locationProvider.html5Mode(true);

            $uibTooltipProvider.options({
                appendToBody: true,
                placement: 'top-left',
                popupCloseDelay: 250,
                popupDelay: 250
            });
        }
    ]).run(['gameService', function(gameService) {
        gameService.init();
    }]);
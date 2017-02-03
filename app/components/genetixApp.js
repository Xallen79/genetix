(function($) {
    $(function() {
        $('body').tooltip({
            selector: '[rel=tooltip]'
        });
    });
})(jQuery);


angular.module('bloqhead.genetixApp', ['ui.router', 'lz-string'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {
            $urlRouterProvider.otherwise('/');
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
        }
    ]).run(['gameService', function(gameService) {
        gameService.init();
    }]);
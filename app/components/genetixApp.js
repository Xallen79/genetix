angular.module('bloqhead.genetixApp', ['ui.router'])
    .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
        function($stateProvider, $urlRouterProvider, $locationProvider) {
            $urlRouterProvider.otherwise('/');
            var states = [];
            states.push({
                name: 'home',
                url: '/',
                templateUrl: 'components/home.html'

            });
            states.push({
                name: 'home.main',
                url: 'genetix',
                component: 'bloqhead.components.mainGame'

            });
            states.push({
                name: 'home.test',
                url: 'test',
                component: 'bloqhead.components.testInterface'

            });

            states.forEach(function(state) {
                $stateProvider.state(state);
            });

            $locationProvider.html5Mode(true);
        }
    ]).run(['gameService', function(gameService) {
        gameService.init();
    }]);
var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadMap', {
    templateUrl: 'components/map/map.html',
    controller: 'bloqhead.controllers.map',
    bindings: {
        //canBreed: '<',
        //breederAssign: '&',
        //population: '<',
        //maxPopulation: '='
    }
});

game.controller('bloqhead.controllers.map', [
    '$scope', '$rootScope', '$timeout', 'gameLoopService',
    function($scope, $rootScope, $timeout, gameLoopService) {
        var self = this;
        var canvas, context;

        self.$onInit = function() {
            gameLoopService.SubscribeGameLoopEvent($scope, draw);
        };

        self.$postLink = function() {
            $timeout(createCanvas);
        };

        function createCanvas() {
            // create canvas
            canvas = document.getElementById('map');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // create context
            context = canvas.getContext('2d');
            context.fillStyle = '#bdefc7';
            context.fillRect(0, 0, canvas.width, canvas.height);
        }


        var hives = [
            [250, 130],
            [180, 400]
        ];



        function draw() {
            if (canvas === null || context === null)
                return;

            for (var i = 0; i < hives.length; i++) {
                var hive = hives[i];
                context.fillStyle = 'yellow';
                context.beginPath();
                context.arc(hive[0], hive[1], 10, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();
            }
            requestAnimationFrame(draw);
        }



    }
]);
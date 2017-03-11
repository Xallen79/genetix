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
    '$scope', '$rootScope', '$timeout', 'gameLoopService', 'hexMap',
    function($scope, $rootScope, $timeout, gameLoopService, hexMap) {
        var self = this;
        var canvas, context, map;

        var mapsize = 10; // the number of vertical hexes in the left column
        var hexsize = 60; // the height of a hex in pixels



        self.$onInit = function() {};

        self.$postLink = function() {

            $timeout(function() {
                // create canvas
                canvas = document.getElementById('map');
                resizeCanvas();
                // create context
                context = canvas.getContext('2d');
                // set initial size
                self.setHexSize(60);
                // hook into the game loop
                gameLoopService.SubscribeGameLoopEvent($scope, draw);

            });
        };

        self.setHexSize = function(size) {
            hexsize = size;
            hexMap.findHexByHeight(hexsize);
            resizeCanvas();
        };
        self.setMapSize = function(size) {
            mapsize = size;
            hexMap.findHexByHeight(hexsize);
            resizeCanvas();
        };

        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;


            clear();
            drawHexMap();

            //drawHives();
            //drawClovers();



        }

        function resizeCanvas() {
            if (typeof canvas === 'undefined')
                return;

            var cs = canvasSize();
            canvas.style.width = cs + 'px';
            canvas.style.height = cs + 'px';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }


        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
            //context.fillStyle = '#bdefc7';
            //context.fillRect(0, 0, canvas.width, canvas.height);
        }

        function canvasSize() {
            return (mapsize + 0) * hexsize;
        }

        function drawHexMap() {

            // generate hexes and draw them
            var cs = canvasSize();
            var map = new hexMap.Grid(cs, cs);
            for (var h in map.Hexes) {
                map.Hexes[h].draw(context);
            }
        }


        var hives = [
            [250, 130],
            [180, 400]
        ];

        clovers = [
            [450, 160],
            [120, 330],
            [290, 400],
        ];

        function drawHives() {
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
        }

        function drawClovers() {
            for (var i = 0; i < clovers.length; i++) {
                var clover = clovers[i];
                context.fillStyle = 'green';
                context.beginPath();
                context.arc(clover[0], clover[1], 6, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();
            }
        }






    }
]);
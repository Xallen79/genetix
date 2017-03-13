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

        self.mapsize_h = 10; // the number of vertical hexes in the left column
        self.mapsize_w = 15; // the number of hexagons across the top
        self.hexsize = 50; // the height of a hex in pixels

        var ratio = (2 / (Math.sqrt(3)));
        var hexsize_min = 20;
        var hexsize_max = 120;


        self.$onInit = function() {};

        self.$postLink = function() {

            $timeout(function() {
                // create canvas and context
                canvas = document.getElementById('map');
                context = canvas.getContext('2d');

                // set initial size
                self.setHexSize(self.hexsize);
                resizeCanvas();



                // add mousewheel support, this is temporary
                canvas.parentElement.addEventListener('mousewheel', function(event) {
                    if (event.wheelDeltaY > 0 && self.hexsize < hexsize_max) {
                        self.setHexSize(self.hexsize + 5);
                    }
                    if (event.wheelDeltaY < 0 && self.hexsize > hexsize_min) {
                        self.setHexSize(self.hexsize - 5);
                    }
                    return false;
                }, false);




                // hook into the game loop
                gameLoopService.SubscribeGameLoopEvent($scope, draw);

            });
        };

        self.setHexSize = function(size) {
            self.hexsize = size;
            hexMap.findHexByHeight(self.hexsize);
            resizeCanvas();
        };

        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;

            context.save();
            clear();
            drawHexMap();
            context.restore();


        }

        function resizeCanvas() {
            if (typeof canvas === 'undefined')
                return;

            canvas.style.width = canvas.style.width = canvasWidth() + 'px';
            canvas.style.height = canvas.style.height = canvasHeight() + 'px';
            canvas.width = canvas.width = canvas.offsetWidth;
            canvas.height = canvas.height = canvas.offsetHeight;
            map = null;
        }


        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }


        function canvasWidth() {
            var hexwidth = hexMap.Hexagon.Static.WIDTH * 0.75;
            return self.mapsize_w * hexwidth + (hexMap.Hexagon.Static.WIDTH * 0.25) + 2;
        }

        function canvasHeight() {
            return self.hexsize * self.mapsize_h;
        }

        function drawHexMap() {

            // generate hexes and draw them
            if (map === null)
                map = new hexMap.Grid(canvasWidth(), canvasHeight());

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
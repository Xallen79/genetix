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
    '$scope', '$rootScope', '$timeout', 'gameLoopService', 'hexMap', 'mapService',
    function($scope, $rootScope, $timeout, gameLoopService, hexMap, mapService) {
        var self = this;
        var canvas, context, map;
        var hexsize_min = 20;
        var hexsize_max = 120;


        self.mapsize_h = 10; // the number of vertical hexes in the left column
        self.mapsize_w = 15; // the number of hexagons across the top
        self.hexsize = 50; // the height of a hex in pixels
        self.needsResize = true; // set to true to resize the canvas in the draw routine




        self.$onInit = function() {};

        self.$postLink = function() {

            $timeout(function() {
                // create canvas and context
                canvas = document.getElementById('map');
                context = canvas.getContext('2d');

                // set initial size
                self.setHexSize(self.hexsize);


                // add mousewheel support, this is temporary
                canvas.parentElement.addEventListener('mousewheel', function(event) {

                    // only allow changing if we are not pending a resize already
                    if (self.needsResize)
                        return false;

                    if (event.wheelDeltaY > 0 && self.hexsize < hexsize_max) {
                        self.setHexSize(self.hexsize * 1.1);
                    }
                    if (event.wheelDeltaY < 0 && self.hexsize > hexsize_min) {
                        self.setHexSize(self.hexsize / 1.1);
                    }
                    return false;
                }, false);
                canvas.addEventListener('click', function(event) {
                    var p = new hexMap.Point(event.offsetX, event.offsetY);
                    var hex = self.map.GetHexAt(p);

                    if (hex === null || typeof hex === 'undefined')
                        return false;

                    var oldid = mapService.selectHex(hex.id);

                    if (oldid == hex.id)
                        console.log('TODO: show additional info via dialog or somethin');
                    else {
                        hex.selected = true;
                        if (oldid !== null)
                            self.map.GetHexById(oldid).selected = false;
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
            self.needsResize = true;
        };

        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;

            if (self.needsResize)
                resizeCanvas();

            context.save();
            clear();
            drawHexMap();
            drawHives();
            context.restore();


        }

        function resizeCanvas() {
            if (typeof canvas === 'undefined')
                return;

            var w = canvasWidth();
            var h = canvasHeight();

            canvas.style.width = canvas.style.width = w + 'px';
            canvas.style.height = canvas.style.height = h + 'px';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            self.needsResize = false;
            self.map = new hexMap.Grid(w, h);

            if (angular.isDefined(mapService.getState().selectedHexID))
                self.map.GetHexById(mapService.getState().selectedHexID).selected = true;
        }


        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }


        function canvasWidth() {
            var hexwidth = hexMap.Hexagon.Static.WIDTH * 0.75;
            return self.mapsize_w * hexwidth + (hexMap.Hexagon.Static.WIDTH * 0.25) + 2;
        }

        function canvasHeight() {
            return (self.hexsize * self.mapsize_h) + 4;
        }

        function drawHexMap() {
            // generate hexes and draw them
            for (var h in self.map.Hexes) {
                self.map.Hexes[h].draw(context);
            }
        }




        clovers = [
            [450, 160],
            [120, 330],
            [290, 400],
        ];

        function drawHives() {
            var hexwidth = hexMap.Hexagon.Static.WIDTH * 0.75;
            for (var i = 0; i < mapService.hives.length; i++) {

                var hex = self.map.GetHexById(mapService.hives[i].pos);
                context.fillStyle = 'yellow';
                context.beginPath();
                context.arc(hex.MidPoint.X, hex.MidPoint.Y, self.hexsize * 0.3, 0, 2 * Math.PI);
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
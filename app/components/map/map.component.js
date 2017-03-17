var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadMap', {
    templateUrl: 'components/map/map.html',
    controller: 'bloqhead.controllers.map',
    bindings: {}
});

game.controller('bloqhead.controllers.map', [
    '$scope', '$rootScope', '$timeout', '$filter', 'mapService',
    function($scope, $rootScope, $timeout, $filter, mapService) {
        var self = this;
        var canvas, context, map;
        var hexsize_min = 20;
        var hexsize_max = 120;

        self.mapsize_h = 10; // the number of vertical hexes in the left column
        self.mapsize_w = 15; // the number of hexagons across the top
        self.hexsize = 50; // the height of a hex in pixels
        self.needsResize = true; // set to true to resize the canvas in the draw routine        
        self.mapState = {};


        self.$onInit = function() {};

        self.$postLink = function() {

            $timeout(function() {
                // create canvas
                canvas = document.getElementById('map');

                // create context
                context = canvas.getContext('2d');

                // set initial size
                //self.setHexSize(self.hexsize);

                // add mouse events
                canvas.parentElement.addEventListener('mousewheel', self.mousewheel, false);
                canvas.parentElement.addEventListener('mousedown', self.mousedown, false);
                document.addEventListener('mouseup', self.mouseup, false);
                canvas.addEventListener('click', self.click, false);

                mapService.SubscribeMapUpdateEvent($scope, function(event, state) {
                    draw();
                });

                /*
                // hook into the game loop
                //gameLoopService.SubscribeGameLoopEvent($scope, draw);
                // instead of using game loop directly, use map update event 
                // (this will get called during the same cycle, but ensures the map objects are updated first)
                mapService.SubscribeMapUpdateEvent($scope, function(event, state) {
                    self.mapState = state;
                    if (!self.mapState.initialized) {
                        self.initializeMap();
                    }

                    draw();
                });
                */
            }, 100);
        };

        /*
                self.initializeMap = function() {

                    self.mapsize_h = 10; // the number of vertical hexes in the left column
                    self.mapsize_w = 15; // the number of hexagons across the top
                    self.hexsize = 50; // the height of a hex in pixels
                    self.needsResize = true; // set to true to resize the canvas in the draw routine
                    self.setHexSize(self.hexsize);
                    // after a reset we need to clear out any selected hexes
                    if (!angular.isDefined(self.mapState.selectedHexID)) {
                        var selectedHexes = $filter('filter')(self.map.Hexes, { selected: true });
                        for (var sh = 0; sh < selectedHexes.length; sh++) {
                            selectedHexes[sh].selected = false;
                        }
                    }
                };
        */

        self.mousewheel = function(event) {
            // only allow changing if we are not pending a resize already
            if (self.needsResize)
                return false;

            var old_w = canvasWidth();
            var old_h = canvasHeight();

            if (event.wheelDeltaY > 0 && self.hexsize < hexsize_max) {
                self.setHexSize(self.hexsize * 1.1);
            }
            if (event.wheelDeltaY < 0 && self.hexsize > hexsize_min) {
                self.setHexSize(self.hexsize / 1.1);
            }

            return false;
        };
        self.mousedown = function(event) {
            document.addEventListener('mousemove', self.mousemove, false);
        };
        self.mouseup = function(event) {
            document.removeEventListener('mousemove', self.mousemove);
            $timeout(function() {
                self.stopClick = false;
            });
        };
        self.click = function(event) {

            if (!self.stopClick)
                mapService.mapClicked(event.offsetX, event.offsetY);

            return false;
        };
        self.mousemove = function(event) {
            self.moveCanvasBy(event.movementX, event.movementY);
            if (event.movementX !== 0 || event.movementY !== 0)
                self.stopClick = true;
        };

        self.moveCanvas = function(x, y) {
            canvas.style.left = x + 'px';
            canvas.style.top = y + 'px';
        };

        self.moveCanvasBy = function(x, y) {
            var l = parseInt(canvas.style.left) + x;
            var t = parseInt(canvas.style.top) + y;
            self.moveCanvas(l, t);
        };


        self.setHexSize = function(size) {

            console.log('mapService', mapService);
            console.log('getState', mapService.getState());
            console.log('map', mapService.getState().map);

            self.hexsize = size;
            mapService.getState().map.SetHexSizeByHeight(size);
            self.needsResize = true;
        };


        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;

            if (self.needsResize) {
                resizeCanvas();
            }

            mapService.drawMap(context);
        }

        function resizeCanvas() {
            if (typeof canvas === 'undefined')
                return;

            var old_w = parseInt(canvas.style.width);
            var old_h = parseInt(canvas.style.height);
            var new_w = canvasWidth();
            var new_h = canvasHeight();

            canvas.style.width = canvas.style.width = new_w + 'px';
            canvas.style.height = canvas.style.height = new_h + 'px';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            self.needsResize = false;
            //self.map = new hexMap.Grid(new_w, new_h);

            var tran_x = (0 - (new_w - old_w)) / 2;
            var tran_y = (0 - (new_h - old_h)) / 2;
            self.moveCanvasBy(tran_x, tran_y);

            if (angular.isDefined(self.mapState.selectedHexID)) {
                self.map.GetHexById(self.mapState.selectedHexID).selected = true;
            }

        }

        function canvasWidth(s) {
            s = s || self.hexsize;
            s = s * (2 / (Math.sqrt(3)));
            var hexwidth = s * 0.75;
            return (self.mapsize_w * hexwidth + (s * 0.25)) + 4;
        }

        function canvasHeight(s) {
            s = s || self.hexsize;
            return (s * self.mapsize_h) + 4;
        }





    }
]);
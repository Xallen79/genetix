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
    '$scope', '$rootScope', '$timeout', '$filter', 'hexMap', 'mapService',
    function($scope, $rootScope, $timeout, $filter, hexMap, mapService) {
        var self = this;
        var canvas, context, map;
        var hexsize_min = 20;
        var hexsize_max = 120;


        self.mapsize_h = 10; // the number of vertical hexes in the left column
        self.mapsize_w = 15; // the number of hexagons across the top
        self.hexsize = 50; // the height of a hex in pixels
        self.needsResize = true; // set to true to resize the canvas in the draw routine        
        self.mapState = {};
        self.dragging = false;


        self.$onInit = function() {};

        self.$postLink = function() {

            $timeout(function() {
                // create canvas
                canvas = document.getElementById('map');

                // create context
                context = canvas.getContext('2d');

                // set initial size
                self.setHexSize(self.hexsize);

                // add events for the canvas
                self.addMouseEvents();



                // hook into the game loop
                //gameLoopService.SubscribeGameLoopEvent($scope, draw);
                // instead of using game loop directly, use map update event 
                // (this will get called during the same cycle, but ensures the map objects are updated first)
                mapService.SubscribeMapUpdateEvent($scope, function(event, state) {
                    self.mapState = state;
                    draw();
                });
            });
        };

        self.addMouseEvents = function() {

            // add mousewheel support
            canvas.parentElement.addEventListener('mousewheel', function(event) {

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

                /*
                var new_w = canvasWidth();
                var new_h = canvasHeight();
                var tran_x = new_w - old_w;
                var tran_y = new_h - old_h;

                var p = new hexMap.Point(event.offsetX, event.offsetY);

                console.log(tran_x, tran_y);
                self.moveCanvasBy(tran_x, tran_y);
                */
                return false;
            }, false);


            canvas.parentElement.addEventListener('mousedown', function(event) {
                self.dragging = true;
            });
            document.addEventListener('mouseup', function(event) {
                self.dragging = false;
            });
            document.addEventListener('mousemove', function(event) {
                if (self.dragging === true) {
                    self.moveCanvasBy(event.movementX, event.movementY);
                }
            });


            canvas.addEventListener('click', function(event) {
                var p = new hexMap.Point(event.offsetX, event.offsetY);
                var hex = self.map.GetHexAt(p);

                if (hex === null || typeof hex === 'undefined')
                    return false;

                var oldid = mapService.selectHex(hex.id);

                if (oldid == hex.id) {
                    console.log('TODO: show additional info via dialog or somethin');
                } else {
                    hex.selected = true;
                    if (oldid !== null)
                        self.map.GetHexById(oldid).selected = false;
                }
                self.dragging = false;
                return false;
            }, false);

        };

        self.canvasLocation = function() {
            var canvas_p = new hexMap.Point(parseInt(canvas.style.left), parseInt(canvas.style.top));
            return canvas_p;
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
            self.hexsize = size;
            hexMap.findHexByHeight(self.hexsize);
            self.needsResize = true;
        };


        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;

            if (self.needsResize)
                resizeCanvas();

            // after a reset we need to clear out any selected hexes
            //if (!angular.isDefined(self.mapState.selectedHexID)) {
            //    var selectedHexes = $filter('filter')(self.map.Hexes, { selected: true });
            //    for (var sh = 0; sh < selectedHexes.length; sh++) {
            //        selectedHexes[sh].selected = false;
            //    }
            //
            //}

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

            if (angular.isDefined(self.mapState.selectedHexID)) {
                self.map.GetHexById(self.mapState.selectedHexID).selected = true;
            }

        }


        function clear() {
            context.clearRect(0, 0, canvas.width, canvas.height);
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
            for (var i = 0; i < self.mapState.hives.length; i++) {
                var hive = self.mapState.hives[i];
                var hex = self.map.GetHexById(hive.pos);
                var id = 'H' + hive.id;
                context.fillStyle = hive.id === self.mapState.currentHiveID ? 'yellow' : 'grey';
                context.beginPath();
                context.arc(hex.MidPoint.X, hex.MidPoint.Y, self.hexsize * 0.3, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();

                context.fillStyle = 'black';
                context.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
                context.textAlign = "center";
                context.textBaseline = 'middle';
                //var textWidth = ctx.measureText(this.Planet.BoundingHex.id);
                context.fillText(id, hex.MidPoint.X, hex.MidPoint.Y);
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
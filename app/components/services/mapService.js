var game = angular.module('bloqhead.genetixApp');

game.service('mapService', [
    '$rootScope', '$filter', 'hiveService', 'gameLoopService', 'logService', 'Grid', 'Point',
    function($rootScope, $filter, hiveService, gameLoopService, logService, Grid, Point) {
        var self = this;
        var state;

        self.init = function(loadState) {
            state = loadState || state || {};

            if (!angular.isDefined(state.initialized))
                state.initialized = false;
            if (!angular.isDefined(state.currentHiveID))
                state.currentHiveID = hiveService.hives[0].id;
            if (!angular.isDefined(state.selectedHexID))
                state.selectedHexID = undefined;
            if (!angular.isDefined(state.mapconfig)) {
                self.map = self.generateInitialMap();
                state.mapconfig = self.map.config;
            } else {
                self.map = new Grid(state.mapconfig);
            }

            hiveService.SubscribePopulationUpdateEvent($rootScope, self.handleHiveUpdate);
            gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);

            self.sendMapUpdateEvent();

            state.initialized = true;

        };
        self.getState = function() {
            return state;
        };
        self.mapClicked = function(x, y) {


            var p = new Point(x, y);


            // TODO: handle clicking bees before falling through to the hex

            // handle clicking on a hex
            var hex = self.map.GetHexAt(p);
            var oldhex = self.map.GetHexById(state.selectedHexID);

            if (hex === null || typeof hex === 'undefined')
                return;

            if (oldhex !== null && typeof oldhex !== 'undefined') {
                if (hex.id === oldhex.id) {
                    console.log('TODO: show additional info via dialog or somethin');
                } else {
                    oldhex.selected = false;
                }
            }
            hex.selected = true;
            state.selectedHexID = hex.id;

            // check if this hex has a hive, if so, select it
            var hive = $filter('filter')(this.hives, { pos: hex.id })[0];
            if (hive && hive.id != state.currentHiveID) {
                state.currentHiveID = hive.id;
            }
        };



        self.SubscribeMapUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('mapUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendMapUpdateEvent();
        };
        self.sendMapUpdateEvent = function() {
            var s = state;
            s.hives = [];
            for (var h = 0; h < self.hives.length; h++) {
                var hive = self.hives[h];
                s.hives.push({
                    id: hive.id,
                    pos: hive.pos
                });
            }
            $rootScope.$emit('mapUpdateEvent', s);
        };
        self.handleGameLoop = function(event, elapsedMs) {
            if (elapsedMs !== 0) { // do animations here
            }
            self.sendMapUpdateEvent(); //always send update so map will be rendered;
        };
        self.handleHiveUpdate = function(event, data) {
            self.hives = data;
            self.sendMapUpdateEvent();
        };

        self.drawMap = function(context) {
            clear(context);
            drawHexes(context);
            drawHives(context);
        };


        // map generating
        self.generateInitialMap = function() {
            return new Grid({
                MAPWIDTH: 6,
                MAPHEIGHT: 8
            });
        };

        /**
         * Updates configuration and relocates hexes
         * @param {int} height the size in pixels of each hex
         */
        self.setHexSizeByHeight = function(height) {
            height = height || 30;
            width = height * (2 / (Math.sqrt(3)));

            var y = height / 2.0;

            //solve quadratic
            var a = -3.0;
            var b = (-2.0 * width);
            var c = (Math.pow(width, 2)) + (Math.pow(height, 2));
            var z = (-b - Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);
            var x = (width - z) / 2.0;

            self.map.config.WIDTH = width;
            self.map.config.HEIGHT = height;
            self.map.config.SIDE = z;
            self.map.Relocate();

            // retrun the height and width of the map, including MARGIN
            return calcCanvasSize();

        };

        /**
         * Updates configuration and relocates hexes
         * @param {int} length the length of the side
         * @param {double} ratio the ratio between the the height and width of the hex, omit for perfect hexagon
         */
        self.setHexSizeBySide = function(length, ratio) {
            length = length || 18;
            ratio = ratio || (2 / (Math.sqrt(3)));
            var z = length;
            var r = ratio;

            //solve quadratic
            var r2 = Math.pow(r, 2);
            var a = (1 + r2) / r2;
            var b = z / r2;
            var c = ((1 - 4.0 * r2) / (4.0 * r2)) * (Math.pow(z, 2));

            var x = (-b + Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);
            var y = ((2.0 * x) + z) / (2.0 * r);

            var width = ((2.0 * x) + z);
            var height = (2.0 * y);

            self.map.config.WIDTH = width;
            self.map.config.HEIGHT = height;
            self.map.config.SIDE = z;
            self.map.Relocate();

            // retrun the height and width of the map, including MARGIN
            return calcCanvasSize();
        };

        function calcCanvasSize() {
            var x = self.map.config.MAPWIDTH * ((self.map.config.WIDTH + self.map.config.SIDE)) - self.map.config.SIDE;
            var y = self.map.config.MAPHEIGHT * self.map.config.HEIGHT;
            x += (self.map.config.MARGIN * 2);
            y += (self.map.config.MARGIN * 2);
            return new Point(x, y);
        }

        // canvas drawing
        function clear(context) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }

        function drawHexes(context) {
            for (var h in self.map.Hexes) {
                self.map.Hexes[h].draw(context);
            }
        }

        function drawHives(context) {
            for (var i = 0; i < state.hives.length; i++) {
                var hive = state.hives[i];
                var hex = self.map.GetHexById(hive.pos);
                var id = 'H' + hive.id;
                context.fillStyle = hive.id === state.currentHiveID ? 'yellow' : 'grey';
                context.beginPath();
                context.arc(hex.MidPoint.X, hex.MidPoint.Y, self.map.config.HEIGHT * 0.3, 0, 2 * Math.PI);
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




















    }
]);
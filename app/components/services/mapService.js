var game = angular.module('bloqhead.genetixApp');

game.service('mapService', [
    '$rootScope', '$filter', 'gameLoopService', 'logService', 'Grid', 'Point', 'Hive', 'MapResource',
    function($rootScope, $filter, gameLoopService, logService, Grid, Point, Hive, MapResource) {
        var self = this;
        var state;

        self.init = function(loadState) {
            state = loadState || state || {};

            self.hives = [];
            self.mapResources = [];

            if (!angular.isDefined(state.mapconfig)) {
                self.generateInitialMap();
                state.mapconfig = self.map.config;
            } else {
                self.map = new Grid(state.mapconfig);
                for (var h = 0; h < state.hiveStates.length; h++) {
                    var hive = new Hive(state.hiveStates[h]);
                    self.hives.push(hive);
                }
                for (var r = 0; r < state.mapResourcesStates.length; r++) {
                    var node = new MapResource(state.mapResourcesStates[r]);
                    self.mapResources.push(node);
                    self.map.GetHexById(node.pos).mapResource = node;
                }
            }


            gameLoopService.SubscribeGameLoopEvent($rootScope, self.handleGameLoop);

            self.sendMapInitializedEvent();
            self.sendHiveChangeEvent();

            state.initialized = true;

        };
        self.getState = function() {
            state.mapconfig = self.map.config;

            // hives
            state.hiveStates = [];
            for (var h = 0; h < self.hives.length; h++) {
                state.hiveStates.push(self.hives[h].getState());
            }

            // resource nodes
            state.mapResourcesStates = [];
            for (var r = 0; r < self.mapResources.length; r++) {
                state.mapResourcesStates.push(self.mapResources[r].getState());
            }

            return state;
        };


        self.getHiveByPosition = function(pos) {
            return $filter('filter')(self.hives, { pos: pos }, true)[0];
        };

        self.getCurrentHive = function() {
            return self.getHiveById(self.map.config.currentHiveID);
        };
        self.getHiveById = function(hiveid) {
            return $filter('filter')(self.hives, { id: hiveid }, true)[0];
        };

        self.getBeeById = function(beeid) {
            return self.getHiveById(beeid.substring(beeid.indexOf('H') + 1)).getBeeById(beeid);
        };

        // methods called by the component
        self.mapClicked = function(x, y) {


            var p = new Point(x, y);


            // TODO: handle clicking bees before falling through to the hex

            // handle clicking on a hex
            var hex = self.map.GetHexAt(p);
            var oldhex = self.map.GetHexById(self.map.config.selectedHexID);

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
            self.map.config.selectedHexID = hex.id;

            // check if this hex has a hive, if so, select it
            var hive = self.getHiveByPosition(hex.id);
            if (hive && hive.id != self.map.config.currentHiveID) {
                self.map.config.currentHiveID = hive.id;
                self.sendHiveChangeEvent();
            }
        };
        self.mapMoved = function(x, y) {
            self.map.config.canvasLocation = new Point(x, y);
        };
        self.setRangeGraph = function(beeid) {
            if (beeid) {
                var hive = self.getCurrentHive();
                var bee = hive.getBeeById(beeid);
                var range = bee.getAbility('RNG').value;

                var center = self.map.GetHexById(hive.pos);
                for (var h = 0; h < self.map.Hexes.length; h++) {
                    var target = self.map.Hexes[h];
                    target.inRange = self.map.GetHexDistance(center, target) <= range;
                }


            } else {
                self.range = null;
                for (var h2 = 0; h2 < self.map.Hexes.length; h2++) {
                    self.map.Hexes[h2].inRange = false;
                }
            }
        };

        // map events
        self.SubscribeMapInitializedEvent = function(scope, callback) {
            var handler = $rootScope.$on('mapInitializedEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendMapInitializedEvent();
        };
        self.sendMapInitializedEvent = function() {
            $rootScope.$emit('mapInitializedEvent', self.map.config);
        };
        self.SubscribeMapUpdateEvent = function(scope, callback) {
            var handler = $rootScope.$on('mapUpdateEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendMapUpdateEvent();
        };
        self.sendMapUpdateEvent = function() {
            $rootScope.$emit('mapUpdateEvent');
        };
        self.SubscribeHiveChangeEvent = function(scope, callback) {
            var handler = $rootScope.$on('hiveChangeEvent', callback.bind(this));
            scope.$on('$destroy', handler);
            self.sendHiveChangeEvent();
        };
        self.sendHiveChangeEvent = function() {
            $rootScope.$emit('hiveChangeEvent', { currentHive: self.getCurrentHive() });
        };

        self.handleGameLoop = function(event, elapsedMs) {
            if (elapsedMs !== 0) { // do animations here
                for (var h = 0; h < self.hives.length; h++) {
                    self.hives[h].handleGameLoop(event, elapsedMs);
                }
            }
            self.sendMapUpdateEvent(); //always send update so map will be rendered;
        };

        self.drawMap = function(context) {
            clear(context);
            drawHexes(context);
            drawHives(context);
            drawResources(context);
        };

        self.addHive = function(position) {
            var id = self.hives.length + 1;
            var hive = new Hive({
                "id": id,
                "initialSize": 2,
                "maxSize": 5,
                "beeMutationChance": 0.0025,
                "pos": position
            });
            self.hives.push(hive);
            return hive;
            //self.sendPopulationUpdateEvent();
        };
        self.addWaterNode = function(position) {

            var hex = self.map.GetHexById(position);
            if (typeof hex.mapResources != 'undefined') {
                return null;
            }

            var id = self.mapResources.length + 1;
            var mr = new MapResource({
                "id": id,
                "resourceName": 'Water',
                "pos": position,
                "color": '#04328C',
                "cooldown": 0,
                "water": 10000
            });
            self.mapResources.push(mr);
            hex.mapResource = mr;
            return mr;
        };

        self.addCloverNode = function(position, level) {

            level = parseFloat(level) || 1;
            if (level === 0)
                level = 1;

            var hex = self.map.GetHexById(position);
            if (typeof hex.mapResources != 'undefined') {
                return null;
            }

            var id = self.mapResources.length + 1;
            var mr = new MapResource({
                "id": id,
                "level": level,
                "resourceName": 'Clover',
                "pos": position,
                "color": '#2C4001',
                "cooldown": 5000,
                "harvestMultiplier": (1.0 / level),
                "nectar": (3 * level),
                "pollen": (2 * level)
            });
            self.mapResources.push(mr);
            hex.mapResource = mr;
            return mr;
        };


        // map generating
        self.generateInitialMap = function() {
            self.map = new Grid({
                MAPWIDTH: 7,
                MAPHEIGHT: 7
            });
            self.setHexSizeByHeight(50);
            self.map.config.canvasLocation = new Point(0, 0);
            // add hives
            self.addHive("G5");
            self.addHive("G9");
            // add water resources
            self.addWaterNode("D6");
            self.addWaterNode("J10");
            self.addWaterNode("E3");
            // add clover resources
            self.addCloverNode("I7", 1);
            self.addCloverNode("H6", 1);
            self.addCloverNode("G11", 1);
            self.addCloverNode("D4", 1);
            self.addCloverNode("B2", 2);
            self.addCloverNode("G13", 2);
            self.addCloverNode("A7", 3);
            self.addCloverNode("E7", 3);
            self.map.config.currentHiveID = self.hives[0].id;
        };

        /**
         * Updates configuration and relocates hexes
         * @param {int} height the size in pixels of each hex
         */
        self.setHexSizeByHeight = function(height) {
            height = height || 30;

            var width = height * (2 / (Math.sqrt(3)));

            //solve quadratic
            var a = -3.0;
            var b = (-2.0 * width);
            var c = (Math.pow(width, 2)) + (Math.pow(height, 2));
            var z = (-b - Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);

            self.map.config.WIDTH = width;
            self.map.config.HEIGHT = height;
            self.map.config.SIDE = z;
            self.map.Relocate();
            self.map.config.canvasSize = calcCanvasSize();

            // update state
            state.mapconfig = self.map.config;

            // return the new config
            return self.map.config;

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
            self.map.config.canvasSize = calcCanvasSize();

            // update state
            state.mapconfig = self.map.config;

            // return the new config
            return self.map.config;
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

        function drawResources(context) {
            for (var i = 0; i < self.mapResources.length; i++) {
                var node = self.mapResources[i];
                var hex = self.map.GetHexById(node.pos);

                context.fillStyle = node.color;
                context.beginPath();
                context.arc(hex.MidPoint.X, hex.MidPoint.Y, self.map.config.HEIGHT * 0.3, 0, 2 * Math.PI);
                context.closePath();
                context.fill();
                context.lineWidth = 2;
                context.strokeStyle = 'black';
                context.stroke();
            }
        }

        function drawHives(context) {
            for (var i = 0; i < self.hives.length; i++) {
                var hive = self.hives[i];
                var hex = self.map.GetHexById(hive.pos);
                var id = 'H' + hive.id;
                context.fillStyle = hive.id === self.map.config.currentHiveID ? 'yellow' : 'grey';
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
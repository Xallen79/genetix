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
            if (!angular.isDefined(loadState.currentHiveID))
                state.currentHiveID = hiveService.hives[0].id;
            if (!angular.isDefined(loadState.selectedHexID))
                state.selectedHexID = undefined;
            if (!angular.isDefined(loadState.map))
                state.map = new Grid(5, 10);

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
            var hex = state.map.GetHexAt(p);
            var oldhex = state.map.GetHexById(state.selectedHexID);

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
            //drawHives(context);
        };


        // canvas drawing
        function clear(context) {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }

        function drawHexes(context) {
            for (var h in state.map.Hexes) {
                state.map.Hexes[h].draw(context);
            }
        }

        function drawHives(context) {
            for (var i = 0; i < state.hives.length; i++) {
                var hive = state.hives[i];
                var hex = state.map.GetHexById(hive.pos);
                var id = 'H' + hive.id;
                context.fillStyle = hive.id === state.currentHiveID ? 'yellow' : 'grey';
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




















    }
]);
/* global angular */
var game = angular.module('bloqhead.genetixApp');

game.component('bloqheadMap', {
    templateUrl: 'components/map/map.html',
    controller: 'bloqhead.controllers.map',
    bindings: {}
});

game.controller('bloqhead.controllers.map', [
    '$scope', '$rootScope', '$timeout', '$filter', '$q', 'mapService',
    function($scope, $rootScope, $timeout, $filter, $q, mapService) {
        var self = this;
        var canvas, context;
        var hexsize_min = 20;
        var hexsize_max = 160;
        var imageList = [
            'bee.svg',
            'bee-2.svg',
            'egg.svg',
            'honeypot.svg',
            'larva.svg',
            'nectar.svg',
            'nectar2.svg',
            'pollen.svg',
            'tombstone.svg'
        ];


        self.loadPercent = 0;
        self.mapService = mapService;
        self.needsResize = true; // set to true to resize the canvas in the draw routine        

        self.$onInit = function() {};
        self.$postLink = function() {

            self.loadImages(imageList).then(
                function(images) {
                    self.images = images;
                    self.setupCanvas();
                },
                function(err) {
                    console.error(err);
                },
                function(percent) {
                    self.loadPercent = percent;
                }
            );

        };

        self.setupCanvas = function() {

            // create canvas
            canvas = document.getElementById('map');

            // create context
            context = canvas.getContext('2d');

            // add mouse events
            canvas.parentElement.addEventListener('mousewheel', self.mousewheel, false);
            canvas.parentElement.addEventListener('mousedown', self.mousedown, false);
            document.addEventListener('mouseup', self.mouseup, false);
            canvas.addEventListener('click', self.click, false);

            // add mapService event hooks
            mapService.SubscribeMapInitializedEvent($scope, initializeMap);
            mapService.SubscribeMapUpdateEvent($scope, draw);

            // redraw the map after its been shown
            self.setHexSize(self.mapconfig.HEIGHT);
        };

        self.loadImages = function(imageNames) {

            var deferred = $q.defer();
            var promises = [];
            var loadCount = 0;

            angular.forEach(imageNames, function(imageName) {
                var d = $q.defer();
                // some closure
                (function() {
                    var img = $(new Image(100, 100)).on('load', function() {
                        loadCount++;
                        deferred.notify(Math.ceil(loadCount / imageNames.length * 100));
                        d.resolve({
                            name: imageName,
                            image: img
                        });
                    }).prop('src', 'images/map/' + imageName);
                })();
                promises.push(d.promise);
            });

            $q.all(promises).then(
                function(data) {
                    var response = {};
                    for (var i = 0; i < data.length; i++) {
                        response[data[i].name] = data[i].image;
                    }
                    deferred.resolve(response);
                },
                function(err) {
                    deferred.reject(err);
                }
            );

            return deferred.promise;
        };



        // mouse events
        self.mousewheel = function(event) {
            if (event.wheelDeltaY > 0)
                self.zoomIn();
            if (event.wheelDeltaY < 0)
                self.zoomOut();
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

        self.zoomIn = function() {
            if (self.mapconfig.HEIGHT < hexsize_max)
                self.setHexSize(self.mapconfig.HEIGHT * 1.1);
        };
        self.zoomOut = function() {
            if (self.mapconfig.HEIGHT > hexsize_min)
                self.setHexSize(self.mapconfig.HEIGHT / 1.1);
        };
        self.resetZoom = function() {
            // this should probably be coded to center the map
            self.setHexSize(50);
            self.moveCanvas(0, 0);
            self.dontTranslate = true;
        };


        self.moveCanvas = function(x, y) {
            canvas.style.left = x + 'px';
            canvas.style.top = y + 'px';
            self.mapService.mapMoved(x, y);
        };

        self.moveCanvasBy = function(x, y) {
            var l = parseFloat(canvas.style.left) + x;
            var t = parseFloat(canvas.style.top) + y;
            self.moveCanvas(l, t);
        };


        self.setHexSize = function(size) {
            self.mapconfig = mapService.setHexSizeByHeight(size);
            self.needsResize = true;
        };


        function initializeMap(event, config) {
            self.mapconfig = config;
            if (self.mapconfig.canvasSize) {
                resizeCanvas();
            }

            if (self.mapconfig.canvasLocation) {
                self.moveCanvas(self.mapconfig.canvasLocation.X, self.mapconfig.canvasLocation.Y);

            } else {
                self.moveCanvas(0, 0);
            }
        }


        function draw() {
            if (typeof canvas === 'undefined' || typeof context === 'undefined')
                return;

            if (self.needsResize) {
                self.needsResize = false;
                resizeCanvas();
            }

            mapService.drawMap(context);
        }

        function resizeCanvas() {

            var old_w = parseFloat(canvas.style.width);
            var old_h = parseFloat(canvas.style.height);

            canvas.style.width = self.mapconfig.canvasSize.X + 'px';
            canvas.style.height = self.mapconfig.canvasSize.Y + 'px';
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;

            old_w = old_w || self.mapconfig.canvasSize.X;
            old_h = old_h || self.mapconfig.canvasSize.Y;

            var tran_x = parseInt((0 - (self.mapconfig.canvasSize.X - old_w)) / 2);
            var tran_y = parseInt((0 - (self.mapconfig.canvasSize.Y - old_h)) / 2);

            if (!self.dontTranslate) {
                // move the map if we need to translate it
                if (tran_x !== 0 || tran_y !== 0)
                    self.moveCanvasBy(tran_x, tran_y);
            }
            self.dontTranslate = false;
        }
    }
]);
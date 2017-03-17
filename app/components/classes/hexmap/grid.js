var game = angular.module('bloqhead.genetixApp');



game.factory('Grid', ['Hexagon', function(Hexagon) {

    /**
     * A Grid is the model of the playfield containing hexes
     * @constructor
     */
    var Grid = function( /*int*/ width, /*int*/ height, config) {

        this.config = config || {};
        this.config.HEIGHT = this.config.HEIGHT || 91.14378277661477;
        this.config.WIDTH = this.config.WIDTH || 91.14378277661477;
        this.config.SIDE = this.config.SIDE || 50.0;
        this.config.MARGIN = this.config.MARGIN || 5;


        this.Hexes = [];
        //setup a dictionary for use later for assigning the X or Y CoOrd (depending on Orientation)
        var HexagonsByXOrYCoOrd = {}; //Dictionary<int, List<Hexagon>>

        var row = 0;
        var y = 0.0;
        while (row <= height) {
            var col = 0;

            var offset = 0.0;
            if (row % 2 == 1) {
                offset = (this.config.WIDTH - this.config.SIDE) / 2 + this.config.SIDE;
                col = 1;
            }

            var x = offset;
            while (col <= width) {
                var hexId = this.GetHexId(row, col);
                //var h = new Hexagon(hexId, x, y, this.config);
                var h = new Hexagon(hexId, col, row, this.config);

                var pathCoOrd = col;
                h.PathCoOrdX = col; //the column is the x coordinate of the hex, for the y coordinate we need to get more fancy

                this.Hexes.push(h);

                if (!HexagonsByXOrYCoOrd[pathCoOrd])
                    HexagonsByXOrYCoOrd[pathCoOrd] = [];
                HexagonsByXOrYCoOrd[pathCoOrd].push(h);

                col += 2;
                x += this.config.WIDTH + this.config.SIDE;
            }
            row++;
            y += this.config.HEIGHT / 2;
        }

        //finally go through our list of hexagons by their x co-ordinate to assign the y co-ordinate
        for (var coOrd1 in HexagonsByXOrYCoOrd) {
            var hexagonsByXOrY = HexagonsByXOrYCoOrd[coOrd1];
            var coOrd2 = Math.floor(coOrd1 / 2) + (coOrd1 % 2);
            for (var i in hexagonsByXOrY) {
                var h2 = hexagonsByXOrY[i]; //Hexagon
                h2.PathCoOrdY = coOrd2++;
            }
        }
    };

    /**
     * Updates configuration and relocates hexes
     * @this {Grid}
     * @param {int} height the size in pixels of each hex
     */
    Grid.prototype.SetHexSizeByHeight = function(height) {
        height = height || 30;
        width = height * (2 / (Math.sqrt(3)));

        var y = height / 2.0;

        //solve quadratic
        var a = -3.0;
        var b = (-2.0 * width);
        var c = (Math.pow(width, 2)) + (Math.pow(height, 2));
        var z = (-b - Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);
        var x = (width - z) / 2.0;

        this.config.WIDTH = width;
        this.config.HEIGHT = height;
        this.config.SIDE = z;

        for (var h in this.Hexes) {
            this.Hexes[h].Relocate(this.config);
        }
    };

    /**
     * Updates configuration and relocates hexes
     * @this {Grid}
     * @param {int} length the length of the side
     * @param {double} ratio the ratio between the the height and width of the hex, omit for perfect hexagon
     */
    Grid.prototype.SetHexSizeBySide = function(length, ratio) {
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

        this.config.WIDTH = width;
        this.config.HEIGHT = height;
        this.config.SIDE = z;

        for (var h in this.Hexes) {
            this.Hexes[h].Relocate(this.config);
        }
    };


    Grid.Static = { Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };

    Grid.prototype.GetHexId = function(row, col) {
        var letterIndex = row;
        var letters = "";
        while (letterIndex > 25) {
            letters = Grid.Static.Letters[letterIndex % 26] + letters;
            letterIndex -= 26;
        }

        return Grid.Static.Letters[letterIndex] + letters + (col + 1);
    };

    /**
     * Returns a hex at a given point
     * @this {Grid}
     * @return {Hexagon}
     */
    Grid.prototype.GetHexAt = function( /*Point*/ p) {
        //find the hex that contains this point
        for (var h in this.Hexes) {
            if (this.Hexes[h].Contains(p)) {
                return this.Hexes[h];
            }
        }

        return null;
    };

    /**
     * Returns a distance between two hexes
     * @this {Grid}
     * @return {number}
     */
    Grid.prototype.GetHexDistance = function( /*Hexagon*/ h1, /*Hexagon*/ h2) {
        //a good explanation of this calc can be found here:
        //http://playtechs.blogspot.com/2007/04/hex-grids.html
        var deltaX = h1.PathCoOrdX - h2.PathCoOrdX;
        var deltaY = h1.PathCoOrdY - h2.PathCoOrdY;
        return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);
    };

    /**
     * Returns a distance between two hexes
     * @this {Grid}
     * @return {Hexagon}
     */
    Grid.prototype.GetHexById = function(id) {
        for (var i in this.Hexes) {
            if (this.Hexes[i].id == id) {
                return this.Hexes[i];
            }
        }
        return null;
    };

    /**
     * Returns the nearest hex to a given point
     * Provided by: Ian (Disqus user: boingy)
     * @this {Grid}
     * @param {Point} p the test point 
     * @return {Hexagon}
     */
    Grid.prototype.GetNearestHex = function( /*Point*/ p) {

        var distance;
        var minDistance = Number.MAX_VALUE;
        var hx = null;

        // iterate through each hex in the grid
        for (var h in this.Hexes) {
            distance = this.Hexes[h].distanceFromMidPoint(p);

            if (distance < minDistance) // if this is the nearest thus far
            {
                minDistance = distance;
                hx = this.Hexes[h];
            }
        }

        return hx;
    };

    return Grid;
}]);
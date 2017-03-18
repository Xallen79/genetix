var game = angular.module('bloqhead.genetixApp');



game.factory('Grid', ['Hexagon', 'Point', function(Hexagon, Point) {


    var Grid = function(config) {
        this.config = config || {};
        this.config.MAPWIDTH = this.config.MAPWIDTH || 8;
        this.config.MAPHEIGHT = this.config.MAPHEIGHT || 5;
        this.config.HEIGHT = this.config.HEIGHT || 91.14378277661477;
        this.config.WIDTH = this.config.WIDTH || 91.14378277661477;
        this.config.SIDE = this.config.SIDE || 50.0;
        this.config.MARGIN = this.config.MARGIN || 5;
        this.config.STROKEWIDTH = this.config.STROKEWIDTH || 3;
        this.config.SHOW_HEX_ID = this.config.SHOW_HEX_ID || false;
        this.config.SHOW_HEX_XY = this.config.SHOW_HEX_XY || false;


        this.Hexes = [];
        //setup a dictionary for use later for assigning the X or Y CoOrd (depending on Orientation)
        var HexagonsByXOrYCoOrd = {}; //Dictionary<int, List<Hexagon>>

        var row = 0;
        var y = 0.0;
        while (row <= (this.config.MAPHEIGHT - 1) * 2) {
            var col = 0;

            var offset = 0.0;
            if (row % 2 == 1) {
                offset = (this.config.WIDTH - this.config.SIDE) / 2 + this.config.SIDE;
                col = 1;
            }

            var x = offset;
            while (col <= (this.config.MAPWIDTH - 1) * 2) {
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
        return this;
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


    Grid.prototype.Relocate = function() {
        for (var h in this.Hexes) {
            this.Hexes[h].Relocate(this.config);
        }
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
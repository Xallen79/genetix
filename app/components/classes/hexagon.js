var game = angular.module('bloqhead.genetixApp');

game.factory('hexMap', function() {
    var HT = HT || {};
    /**
     * A Point is simply x and y coordinates
     * @constructor
     */
    HT.Point = function(x, y) {
        this.X = x;
        this.Y = y;
    };

    /**
     * A Rectangle is x and y origin and width and height
     * @constructor
     */
    HT.Rectangle = function(x, y, width, height) {
        this.X = x;
        this.Y = y;
        this.Width = width;
        this.Height = height;
    };

    /**
     * A Line is x and y start and x and y end
     * @constructor
     */
    HT.Line = function(x1, y1, x2, y2) {
        this.X1 = x1;
        this.Y1 = y1;
        this.X2 = x2;
        this.Y2 = y2;
    };

    /**
     * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
     * @constructor
     */
    HT.Hexagon = function(id, x, y) {
        this.Points = []; //Polygon Base
        var x1 = null;
        var y1 = null;
        if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal) {
            x1 = (HT.Hexagon.Static.WIDTH - HT.Hexagon.Static.SIDE) / 2;
            y1 = (HT.Hexagon.Static.HEIGHT / 2);
            this.Points.push(new HT.Point(x1 + x, y));
            this.Points.push(new HT.Point(x1 + HT.Hexagon.Static.SIDE + x, y));
            this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + y));
            this.Points.push(new HT.Point(x1 + HT.Hexagon.Static.SIDE + x, HT.Hexagon.Static.HEIGHT + y));
            this.Points.push(new HT.Point(x1 + x, HT.Hexagon.Static.HEIGHT + y));
            this.Points.push(new HT.Point(x, y1 + y));
        } else {
            x1 = (HT.Hexagon.Static.WIDTH / 2);
            y1 = (HT.Hexagon.Static.HEIGHT - HT.Hexagon.Static.SIDE) / 2;
            this.Points.push(new HT.Point(x1 + x, y));
            this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + y));
            this.Points.push(new HT.Point(HT.Hexagon.Static.WIDTH + x, y1 + HT.Hexagon.Static.SIDE + y));
            this.Points.push(new HT.Point(x1 + x, HT.Hexagon.Static.HEIGHT + y));
            this.Points.push(new HT.Point(x, y1 + HT.Hexagon.Static.SIDE + y));
            this.Points.push(new HT.Point(x, y1 + y));
        }

        this.id = id;

        this.x = x;
        this.y = y;
        this.x1 = x1;
        this.y1 = y1;

        this.TopLeftPoint = new HT.Point(this.x, this.y);
        this.BottomRightPoint = new HT.Point(this.x + HT.Hexagon.Static.WIDTH, this.y + HT.Hexagon.Static.HEIGHT);
        this.MidPoint = new HT.Point(this.x + (HT.Hexagon.Static.WIDTH / 2), this.y + (HT.Hexagon.Static.HEIGHT / 2));

        this.P1 = new HT.Point(x + x1, y + y1);

        this.selected = false;
    };

    /**
     * draws this Hexagon to the canvas
     * @this {HT.Hexagon}
     */
    HT.Hexagon.prototype.draw = function(ctx) {

        if (this.selected)
            ctx.fillStyle = "#7283BA";
        else
            ctx.fillStyle = "#EDC867";

        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.Points[0].X, this.Points[0].Y);
        for (var i = 1; i < this.Points.length; i++) {
            var p = this.Points[i];
            ctx.lineTo(p.X, p.Y);
        }
        ctx.closePath();

        ctx.stroke();
        ctx.fill();


        if (this.id) {
            //draw text for debugging
            ctx.fillStyle = "black";
            ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            //var textWidth = ctx.measureText(this.Planet.BoundingHex.id);
            ctx.fillText(this.id, this.MidPoint.X, this.MidPoint.Y);
        }
        /*
        if (this.PathCoOrdX !== null && this.PathCoOrdY !== null && typeof(this.PathCoOrdX) != "undefined" && typeof(this.PathCoOrdY) != "undefined") {
            //draw co-ordinates for debugging
            ctx.fillStyle = "black";
            ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            //var textWidth = ctx.measureText(this.Planet.BoundingHex.id);
            ctx.fillText("(" + this.PathCoOrdX + "," + this.PathCoOrdY + ")", this.MidPoint.X, this.MidPoint.Y + 10);
        }
        */
        if (HT.Hexagon.Static.DRAWSTATS) {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            //draw our x1, y1, and z
            ctx.beginPath();
            ctx.moveTo(this.P1.X, this.y);
            ctx.lineTo(this.P1.X, this.P1.Y);
            ctx.lineTo(this.x, this.P1.Y);
            ctx.closePath();
            ctx.stroke();

            ctx.fillStyle = "black";
            ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
            ctx.textAlign = "left";
            ctx.textBaseline = 'middle';
            //var textWidth = ctx.measureText(this.Planet.BoundingHex.id);
            ctx.fillText("z", this.x + this.x1 / 2 - 8, this.y + this.y1 / 2);
            ctx.fillText("x", this.x + this.x1 / 2, this.P1.Y + 10);
            ctx.fillText("y", this.P1.X + 2, this.y + this.y1 / 2);
            ctx.fillText("z = " + HT.Hexagon.Static.SIDE, this.P1.X, this.P1.Y + this.y1 + 10);
            ctx.fillText("(" + this.x1.toFixed(2) + "," + this.y1.toFixed(2) + ")", this.P1.X, this.P1.Y + 10);
        }
    };

    /**
     * Returns true if the x,y coordinates are inside this hexagon
     * @this {HT.Hexagon}
     * @return {boolean}
     */
    HT.Hexagon.prototype.isInBounds = function(x, y) {
        return this.Contains(new HT.Point(x, y));
    };


    /**
     * Returns true if the point is inside this hexagon, it is a quick contains
     * @this {HT.Hexagon}
     * @param {HT.Point} p the test point
     * @return {boolean}
     */
    HT.Hexagon.prototype.isInHexBounds = function( /*Point*/ p) {
        if (this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
            p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
            return true;
        return false;
    };

    //grabbed from:
    //http://www.developingfor.net/c-20/testing-to-see-if-a-point-is-within-a-polygon.html
    //and
    //http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html#The%20C%20Code
    /**
     * Returns true if the point is inside this hexagon, it first uses the quick isInHexBounds contains, then check the boundaries
     * @this {HT.Hexagon}
     * @param {HT.Point} p the test point
     * @return {boolean}
     */
    HT.Hexagon.prototype.Contains = function( /*Point*/ p) {
        var isIn = false;
        if (this.isInHexBounds(p)) {
            //turn our absolute point into a relative point for comparing with the polygon's points
            //var pRel = new HT.Point(p.X - this.x, p.Y - this.y);
            var i, j = 0;
            for (i = 0, j = this.Points.length - 1; i < this.Points.length; j = i++) {
                var iP = this.Points[i];
                var jP = this.Points[j];
                if (
                    (
                        ((iP.Y <= p.Y) && (p.Y < jP.Y)) ||
                        ((jP.Y <= p.Y) && (p.Y < iP.Y))
                        //((iP.Y > p.Y) != (jP.Y > p.Y))
                    ) &&
                    (p.X < (jP.X - iP.X) * (p.Y - iP.Y) / (jP.Y - iP.Y) + iP.X)
                ) {
                    isIn = !isIn;
                }
            }
        }
        return isIn;
    };

    /**
     * Returns absolute distance in pixels from the mid point of this hex to the given point
     * Provided by: Ian (Disqus user: boingy)
     * @this {HT.Hexagon}
     * @param {HT.Point} p the test point
     * @return {number} the distance in pixels
     */
    HT.Hexagon.prototype.distanceFromMidPoint = function( /*Point*/ p) {
        // Pythagoras' Theorem: Square of hypotenuse = sum of squares of other two sides
        var deltaX = this.MidPoint.X - p.X;
        var deltaY = this.MidPoint.Y - p.Y;

        // squaring so don't need to worry about square-rooting a negative number 
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    };

    HT.Hexagon.Orientation = {
        Normal: 0,
        Rotated: 1
    };

    HT.Hexagon.Static = {
        HEIGHT: 91.14378277661477,
        WIDTH: 91.14378277661477,
        SIDE: 50.0,
        ORIENTATION: HT.Hexagon.Orientation.Normal,
        DRAWSTATS: false
    }; //hexagons will have 25 unit sides for now

    /**
     * A Grid is the model of the playfield containing hexes
     * @constructor
     */
    HT.Grid = function( /*double*/ width, /*double*/ height) {

        this.Hexes = [];
        //setup a dictionary for use later for assigning the X or Y CoOrd (depending on Orientation)
        var HexagonsByXOrYCoOrd = {}; //Dictionary<int, List<Hexagon>>

        var row = 0;
        var y = 0.0;
        while (y + HT.Hexagon.Static.HEIGHT <= height) {
            var col = 0;

            var offset = 0.0;
            if (row % 2 == 1) {
                if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal)
                    offset = (HT.Hexagon.Static.WIDTH - HT.Hexagon.Static.SIDE) / 2 + HT.Hexagon.Static.SIDE;
                else
                    offset = HT.Hexagon.Static.WIDTH / 2;
                col = 1;
            }

            var x = offset;
            while (x + HT.Hexagon.Static.WIDTH <= width) {
                var hexId = this.GetHexId(row, col);
                var h = new HT.Hexagon(hexId, x, y);

                var pathCoOrd = col;
                if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal)
                    h.PathCoOrdX = col; //the column is the x coordinate of the hex, for the y coordinate we need to get more fancy
                else {
                    h.PathCoOrdY = row;
                    pathCoOrd = row;
                }

                this.Hexes.push(h);

                if (!HexagonsByXOrYCoOrd[pathCoOrd])
                    HexagonsByXOrYCoOrd[pathCoOrd] = [];
                HexagonsByXOrYCoOrd[pathCoOrd].push(h);

                col += 2;
                if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal)
                    x += HT.Hexagon.Static.WIDTH + HT.Hexagon.Static.SIDE;
                else
                    x += HT.Hexagon.Static.WIDTH;
            }
            row++;
            if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal)
                y += HT.Hexagon.Static.HEIGHT / 2;
            else
                y += (HT.Hexagon.Static.HEIGHT - HT.Hexagon.Static.SIDE) / 2 + HT.Hexagon.Static.SIDE;
        }

        //finally go through our list of hexagons by their x co-ordinate to assign the y co-ordinate
        for (var coOrd1 in HexagonsByXOrYCoOrd) {
            var hexagonsByXOrY = HexagonsByXOrYCoOrd[coOrd1];
            var coOrd2 = Math.floor(coOrd1 / 2) + (coOrd1 % 2);
            for (var i in hexagonsByXOrY) {
                var h2 = hexagonsByXOrY[i]; //Hexagon
                if (HT.Hexagon.Static.ORIENTATION == HT.Hexagon.Orientation.Normal)
                    h2.PathCoOrdY = coOrd2++;
                else
                    h2.PathCoOrdX = coOrd2++;
            }
        }
    };

    HT.Grid.Static = { Letters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' };

    HT.Grid.prototype.GetHexId = function(row, col) {
        var letterIndex = row;
        var letters = "";
        while (letterIndex > 25) {
            letters = HT.Grid.Static.Letters[letterIndex % 26] + letters;
            letterIndex -= 26;
        }

        return HT.Grid.Static.Letters[letterIndex] + letters + (col + 1);
    };

    /**
     * Returns a hex at a given point
     * @this {HT.Grid}
     * @return {HT.Hexagon}
     */
    HT.Grid.prototype.GetHexAt = function( /*Point*/ p) {
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
     * @this {HT.Grid}
     * @return {number}
     */
    HT.Grid.prototype.GetHexDistance = function( /*Hexagon*/ h1, /*Hexagon*/ h2) {
        //a good explanation of this calc can be found here:
        //http://playtechs.blogspot.com/2007/04/hex-grids.html
        var deltaX = h1.PathCoOrdX - h2.PathCoOrdX;
        var deltaY = h1.PathCoOrdY - h2.PathCoOrdY;
        return ((Math.abs(deltaX) + Math.abs(deltaY) + Math.abs(deltaX - deltaY)) / 2);
    };

    /**
     * Returns a distance between two hexes
     * @this {HT.Grid}
     * @return {HT.Hexagon}
     */
    HT.Grid.prototype.GetHexById = function(id) {
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
     * @this {HT.Grid}
     * @param {HT.Point} p the test point 
     * @return {HT.Hexagon}
     */
    HT.Grid.prototype.GetNearestHex = function( /*Point*/ p) {

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

    HT.findHexWithSideLengthZAndRatio = function(length, ratio) {
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

        HT.Hexagon.Static.WIDTH = width;
        HT.Hexagon.Static.HEIGHT = height;
        HT.Hexagon.Static.SIDE = z;
    };
    HT.findHexByHeight = function(height) {
        height = height || 30;
        width = height * (2 / (Math.sqrt(3)));

        var y = height / 2.0;

        //solve quadratic
        var a = -3.0;
        var b = (-2.0 * width);
        var c = (Math.pow(width, 2)) + (Math.pow(height, 2));
        var z = (-b - Math.sqrt(Math.pow(b, 2) - (4.0 * a * c))) / (2.0 * a);
        var x = (width - z) / 2.0;

        HT.Hexagon.Static.WIDTH = width;
        HT.Hexagon.Static.HEIGHT = height;
        HT.Hexagon.Static.SIDE = z;
    };

    return HT;
});
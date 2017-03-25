var game = angular.module('bloqhead.genetixApp');

game.factory('Hexagon', ['Point', function(Point) {



    /**
     * A Hexagon is a 6 sided polygon, our hexes don't have to be symmetrical, i.e. ratio of width to height could be 4 to 3
     * @constructor
     */
    var Hexagon = function(id, col, row, config) {

        // hexagons are only created by the grid, so config should never be unset... but just in case....
        var c = config || {
            HEIGHT: 91.14378277661477,
            WIDTH: 91.14378277661477,
            SIDE: 50.0
        };


        this.config = config;
        this.id = id;
        this.col = col;
        this.row = row;
        this.selected = false;
        this.inRange = false;
        this.Relocate(c);
    };

    /**
     * Recalculates point locations using specified configuration
     */
    Hexagon.prototype.Relocate = function(config) {

        this.config = config;

        var x = ((this.col) * (config.WIDTH + config.SIDE / 2)) - ((this.col * config.WIDTH) / 2);
        var y = this.row * (config.HEIGHT / 2);
        var x1 = (config.WIDTH - config.SIDE) / 2;
        var y1 = (config.HEIGHT / 2);

        if (config.MARGIN) {
            x += config.MARGIN;
            y += config.MARGIN;
        }

        this.Points = []; //Polygon Base
        this.Points.push(new Point(x1 + x, y));
        this.Points.push(new Point(x1 + config.SIDE + x, y));
        this.Points.push(new Point(config.WIDTH + x, y1 + y));
        this.Points.push(new Point(x1 + config.SIDE + x, config.HEIGHT + y));
        this.Points.push(new Point(x1 + x, config.HEIGHT + y));
        this.Points.push(new Point(x, y1 + y));

        this.TopLeftPoint = new Point(x, y);
        this.BottomRightPoint = new Point(x + config.WIDTH, y + config.HEIGHT);
        this.MidPoint = new Point(x + (config.WIDTH / 2), y + (config.HEIGHT / 2));
    };



    /**
     * draws this Hexagon to the canvas
     * @this {Hexagon}
     */
    Hexagon.prototype.draw = function(ctx) {

        if (this.selected)
            ctx.fillStyle = "#7283BA";
        else if (this.inRange)
            ctx.fillStyle = "tomato"; // love this color
        else
            ctx.fillStyle = "#EDC867";

        ctx.strokeStyle = "black";
        ctx.lineWidth = this.config.STROKEWIDTH;
        ctx.beginPath();
        ctx.moveTo(this.Points[0].X, this.Points[0].Y);
        for (var i = 1; i < this.Points.length; i++) {
            var p = this.Points[i];
            ctx.lineTo(p.X, p.Y);
        }
        ctx.closePath();
        ctx.fill();

        // inside stroke
        /*
        ctx.save();
        ctx.clip();
        ctx.lineWidth *= 2;
        ctx.stroke();
        ctx.restore();
        */
        ctx.stroke();



        if (this.id && (this.config.SHOW_HEX_ID || this.config.SHOW_HEX_XY)) {
            //draw text for debugging
            ctx.fillStyle = "black";
            ctx.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = 'middle';
            //var textWidth = ctx.measureText(this.Planet.BoundingHex.id);
            var msg = '';
            if (this.config.SHOW_HEX_ID) msg += this.id + ' ';
            if (this.config.SHOW_HEX_XY) msg += this.row + ',' + this.col;
            ctx.fillText(msg, this.MidPoint.X, this.MidPoint.Y);
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
        /*
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
        */
    };

    /**
     * Returns true if the x,y coordinates are inside this hexagon
     * @this {Hexagon}
     * @return {boolean}
     */
    Hexagon.prototype.isInBounds = function(x, y) {
        return this.Contains(new Point(x, y));
    };


    /**
     * Returns true if the point is inside this hexagon, it is a quick contains
     * @this {Hexagon}
     * @param {Point} p the test point
     * @return {boolean}
     */
    Hexagon.prototype.isInHexBounds = function( /*Point*/ p) {
        if (this.TopLeftPoint.X < p.X && this.TopLeftPoint.Y < p.Y &&
            p.X < this.BottomRightPoint.X && p.Y < this.BottomRightPoint.Y)
            return true;
        return false;
    };

    /**
     * Returns true if the point is inside this hexagon, it first uses the quick isInHexBounds contains, then check the boundaries
     * @this {Hexagon}
     * @param {Point} p the test point
     * @return {boolean}
     */
    Hexagon.prototype.Contains = function( /*Point*/ p) {
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
     * @this {Hexagon}
     * @param {Point} p the test point
     * @return {number} the distance in pixels
     */
    Hexagon.prototype.distanceFromMidPoint = function( /*Point*/ p) {
        // Pythagoras' Theorem: Square of hypotenuse = sum of squares of other two sides
        var deltaX = this.MidPoint.X - p.X;
        var deltaY = this.MidPoint.Y - p.Y;

        // squaring so don't need to worry about square-rooting a negative number 
        return Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
    };



    return Hexagon;
}]);
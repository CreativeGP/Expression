"use strict";

/**
 *  ___    __  __  ___ __  __   __      
 * |__ \_/|__)|__)|__ /__`/__`|/  \|\ | 
 * |___/ \|   |  \|___.__/.__/|\__/| \| 
 * 
 * Online math expression analyzer. Experience demo at http://cgp.php.xdomain.jp/lab/expr/
 * 
 * https://github.com/CreativeGP/Expression
 * (C) 2017 CGP.
*/

/*
 * graph.js - Expression
 * 
 * REQUIRED `jQuery` AND `Selfgaf`!
 * 
 * 2017/11/25 (yyyy/mm/dd)
 * Wrote by @CreativeGP1
*/


var Coordinate_Plane = function (object, width, height) {
    this.width = width;
    this.height = height;
    this.gaf = new Gaf(object);
}
Coordinate_Plane.prototype.hide =
    () => { object.css("display", "none"); }
Coordinate_Plane.prototype.show =
    () => { object.css("display", "block"); }

Coordinate_Plane.prototype.draw = function () {
    this.gaf.draw_rectangle(this.width/2, 0, 1, this.height);
    this.gaf.draw_rectangle(0, this.height/2, this.width, 1);
}


const Graph = function (cp, expr) {
    this.cp = cp;
    this.expr = expr;
}
Graph.prototype.draw = function (color="blue") {
    let px, py;
    for (let i = -150; i < 150; i++) {
	const x = i+150;
	const y = 150 - this.expr.evaluate({ x: x-150 });
	if (0 <= x <= 300 && 0 <= y && y <= 300)
	    this.cp.gaf.draw_point(x, y, color);
    }
}






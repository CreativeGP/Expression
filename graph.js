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

// 座標平面クラス
var Coordinate_Plane = function (object, width, height) {
    this.width = width;
    this.height = height;
    if (gaf)
	this.gaf = new Gaf(object, width, height);
}
Coordinate_Plane.prototype.hide =
    () => { object.css("display", "none"); }
Coordinate_Plane.prototype.show =
    () => { object.css("display", "block"); }

Coordinate_Plane.prototype.draw = function () {
    if (this.gaf) {
	this.gaf.draw_rectangle(this.width/2, 0, 1, this.height);
	this.gaf.draw_rectangle(0, this.height/2, this.width, 1);
    }
}


// グラフ（線）クラス
var Graph = function (cp, expr) {
    this.cp = cp;
    this.expr = expr;
}
Graph.prototype.draw = function (color="blue") {
    let px, py;
    for (let i = -this.cp.width/2; i < this.cp.width/2; i++) {
	const x = i+this.cp.width/2;
	const y = this.cp.height/2 - this.expr.evaluate({ x: x-this.cp.width/2 });
	if (0 <= x <= this.cp.width && 0 <= y && y <= this.cp.width) {
	    if (this.cp.gaf) this.cp.gaf.draw_point(x, y, color);
	}
    }
}

Graph.prototype.set_trace_point = function (color="red") {
    // Put red point according to the movement of the mouse.
    let old = null;
    let old2 = null;
    let self = this;
    let parent;
    if (this.cp.gaf) parent = this.cp.gaf.root.parent();
    parent.unbind('mousemove');
    parent.mousemove((e) => {
    	let x = Math.floor(e.pageX)-Math.floor(parent.offset().left);
    	let y = Math.floor(e.pageY)-Math.floor(parent.offset().top);
    	let elmx = x;
    	let elmy = self.cp.height/2 - self.expr.evaluate({ x: x-self.cp.width/2 });
    	if (old) {
    	    old.remove();
    	    old = null;
    	}
    	if (old2) {
    	    old2.remove();
    	    old2 = null;
    	}
	if (self.cp.gaf) {
    	    if (0 < elmy && elmy < self.cp.height)
    		old = self.cp.gaf.draw_letter(elmx, elmy, "("+(elmx-self.cp.width/2)+","+(self.cp.height/2-elmy)+")");
    	    else
    		old = self.cp.gaf.draw_letter(elmx, 0, "("+(elmx-self.cp.width/2)+","+(self.cp.height/2-elmy)+")");
    	    if (0 < elmy && elmy < self.cp.height)
    		old2 = self.cp.gaf.draw_ellipse(elmx, elmy, 5, 5, color);
	}
    });
}


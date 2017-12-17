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
    else {
	// Create a Pixi Application and set up
	// Usually WebGL is used
	this.pixiapp = new PIXI.Application({
	    width: this.width,
	    height: this.height,
	});
	this.pixiapp.renderer.backgroundColor = 0xCCCCCC;

	// Add the canvas that Pixi automatically created for you to the HTML document
	document.getElementById("graph-wrapper").appendChild(this.pixiapp.view);
    }
}
Coordinate_Plane.prototype.hide =
    () => { object.css("display", "none"); }
Coordinate_Plane.prototype.show =
    () => { object.css("display", "block"); }

Coordinate_Plane.prototype.draw = function () {
    if (this.gaf) {
	this.gaf.draw_rectangle(this.width/2, 0, 1, this.height);
	this.gaf.draw_rectangle(0, this.height/2, this.width, 1);
    } else {
	// Create Pixi.Graphics object to draw two axes, X and Y, to this coordinate plane.
	let horizontal = new PIXI.Graphics();
	horizontal.lineStyle(1, 0, 1);
	horizontal.moveTo(this.width/2, 0);
	horizontal.lineTo(this.width/2, this.height);
	this.pixiapp.stage.addChild(horizontal);

	let vertical = new PIXI.Graphics();
	vertical.lineStyle(1, 0, 1);
	vertical.moveTo(0, this.height/2);
	vertical.lineTo(this.width, this.height/2);
	this.pixiapp.stage.addChild(vertical);
    }
}

Coordinate_Plane.prototype.destruct = function () {
    // Remove canvas for Pixi
    this.pixiapp.destroy();
    delete this.pixiapp;
    $("#result canvas").remove();
};


// グラフ（線）クラス
var Graph = function (cp, expr) {
    this.cp = cp;
    this.expr = expr;
}
Graph.prototype.draw = function (color=0x0000FF) {
    let px, py;
    for (let i = -this.cp.width/2; i < this.cp.width/2; i += 0.01) {
	const x = i+this.cp.width/2;
	const y = this.cp.height/2 - this.expr.evaluate({ x: x-this.cp.width/2 });
	let point = new PIXI.Graphics();
	
	if (0 <= x <= this.cp.width && 0 <= y && y <= this.cp.width) {
	    if (this.cp.gaf) this.cp.gaf.draw_point(x, y, color);
	    else {
		// Put a point with Pixi
		point.beginFill(color);
		point.drawCircle(x, y, 1);
		point.endFill();
		this.cp.pixiapp.stage.addChild(point);
	    }
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
    else parent = $("#result canvas");

    parent.unbind('mousemove');
    parent.mousemove((e) => {
    	let x = Math.floor(e.pageX)-Math.floor(parent.offset().left);
    	let y = Math.floor(e.pageY)-Math.floor(parent.offset().top);
    	let elmx = x;
    	let elmy = self.cp.height/2 - self.expr.evaluate({ x: x-self.cp.width/2 });

	if (!gaf) {
	    if (old) {
		this.cp.pixiapp.stage.removeChild(old);
		old = null;
	    }
	    if (old2) {
		this.cp.pixiapp.stage.removeChild(old2);
		old2 = null;
	    }
	}
	
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
	} else {
	    // Show this coordinate
	    let message = new PIXI.Text("("+(elmx-self.cp.width/2)+","+(self.cp.height/2-elmy)+")",
					{fontSize: 12});
    	    if (0 < elmy && elmy < self.cp.height)
		message.position.set(elmx, elmy);
	    else
		message.position.set(elmx, 0);
    	    this.cp.pixiapp.stage.addChild(message);
	    old = message;

    	    if (0 < elmy && elmy < self.cp.height) {
		let point = new PIXI.Graphics();
		point.beginFill(0xFF0000);
		point.drawCircle(elmx, elmy, 3);
		point.endFill();
		this.cp.pixiapp.stage.addChild(point);
		old2 = point;
	    }
	}

    });
}


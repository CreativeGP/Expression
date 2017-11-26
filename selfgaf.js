/*
CGP Selfgaf - selfgaf.js
11/13/2017 by CreativeGP
*/

// Converts from degrees to radians.
Math.radians = function(degrees) {
    return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
    var deg = radians * 180 / Math.PI;
    deg -= 360;
    deg -= 180;
    if (deg < 0) deg = 360 + deg%360;
    deg = 360 - deg;
    return deg;
};

Math.live_minus = function(x) {
    if (x > 0) x = 0;
    return x;
};

Math.live_plus = function(x) {
    if (x < 0) x = 0;
    return x;
};

function get_random_color() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
	color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

Gaf_2DPoint = function(x, y) {
    this.x = x;
    this.y = y;
}
Gaf_2DPoint.squared_distance = function(p1, p2) {
    var a = p1.x - p2.x;
    var b = p1.y - p2.y;
    return ( a*a + b*b );
}

Gaf_2DPoint.prototype.rotate_by_angle = function(origin, rad) {
    var dist = Gaf_2DPoint.distance(this, origin);
    this.x = Math.cos(rad)*dist + origin.x;
    this.y = -Math.sin(rad)*dist + origin.y;
}

Gaf_2DPoint.prototype.rotate = function(origin, rad) {
    var angle = Gaf_2DPoint.angle(origin, this);
    this.rotate_by_angle(origin, angle+rad);
}

Gaf_2DPoint.distance = function(p1, p2) {
    return Math.sqrt( Gaf_2DPoint.squared_distance( p1, p2 ) );
}

Gaf_2DPoint.angle = function(p1, p2) {
    var radian = Math.atan2( -(p2.y-p1.y), p2.x-p1.x );
    return radian;
}


Gaf_3DPoint = function(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Gaf_VertexMap = function() {
    this.vertices = [];
}

// NOTE: このクラスの良いところは簡単に２Dの配列からx, yの添字に変換できるところ
Gaf_VertexMap.prototype.add_vertices = function(points) {
    for (var i = 0; i < points.length; i++) {
	this.vertices.push(new Gaf_2DPoint(points[i][0], points[i][1]));
    }
}

Gaf_Triangle = function(vermap) {
    if (vermap.vertices.length != 3) {
	throw new Error("The number of vertices is not three."); 
    }
    // X軸方向に見て真ん中の点を探す
    var checklist = [[0,1,2], [1,0,2], [2,1,0]];
    for (var i = 0; i < 3; i++) {
	var check = checklist[i];
	if (false
	    || (vermap.vertices[check[1]].x < vermap.vertices[check[0]].x && vermap.vertices[check[0]].x < vermap.vertices[check[2]].x)
	    || (vermap.vertices[check[2]].x < vermap.vertices[check[0]].x && vermap.vertices[check[0]].x < vermap.vertices[check[1]].x))
	{
	    this.top = vermap.vertices[check[0]];
	    if (vermap.vertices[check[1]].x < vermap.vertices[check[2]].x) {
		this.sub1 = vermap.vertices[check[1]];
		this.sub2 = vermap.vertices[check[2]];
	    } else {
		this.sub1 = vermap.vertices[check[2]];
		this.sub2 = vermap.vertices[check[1]];
	    }
	    break;
	}
    }
}

Gaf = function(root, width=-1, height=-1) {
    this.root = root;
    this.root.html("");
    this.root.css("position", "absolute");
    this.root.parent().css("padding", "0");
    if (width != -1)
	this.root.parent().css("width", width);
    if (height != -1)
	this.root.parent().css("height", height);
    this.entities_count = 0;
};

Gaf.prototype.get_root = function() {
    return this.root;
};

Gaf.prototype.draw_rectangle = function(x, y, w, h) {
    var id = "rect"+this.entities_count;
    this.root.append("<div id='"+id+"'></div>");
    $("#"+id).css("position", "absolute");
    $("#"+id).css("width", w+"px");
    $("#"+id).css("height", h+"px");
    $("#"+id).css("top", y+"px");
    $("#"+id).css("left", x+"px");
    $("#"+id).css("background-color", "black");
    ++this.entities_count;
};

Gaf.prototype.draw_ellipse = function(x, y, w, h, col="black") {
    var id = "rect"+this.entities_count;
    this.root.append("<div id='"+id+"'></div>");
    $("#"+id).css("position", "absolute");
    $("#"+id).css("width", w+"px");
    $("#"+id).css("height", h+"px");
    $("#"+id).css("top", y+"px");
    $("#"+id).css("left", x+"px");
    $("#"+id).css("border-radius", w/2+"px / " + h/2+"px");
    $("#"+id).css("-moz-border-radius", w/2+"px / " + h/2+"px");
    $("#"+id).css("-webkit-border-radius", w/2+"px / " + h/2+"px");
    $("#"+id).css("background-color", col);
    ++this.entities_count;
    return $("#"+id);
};

Gaf.prototype.draw_triangle = function(shape, angle=0, col="black") {
    var x = shape.sub1.x;
    var y = shape.sub1.y + Math.live_minus(shape.top.y-shape.sub1.y);
    var left = shape.top.x-shape.sub1.x;
    var right = shape.sub2.x-shape.top.x;
    var top;
    var bottom;
    var transform_origin;
    if (shape.top.y-shape.sub1.y > 0) {
	top = shape.top.y-shape.sub1.y;
	bottom = 0;
	transform_origin = "0 0";
    } else {
	top = 0;
	bottom = shape.sub1.y-shape.top.y;
	transform_origin = "0 100%";
    }
    var id = "tri"+this.entities_count;
    this.root.append("<div id='"+id+"'></div>");
    $("#"+id).css("position", "absolute");
    $("#"+id).css("width", "0");
    $("#"+id).css("height", "0");
    $("#"+id).css("top", y+"px");
    $("#"+id).css("left", x+"px");
    $("#"+id).css("border-top", top+"px solid "+col);
    $("#"+id).css("border-bottom", bottom+"px solid "+col);
    $("#"+id).css("border-right", right+"px solid transparent");
    $("#"+id).css("border-left", left+"px solid transparent");
    $("#"+id).css("transform", "rotate("+ angle+"rad)");
    $("#"+id).css("transform-origin", transform_origin);
    ++this.entities_count;
    return $("#"+id);
};

Gaf.prototype.draw_point = function(x, y, col="black") {
    return this.draw_ellipse(x, y, 3, 3, col);
};

Gaf.prototype.draw_points = function(vermap, col="black") {
    for (var i = 0; i < vermap.vertices.length; i++) {
	this.draw_point(vermap.vertices[i].x, vermap.vertices[i].y, col);
    }
};

Gaf.prototype.draw_letter = function(x, y, str, col="black") {
    var id = "letter"+this.entities_count;
    this.root.append("<span id='"+id+"'></span>");
    $("#"+id).css("position", "absolute");
    $("#"+id).css("top", y+"px");
    $("#"+id).css("left", x+"px");
    $("#"+id).css("color", col);
    $("#"+id).html(str);
    ++this.entities_count;
    return $("#"+id);
};

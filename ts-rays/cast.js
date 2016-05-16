// typescript implementation of https://github.com/derkyjadex/elm-rays/blob/master/Main.elm
var rayColor = '#cc0000';
var polygonColor = '#fce94f';
function degrees(degree) {
    return degree / 180 * Math.PI;
}
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var Vector = (function () {
    function Vector(length, angle) {
        this.length = length;
        this.angle = angle;
    }
    Vector.prototype.asCartesian = function () {
        var x = this.length * Math.cos(this.angle);
        var y = this.length * Math.sin(this.angle);
        return new Point(x, y);
    };
    Vector.prototype.adjust = function (delta) {
        return new Vector(this.length, this.angle + delta);
    };
    Vector.pointsToVector = function (p1, p2) {
        var dx = p2.x - p1.x;
        var dy = p2.y - p1.y;
        var length = Math.sqrt(dx * dx + dy * dy);
        var angle = Math.atan2(dy, dx);
        return new Vector(length, angle);
    };
    return Vector;
}());
var Line = (function () {
    function Line(position, vector) {
        this.position = position;
        this.vector = vector;
    }
    Line.prototype.end = function () {
        var p = this.vector.asCartesian();
        return new Point(this.position.x + p.x, this.position.y + p.y);
    };
    Line.prototype.adjust = function (delta) {
        return new Line(this.position, this.vector.adjust(delta));
    };
    Line.prototype.norms = function () {
        return new Point(Math.cos(this.vector.angle), Math.sin(this.vector.angle));
    };
    Line.pointsToLine = function (p1, p2) {
        return new Line(p1, Vector.pointsToVector(p1, p2));
    };
    return Line;
}());
function intersect(r, s) {
    var rp = r.position;
    var sp = s.position;
    var rd = r.norms();
    var sd = s.norms();
    var sm = (rp.x * rd.y - rp.y * rd.x + sp.y * rd.x - sp.x * rd.y) / (sd.x * rd.y - sd.y * rd.x);
    var rm = (sp.x - rp.x + sd.x * sm) / rd.x;
    if (isNaN(sm) || isNaN(rm) || sm < 0 || s.vector.length < sm || rm < 0)
        return null;
    return new Line(r.position, new Vector(rm, r.vector.angle));
}
function toRays(pos, line) {
    var rayToStart = Line.pointsToLine(pos, line.position);
    var rayToEnd = Line.pointsToLine(pos, line.end());
    return [rayToStart.adjust(degrees(0.5)), rayToStart.adjust(degrees(-0.5)),
        rayToEnd.adjust(degrees(0.5)), rayToEnd.adjust(degrees(-0.5))];
}
function toRaysWalls(pos, walls) {
    return walls.map(function (w) { return toRays(pos, w); }).reduce(function (r1, r2) { return r1.concat(r2); });
}
function clipRay(ray, walls) {
    var intersected = walls.map(function (wall) { return intersect(ray, wall); }).filter(function (r) { return r != null; });
    intersected.sort(function (x, y) { return x.vector.length - y.vector.length; });
    return intersected.length > 0 ? intersected[0] : null;
}
function clipRays(rays, walls) {
    return rays.map(function (r) { return clipRay(r, walls); }).filter(function (r) { return r != null; });
}
var View = (function () {
    function View(ctx) {
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
        this.walls = [];
        this.renderWalls();
    }
    View.prototype.renderWalls = function () {
        var _this = this;
        this.walls.forEach(function (w) { return _this.drawLine(w); });
    };
    View.prototype.toScreen = function (p) {
        return new Point(p.x + this.width / 2, this.height / 2 + p.y);
    };
    View.prototype.fromScreen = function (p) {
        return new Point(p.x - this.width / 2, p.y - this.height / 2);
    };
    View.prototype.drawLine = function (line) {
        this.ctx.beginPath();
        var p = this.toScreen(line.position);
        this.ctx.moveTo(p.x, p.y);
        var end = this.toScreen(line.end());
        this.ctx.lineTo(end.x, end.y);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    };
    View.prototype.drawTriangles = function (color, a, b) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 0;
        var p1 = this.toScreen(a.position);
        this.ctx.moveTo(p1.x, p1.y);
        var p2 = this.toScreen(a.end());
        this.ctx.lineTo(p2.x, p2.y);
        var p3 = this.toScreen(b.end());
        this.ctx.lineTo(p3.x, p3.y);
        var p4 = this.toScreen(b.position);
        this.ctx.lineTo(p4.x, p4.y);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    };
    View.prototype.renderRay = function (ray_x, ray_y) {
        this.ctx.beginPath();
        this.ctx.arc(ray_x, ray_y, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = rayColor;
        this.ctx.fill();
    };
    View.prototype.renderRays = function (ray_x, ray_y) {
        var ray_pos_screen = new Point(ray_x, ray_y);
        var ray_pos = this.fromScreen(ray_pos_screen);
        var rays = toRaysWalls(ray_pos, this.walls);
        var clippedRays = clipRays(rays, this.walls);
        clippedRays.sort(function (x, y) { return x.vector.angle - y.vector.angle; });
        for (var i = 0; i < clippedRays.length; i++) {
            var r1 = clippedRays[i];
            var r2 = clippedRays[(i + 1) % clippedRays.length];
            this.drawTriangles(polygonColor, r1, r2);
        }
    };
    View.prototype.render = function (ray_x, ray_y) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.renderRays(ray_x, ray_y);
        this.renderWalls();
        this.renderRay(ray_x, ray_y);
    };
    View.prototype.addWall = function (wall) {
        this.walls.push(wall);
    };
    return View;
}());
var walls = [
    new Line(new Point(-300, -300), new Vector(600, degrees(0))),
    new Line(new Point(300, -300), new Vector(600, degrees(90))),
    new Line(new Point(-300, -300), new Vector(600, degrees(90))),
    new Line(new Point(300, 300), new Vector(600, degrees(180))),
    new Line(new Point(100, 100), new Vector(50, degrees(315))),
    new Line(new Point(-80, 100), new Vector(50, degrees(290))),
    new Line(new Point(-200, 180), new Vector(150, degrees(250))),
    new Line(new Point(150, -100), new Vector(120, degrees(235))),
    new Line(new Point(-230, -250), new Vector(300, degrees(70))),
    new Line(new Point(0, -150), new Vector(300, degrees(30))),
];
function exec() {
    var canvas = document.getElementById("theCanvas");
    var ctx = canvas.getContext("2d");
    var view = new View(ctx);
    walls.forEach(function (w) { return view.addWall(w); });
    view.render(100, 100);
    canvas.onmousemove = function (e) {
        var rect = canvas.getBoundingClientRect();
        view.render(e.clientX - rect.left, e.clientY - rect.top);
    };
    var p = null;
    canvas.onmousedown = function (e) {
        if (p != null) {
            var p2 = new Point(e.clientX, e.clientY);
            var l = Line.pointsToLine(view.fromScreen(p), view.fromScreen(p2));
            view.addWall(l);
            p = null;
        }
        else {
            p = new Point(e.clientX, e.clientY);
        }
    };
}
exec();

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
function paintRectangles(map, latinc, longinc, initial, latCount, longCount) {
    for (var i = 0; i < latCount; i++) {
        for (var j = 0; j < longCount; j++) {
            var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(initial.lat() + (i * latinc), initial.lng() + (j * longinc)), new google.maps.LatLng(initial.lat() + ((i + 1) * latinc), initial.lng() + ((j + 1) * longinc)));
            var rectOpts = {
                bounds: bounds,
                fillColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
                strokeWeight: 0
            };
            var rectangle = new google.maps.Rectangle(rectOpts);
            rectangle.setMap(map);
        }
    }
}
function paintRectangle(map, latinc, longinc, initial, latCount, longCount) {
    var bounds = new google.maps.LatLngBounds(initial, new google.maps.LatLng(initial.lat() + (latCount * latinc), initial.lng() + (longCount * longinc)));
    var rectOpts = {
        bounds: bounds,
        fillColor: 'red',
        strokeWeight: 0
    };
    var rectangle = new google.maps.Rectangle(rectOpts);
    rectangle.setMap(map);
}
function getNorthWest(bounds) {
    return new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
}
function getSouthEast(bounds) {
    return new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng());
}
function roundToThousand(d) {
    return Math.round(d * 1000) / 1000;
}
function roundToThousandLatLng(d) {
    return new google.maps.LatLng(roundToThousand(d.lat()), roundToThousand(d.lng()));
}
function Get(yourUrl) {
    var Httpreq = new XMLHttpRequest();
    Httpreq.open("GET", yourUrl, false);
    Httpreq.send(null);
    return Httpreq.responseText;
}
function getDB() {
    return [
        { "pos": { "lat": 55702, "lng": 6272 }, "color": "red" },
        { "pos": { "lat": 55701, "lng": 6271 }, "color": "blue" },
        { "pos": { "lat": 55701, "lng": 6272 }, "color": "white" },
        { "pos": { "lat": 55701, "lng": 6273 }, "color": "pink" },
        { "pos": { "lat": 55700, "lng": 6272 }, "color": "green" }
    ];
}
var ColorOverlayView = (function (_super) {
    __extends(ColorOverlayView, _super);
    function ColorOverlayView(map) {
        _super.call(this);
        this.map = map;
        this.div = null;
        this.canvas = null;
        this.ctx = null;
        var over = this;
        map.addListener('center_changed', function () {
            over.draw();
        });
        this.setMap(map);
    }
    ColorOverlayView.prototype.onAdd = function () {
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        var canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        var ctx = canvas.getContext("2d");
        div.appendChild(canvas);
        this.div = div;
        this.canvas = canvas;
        this.ctx = ctx;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);
    };
    ColorOverlayView.prototype.draw = function () {
        var overlayProjection = this.getProjection();
        var mapBounds = this.map.getBounds();
        var bounds = new google.maps.LatLngBounds(roundToThousandLatLng(mapBounds.getSouthWest()), roundToThousandLatLng(mapBounds.getNorthEast()));
        var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());
        var nw = overlayProjection.fromLatLngToDivPixel(getNorthWest(bounds));
        var w = ne.x - sw.x;
        var h = sw.y - ne.y;
        var canvas = this.canvas;
        canvas.width = w;
        canvas.height = h;
        var ctx = this.ctx;
        var latinc = 1 / 1000;
        var longinc = 1 / 500;
        var initial = getNorthWest(bounds);
        var end = getSouthEast(bounds);
        var initPoint = overlayProjection.fromLatLngToDivPixel(initial);
        ctx.globalAlpha = 0.5;
        var db = getDB();
        db.forEach(function (p) {
            ctx.fillStyle = p.color;
            var initial = new google.maps.LatLng(p.pos.lat * latinc, p.pos.lng * longinc);
            var startBounds = new google.maps.LatLngBounds(initial, new google.maps.LatLng(initial.lat() + latinc, initial.lng() + longinc));
            var startBoundsPixelNW = overlayProjection.fromLatLngToDivPixel(getNorthWest(startBounds));
            var startBoundsPixelSE = overlayProjection.fromLatLngToDivPixel(getSouthEast(startBounds));
            var w = startBoundsPixelSE.x - startBoundsPixelNW.x;
            var h = startBoundsPixelSE.y - startBoundsPixelNW.y;
            ctx.fillRect(startBoundsPixelNW.x - nw.x, startBoundsPixelNW.y - nw.y, w, h);
        });
        var div = this.div;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';
        div.style.width = w + 'px';
        div.style.height = h + 'px';
    };
    ColorOverlayView.prototype.remove = function () {
        this.div.parentNode.removeChild(this.div);
        this.div = null;
    };
    return ColorOverlayView;
}(google.maps.OverlayView));
function paintRectanglesCanvas(map, latinc, longinc, initial, latCount, longCount) {
    new ColorOverlayView(map);
}
function initMap(center) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var latinc = 1 / 1000;
    var longinc = 1 / 500;
    var latCount = 15;
    var longCount = 10;
    var initial = new google.maps.LatLng(55.69, 12.54);
    getDB();
    paintRectanglesCanvas(map, latinc, longinc, initial, latCount, longCount);
}
//# sourceMappingURL=tsc.js.map
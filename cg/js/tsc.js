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
var ColorOverlayView = (function (_super) {
    __extends(ColorOverlayView, _super);
    function ColorOverlayView(bounds, map) {
        _super.call(this);
        this.bounds = bounds;
        this.map = map;
        this.div = null;
        this.canvas = null;
        this.ctx = null;
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
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());
        var w = ne.x - sw.x;
        var h = sw.y - ne.y;
        var canvas = this.canvas;
        console.log(w);
        console.log(h);
        canvas.width = w;
        canvas.height = h;
        var ctx = this.ctx;
        ctx.fillStyle = 'black';
        var latinc = 1 / 1000;
        var longinc = 1 / 500;
        var latCount = 15;
        var longCount = 10;
        var initial = this.bounds.getSouthWest();
        var initPoint = overlayProjection.fromLatLngToDivPixel(getNorthWest(this.bounds));
        for (var i = 0; i < latCount; i++) {
            for (var j = 0; j < longCount; j++) {
                var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(initial.lat() + i * latinc, initial.lng() + j * longinc), new google.maps.LatLng(initial.lat() + ((i + 1) * latinc), initial.lng() + ((j + 1) * longinc)));
                var nw = overlayProjection.fromLatLngToDivPixel(getNorthWest(bounds));
                var se = overlayProjection.fromLatLngToDivPixel(getSouthEast(bounds));
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#' + Math.floor(Math.random() * 16777215).toString(16);
                ctx.fillRect(nw.x - initPoint.x, nw.y - initPoint.y, se.x - nw.x, se.y - nw.y);
            }
        }
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
    var ne = new google.maps.LatLng(initial.lat() + latinc * latCount, initial.lng() + longinc * longCount);
    var bounds = new google.maps.LatLngBounds(initial, ne);
    new ColorOverlayView(bounds, map);
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
    console.log(initial);
    paintRectanglesCanvas(map, latinc, longinc, initial, latCount, longCount);
}
//# sourceMappingURL=tsc.js.map
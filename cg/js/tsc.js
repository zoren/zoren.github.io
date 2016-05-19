function paintRectangles(map, latinc, longinc, initial, latCount, longCount) {
    for (var i = 0; i < latCount; i++) {
        for (var j = 0; j < longCount; j++) {
            var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(initial.lat() + ((i + 1) * latinc), initial.lng() + (j * longinc)), new google.maps.LatLng(initial.lat() + (i * latinc), initial.lng() + ((j + 1) * longinc)));
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
function initMap(center) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var latinc = 1 / 1000;
    var longinc = 1 / 500;
    var initialLat = 55.70;
    var initialLong = 12.54;
    var initial = new google.maps.LatLng(55.69, 12.54);
    console.log(initial);
    var latCount = 15;
    var longCount = 10;
    paintRectangles(map, latinc, longinc, initial, latCount, longCount);
}
//# sourceMappingURL=tsc.js.map
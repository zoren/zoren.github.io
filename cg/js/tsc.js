function paintRectanglesTS(map, latinc, longinc, initial, latCount, longCount) {
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
//# sourceMappingURL=tsc.js.map
/// <reference path="google.maps.d.ts" />

function paintRectanglesTS(map:google.maps.Map,
                latinc:number, longinc:number,
                        initial:google.maps.LatLng,
                        latCount:number, longCount:number){
    for(var i = 0;i<latCount;i++){
        for(var j = 0;j<longCount;j++){
        var bounds =
            new google.maps.LatLngBounds(
                new google.maps.LatLng(initial.lat()+((i+1)*latinc), initial.lng()+(j*longinc)),
                new google.maps.LatLng(initial.lat()+(i*latinc), initial.lng()+((j+1)*longinc)));

        var rectOpts : google.maps.RectangleOptions = {
            bounds: bounds,
            fillColor: '#'+Math.floor(Math.random()*16777215).toString(16),
            strokeWeight : 0
        //  editable: true
        };            
        // Define a rectangle and set its editable property to true.
        var rectangle = new google.maps.Rectangle(rectOpts);
        rectangle.setMap(map);
        }
    }        
}    

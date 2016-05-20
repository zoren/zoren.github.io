/// <reference path="google.maps.d.ts" />
function paintRectangles(map:google.maps.Map,
                latinc:number, longinc:number,
                        initial:google.maps.LatLng,
                        latCount:number, longCount:number){
    for(var i = 0;i<latCount;i++){
        for(var j = 0;j<longCount;j++){
        var bounds =
            new google.maps.LatLngBounds(
                new google.maps.LatLng(initial.lat()+(i*latinc), initial.lng()+(j*longinc)),
                new google.maps.LatLng(initial.lat()+((i+1)*latinc), initial.lng()+((j+1)*longinc)));

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

function paintRectangle(map:google.maps.Map,
                latinc:number, longinc:number,
                        initial:google.maps.LatLng,
                        latCount:number, longCount:number){
        var bounds =
            new google.maps.LatLngBounds(
                initial,
                new google.maps.LatLng(initial.lat()+(latCount*latinc), initial.lng()+(longCount*longinc)));

    var rectOpts : google.maps.RectangleOptions = {
        bounds: bounds,
        fillColor: 'red',
        strokeWeight : 0
    //  editable: true
    };            
    // Define a rectangle and set its editable property to true.
    var rectangle = new google.maps.Rectangle(rectOpts);
    rectangle.setMap(map);
}

function getNorthWest(bounds:google.maps.LatLngBounds) {
    return new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
}

function getSouthEast(bounds:google.maps.LatLngBounds) {
    return new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng());
}

class ColorOverlayView extends google.maps.OverlayView {
    private div : HTMLDivElement = null
    private canvas : HTMLCanvasElement = null
    private ctx : CanvasRenderingContext2D = null
    constructor(private bounds:google.maps.LatLngBounds,
                private map:google.maps.Map){
        super()
        this.setMap(map)
    }
    onAdd(){
        var div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        
        var canvas = document.createElement('canvas');
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        
        var ctx = canvas.getContext("2d");
//         ctx.fillStyle = 'black'
//         ctx.fillRect(0, 0, 1, 1)
//         ctx.fillRect(1, 1, 1, 1)
// //        ctx.f
         div.appendChild(canvas); 
        
        this.div = div;
        this.canvas = canvas;
        this.ctx = ctx;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);        
    }
    draw(){
        var overlayProjection = this.getProjection();

        // Retrieve the south-west and north-east coordinates of this overlay
        // in LatLngs and convert them to pixel coordinates.
        // We'll use these coordinates to resize the div.
        var sw = overlayProjection.fromLatLngToDivPixel(this.bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(this.bounds.getNorthEast());

        let w = ne.x - sw.x
        let h = sw.y - ne.y
        let canvas = this.canvas
        console.log(w)
        console.log(h)
        canvas.width = w
        canvas.height = h
        let ctx = this.ctx
        ctx.fillStyle = 'black'

        const latinc = 1/1000;
        const longinc = 1/500;
        const latCount = 15;
        const longCount = 10;
        let initial = this.bounds.getSouthWest()

        let initPoint = overlayProjection.fromLatLngToDivPixel(getNorthWest(this.bounds))
        
        for(var i = 0;i<latCount;i++){
            for(var j = 0;j<longCount;j++){
                var bounds =
                    new google.maps.LatLngBounds(
                        new google.maps.LatLng(initial.lat()+i*latinc, initial.lng()+j*longinc),
                        new google.maps.LatLng(initial.lat()+((i+1)*latinc), initial.lng()+((j+1)*longinc)));
                let nw = overlayProjection.fromLatLngToDivPixel(getNorthWest(bounds))
                let se = overlayProjection.fromLatLngToDivPixel(getSouthEast(bounds))
                ctx.globalAlpha = 0.5                        
                ctx.fillStyle = '#'+Math.floor(Math.random()*16777215).toString(16)
                ctx.fillRect(nw.x-initPoint.x, nw.y - initPoint.y, se.x - nw.x, se.y - nw.y)
            }
        }

        // Resize the image's div to fit the indicated dimensions.
        var div = this.div;
        div.style.left = sw.x + 'px';
        div.style.top = ne.y + 'px';                      
        div.style.width = w + 'px';
        div.style.height = h + 'px';
    }
    remove(){
        this.div.parentNode.removeChild(this.div);
        this.div = null;        
    }
}

function paintRectanglesCanvas(map:google.maps.Map,
                                latinc:number, longinc:number,
                                initial:google.maps.LatLng,
                                latCount:number, longCount:number) {                                    
    let ne = new google.maps.LatLng(initial.lat() + latinc * latCount, initial.lng() + longinc * longCount)
    let bounds = new google.maps.LatLngBounds(initial, ne)
    new ColorOverlayView(bounds, map)
}

function initMap(center:google.maps.LatLng) {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    const latinc = 1/1000;
    const longinc = 1/500;
    const latCount = 15;
    const longCount = 10;

    const initial = new google.maps.LatLng( 55.69, 12.54);
    console.log(initial);


    //paintRectangle
    paintRectanglesCanvas
    (map, latinc, longinc,
                            initial,
                            latCount, longCount);
}

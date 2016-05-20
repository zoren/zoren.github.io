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

function getNorthWest(bounds:google.maps.LatLngBounds) : google.maps.LatLng {
    return new google.maps.LatLng(bounds.getNorthEast().lat(), bounds.getSouthWest().lng());
}

function getSouthEast(bounds:google.maps.LatLngBounds) : google.maps.LatLng {
    return new google.maps.LatLng(bounds.getSouthWest().lat(), bounds.getNorthEast().lng());
}

function roundToThousand(d:number) : number {
    return Math.round(d*1000)/1000;
}

function roundToThousandLatLng(d:google.maps.LatLng) : google.maps.LatLng {
    return new google.maps.LatLng(roundToThousand(d.lat()), roundToThousand(d.lng()))
}
function Get(yourUrl:string){
    var Httpreq = new XMLHttpRequest(); // a new request
    Httpreq.open("GET",yourUrl,false);
    Httpreq.send(null);
    return Httpreq.responseText;          
}
function getDB(){
    return [
        {"pos": {"lat":55702,"lng":6272}, "color" : "red"}
        ,{"pos": {"lat":55701,"lng":6271}, "color" : "blue"}
        ,{"pos": {"lat":55701,"lng":6272}, "color" : "white"}
        ,{"pos": {"lat":55701,"lng":6273}, "color" : "pink"}
        ,{"pos": {"lat":55700,"lng":6272}, "color" : "green"}        
    ]        
}

class ColorOverlayView extends google.maps.OverlayView {
    private div : HTMLDivElement = null
    private canvas : HTMLCanvasElement = null
    private ctx : CanvasRenderingContext2D = null
    constructor(private map:google.maps.Map){
        super()
        let over = this
        map.addListener('center_changed', function() {
            over.draw()
        });        
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
         div.appendChild(canvas); 
        
        this.div = div;
        this.canvas = canvas;
        this.ctx = ctx;
        var panes = this.getPanes();
        panes.overlayLayer.appendChild(div);        
    }
    draw(){
        var overlayProjection = this.getProjection();

        let mapBounds = this.map.getBounds()
        // align bounds 
        let bounds =
            new google.maps.LatLngBounds(
                roundToThousandLatLng(mapBounds.getSouthWest()),
                roundToThousandLatLng(mapBounds.getNorthEast())
            )
        var sw = overlayProjection.fromLatLngToDivPixel(bounds.getSouthWest());
        var ne = overlayProjection.fromLatLngToDivPixel(bounds.getNorthEast());
        var nw = overlayProjection.fromLatLngToDivPixel(getNorthWest(bounds));

        let w = ne.x - sw.x
        let h = sw.y - ne.y
        let canvas = this.canvas

        canvas.width = w
        canvas.height = h
        let ctx = this.ctx

        const latinc = 1/1000;
        const longinc = 1/500;

        let initial = getNorthWest(bounds)
        let end = getSouthEast(bounds)
        let initPoint = overlayProjection.fromLatLngToDivPixel(initial)

        ctx.globalAlpha = 0.5
        let db = getDB()
        db.forEach((p) =>
            {
                ctx.fillStyle = p.color
                let initial = new google.maps.LatLng(p.pos.lat * latinc, p.pos.lng * longinc)
                let startBounds = new google.maps.LatLngBounds(initial, new google.maps.LatLng(initial.lat()+latinc, initial.lng()+longinc))
                let startBoundsPixelNW = overlayProjection.fromLatLngToDivPixel(getNorthWest(startBounds))
                let startBoundsPixelSE = overlayProjection.fromLatLngToDivPixel(getSouthEast(startBounds))
                let w = startBoundsPixelSE.x - startBoundsPixelNW.x
                let h = startBoundsPixelSE.y - startBoundsPixelNW.y                
                ctx.fillRect(startBoundsPixelNW.x - nw.x, startBoundsPixelNW.y - nw.y,
                             w, h)
            }
        )

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
    new ColorOverlayView(map)
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
    // console.log(initial);
    getDB()

    //paintRectangle
    paintRectanglesCanvas
    (map, latinc, longinc,
                            initial,
                            latCount, longCount);
}

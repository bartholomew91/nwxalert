var overlay;
radarOverlay.prototype = new google.maps.OverlayView();
radarOverlay.prototype.onAdd = function () {
    var div = document.createElement('div');

    div.style.borderStyle = 'none';
    div.style.borderWidth = '0px';
    div.style.position = 'absolute';

    var img = document.createElement('img');

    img.src = this.image_;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.position = 'absolute';
    div.appendChild(img);

    this.div_ = div;

    var panes = this.getPanes();

    panes.overlayLayer.appendChild(div);
};
radarOverlay.prototype.draw = function () {
    var overlayProjection = this.getProjection();

    var sw = overlayProjection.fromLatLngToDivPixel(this.bounds_.getSouthWest());
    var ne = overlayProjection.fromLatLngToDivPixel(this.bounds_.getNorthEast());

    var div = this.div_;

    div.style.left = sw.x + 'px';
    div.style.top = ne.y + 'px';
    div.style.width = (ne.x - sw.x) + 'px';
    div.style.height = (sw.y - ne.y) + 'px';
};
radarOverlay.prototype.onRemove = function () {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
};
radarOverlay.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.visibility = 'hidden';
    }
};
radarOverlay.prototype.show = function () {
    if (this.div_) {
        this.div_.style.visibility = 'visible';
    }
};
radarOverlay.prototype.toggle = function () {
    if (this.div_) {
        if (this.div_.style.visibility == 'hidden') {
            this.show();
        } else {
            this.hide();
        }
    }
};
radarOverlay.prototype.toggleDOM = function () {
    if (this.getMap()) {
        this.setMap(null);
    } else {
        this.setMap(this.map_);
    }
};
radarOverlay.prototype.loopImage = function () {

};

function initialize() {
    var mapOptions = {
        center: new google.maps.LatLng(35.5, -98),
        zoom: 11
    };
    var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    var swBound = new google.maps.LatLng(21.6525, -127.6203);
    var neBound = new google.maps.LatLng(50.4066, -66.5179);
    var bounds = new google.maps.LatLngBounds(swBound, neBound);

    var srcImage = '/images/radar/Conus_20140324_0018_N0Ronly.gif';
    overlay = new radarOverlay(bounds, srcImage, map);
}

function radarOverlay(bounds, image, map) {
    this.bounds_ = bounds;
    this.image_ = image;
    this.map_ = map;

    this.div_ = null;
    this.setMap(map);
};

google.maps.event.addDomListener(window, 'load', initialize);
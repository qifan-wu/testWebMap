

// var attr_osm = 'Map data &copy; <a href="http://openstreetmap.org/">OpenStreetMap</a> contributors',
// attr_overpass = 'POI via <a href="http://www.overpass-api.de/">Overpass API</a>';
// var osm = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {opacity: 0.7, attribution: [attr_osm, attr_overpass].join(', ')});

map.setView(new L.LatLng(40.7128, -74.0060), 14);

//OverPassAPI overlay
console.log('aaa');
var lat = 40.7128;
var lon = -74.0060;
var poiQuery = `(
node(around:1000, ${lat}, ${lon})[amenity];
node(around:1000, ${lat}, ${lon})[leisure];
node(around:1000, ${lat}, ${lon})[shop];
node(around:1000, ${lat}, ${lon})[historic];);
out qt;`;
var icon = new L.Icon({
        iconUrl: 'leaf-green.png', //https://leafletjs.com/examples/custom-icons/leaf-green.png
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
var opl = new L.OverPassLayer({
    minZoom: 14,
    maxZoom: 5,
    'query': poiQuery,
    //'query': '(node(40.704, -73.997, 40.722, -74.015)[amenity];node(around:1000, 40.7128, -74.0060)[second_hand];);out qt;',
    onSuccess: function(data) {
        var poiGroup= L.markerClusterGroup({ showCoverageOnHover: true, disableClusteringAtZoom:18 });
        for (var i=0; i<data.elements.length; i++) {
            var e = data.elements[i];
            var pos = new L.LatLng(e.lat, e.lon);
            // console.info(e.tags);
            L.marker(pos,{
                // icon:restaurantIcon,
                title:e.tags.name, //shows restaurants names
                tipus:e.tags.amenity
            }).on('click', markerOnClick).addTo(poiGroup); //add markers to the cluster
    }
    map.addLayer(poiGroup); //to add the cluster to the map

    function markerOnClick(event){
        var restaurante = event.target.options.tipus + " " +event.target.options.title;
        event.target.bindPopup(restaurante).openPopup();
    }
    },
});

map.addLayer(opl);
console.log('zzzzz');
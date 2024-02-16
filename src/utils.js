import { searchGridLen } from './constants.js'

export function searchPOI(lat, lon) {

    // const westBound = lon - searchGridLen;
    // const eastBound = lon + searchGridLen;
    // const northBound = lat + searchGridLen;
    // const southBound = lat - searchGridLen;
    // if (map.hasLayer(opl)) {
    //     map.removeLayer(opl);
    // }
    var poiQuery = `(
        node(around:1000, ${lat}, ${lon})[amenity];
        node(around:1000, ${lat}, ${lon})[leisure];
        node(around:1000, ${lat}, ${lon})[shop];
        node(around:1000, ${lat}, ${lon})[historic];);
        out qt;`;

    // map.setView(new L.LatLng(lat, lon), 14);
    map.setView(new L.LatLng(lat, lon), 14);
    var opl = new L.OverPassLayer({
        minZoom: 14,
        'query': poiQuery,

        onSuccess: function(data) {
        var poiGroup= L.markerClusterGroup({
            showCoverageOnHover: true,
            disableClusteringAtZoom:18,

            iconCreateFunction: function(cluster) {
                return L.divIcon({ html: '<h2>' + cluster.getChildCount() + '</h2>' });
            }});
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

};

export function createStationMarkers(stationsData) {
    var markers = L.markerClusterGroup(
        // {
        // spiderfyShapePositions: function(count, centerPt) {
        //     var distanceFromCenter = 35,
        //         markerDistance = 45,
        //         lineLength = markerDistance * (count - 1),
        //         lineStart = centerPt.y - lineLength / 2,
        //         res = [],
        //         i;

        //     res.length = count;

        //     for (i = count - 1; i >= 0; i--) {
        //         res[i] = new Point(centerPt.x + distanceFromCenter, lineStart + markerDistance * i);
        //     }

        //     return res;
        // }
        // }
    );
    stationsData.forEach(function (station) {
        var marker = L.marker(new L.LatLng(station.lat, station.lon));
        // marker.bindPopup(document.createTextNode(city.n_station).textContent);
        marker.on('click', function() {
            console.log('clicked');
            // markers.clearLayers();
            // map.addLayer(marker);
            searchPOI(station.lat, station.lon);
        });

        markers.addLayer(marker);
    });
    map.addLayer(markers);
};
import { searchGridLen } from './universal.js'

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

};
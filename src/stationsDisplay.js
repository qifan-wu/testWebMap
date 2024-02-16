import { stationsDataFile } from './universal.js'
import { searchPOI } from './searchPOI.js';




function createStationMarkers(stationsData) {
    var markers = L.markerClusterGroup();
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
}

axios.get(stationsDataFile)
    .then(function (response) {
        var stationsData = response.data;
        console.log(new Date().toLocaleString());
        createStationMarkers(stationsData);
        console.log(new Date().toLocaleString());
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });


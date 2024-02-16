import { map, stationsDataFile } from './universal.js'
import { searchPOI } from './searchPOI.js';

var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})
// basemap.addTo(map);
map.addLayer(basemap);

function createStationMarkers(stationsData) {
    var markers = L.markerClusterGroup();
    stationsData.forEach(function (station) {
        var marker = L.marker(new L.LatLng(station.lat, station.lon));
        // marker.bindPopup(document.createTextNode(city.n_station).textContent);
        marker.on('click', function() {
            console.log('click');
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


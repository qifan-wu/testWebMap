var map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// var stationCount = [{
//         "country": "UnitedStates",
//         "city": "Atlanta",
//         "n_SIPOI": 83.0,
//         "d_SIPOI": 28.5,
//         "n_SIPOI_norm_pop": 0.0518508635,
//         "n_station": 24.0,
//         "lon": "-84.3923723626725",
//         "lat": " 33.7655769566963",
//         "poi_saturation": 85.8
//     },
//     {
//         "country": "UnitedStates",
//         "city": "Baltimore",
//         "n_SIPOI": 175.0,
//         "d_SIPOI": 34.0,
//         "n_SIPOI_norm_pop": 0.0631448495,
//         "n_station": 11.0,
//         "lon": "-76.6416188693581",
//         "lat": " 39.3124570272559",
//         "poi_saturation": 78.16
//     }];

// var markers = L.markerClusterGroup();
// stationCount.forEach(function (city) {
//     var marker = L.marker(new L.LatLng(city.lat, city.lon));
//     marker.bindPopup(city.n_station);
//     markers.addLayer(marker);
//     console.log(city);
// });


function createCityMarkers(stationCount) {
    var markers = L.markerClusterGroup();
    stationCount.forEach(function (city) {
        var icon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-circle">' + city.n_station + '</div>'
        });

        var marker = L.marker(new L.LatLng(city.lat, city.lon), { icon: icon });
        // marker.bindPopup(document.createTextNode(city.n_station).textContent);
        marker.on('click', function() {
            zoomToCity(city.lat, city.lon);
        });

        markers.addLayer(marker);
    });
    map.addLayer(markers);
}

function zoomToCity(lat, lon) {
    map.setView([lat, lon], 12); // Adjust the zoom level as needed
}

axios.get('data/city_ranking.json')
    .then(function (response) {
        var stationCount = response.data;
        createCityMarkers(stationCount);
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });


// Initialize the map
var map = L.map('map').setView([40.7128, -74.0060], 12); // New York City coordinates
// var map = L.map('map').setView([42.3314, -83.0458], 12); // Detroit coordinates

var loadingSpinner = new Spinner().spin(document.getElementById('loading-spinner'));

// Add OpenStreetMap tiles as the base layer
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

function getSubwayStations() {
    var overpassQuery = `
        [out:json];
        area["name"="New York"]->.a;
        (node["railway"="station"]["station"="subway"](area.a);
        way["railway"="station"]["station"="subway"](area.a);
        rel["railway"="station"]["station"="subway"](area.a);
        );
        out body;
    `;

    // Make a request to the Overpass API
    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(overpassQuery)
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading spinner
        loadingSpinner.stop();

        // Process the data and add markers to the map
        data.elements.forEach(element => {
            var lat, lon, name;
            // debugger;
            if (element.type === 'node' && 'lat' in element && 'lon' in element) {
                lat = element.lat;
                lon = element.lon;
                name = (element.tags && 'name' in element.tags) ? element.tags.name : 'Subway Station';

                // Create a marker for each subway station
                var marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup(`<b>${name}</b>`).openPopup();
            }
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        // Hide loading spinner on error
        loadingSpinner.stop();
    });
}



map.on('zoomend', function () {
    var bounds = map.getBounds();
    var bbox = bounds.toBBoxString();
    // Show loading spinner
    loadingSpinner.spin(document.getElementById('loading-spinner'));

    getSubwayStations();

});


// map.on('zoomend', function () {
//     // Get the new bounding box
//     var bounds = map.getBounds();
//     var bbox = bounds.toBBoxString();

//     // Define an Overpass API query for subway stations
//     var overpassQuery = `
//             [out:json];
//             // (
//             //     node["railway"="station"]["station"="subway"](${bbox});
//             //     way["railway"="station"]["station"="subway"](${bbox});
//             //     rel["railway"="station"]["station"="subway"](${bbox});
//             // );
//             area["name"="New York"]->.a;
//             (node["railway"="station"]["station"="subway"](area.a);
//             way["railway"="station"]["station"="subway"](area.a);
//             rel["railway"="station"]["station"="subway"](area.a);
//             );
//             out body;
//         `;

//     // Make a request to the Overpass API
//     fetch('https://overpass-api.de/api/interpreter', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded'
//         },
//         body: 'data=' + encodeURIComponent(overpassQuery)
//     })
//     .then(response => response.json())
//     .then(data => {
//         data.elements.forEach(element => {
//             var lat, lon, name;
//             // debugger;
//             if (element.type === 'node' && 'lat' in element && 'lon' in element) {
//                 lat = element.lat;
//                 lon = element.lon;
//                 name = (element.tags && 'name' in element.tags) ? element.tags.name : 'Subway Station';

//                 // Create a marker for each subway station
//                 var marker = L.marker([lat, lon]).addTo(map);
//                 marker.bindPopup(`<b>${name}</b>`).openPopup();
//             }

//             // else if (element.type === 'way') {
//             //     // For ways, use the center coordinates
//             //     lat = element.center.lat;
//             //     lon = element.center.lon;
//             //     name = element.tags.name || 'Subway Station';
//             // }


//         });
//     })
//     .catch(error => console.error('Error fetching data:', error));
// });
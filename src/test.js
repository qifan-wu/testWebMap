// New York City coordinates
var lat = 40.7128;
var lon = -74.0060;

var map = L.map('map').setView([lat, lon], 12);

var osmBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

osmBaseMap.addTo(map);

// Initialize the application
function testPOI(lat, lon) {
    debugger;
    var overpassFrontend = new OverpassFrontend('//overpass-api.de/api/interpreter');

    var layer = new OverpassLayer({
        overpassFrontend: overpassFrontend,
        query: 'nwr(around:1000, ${lat}, ${lon})[amenity];',
        minZoom: 16,
        feature: {
            title: '{{ tags.name }}',
            style: { width: 1, color: 'black' }
        }
    });
    layer.addTo(map);

};

testPOI(lat, lon);
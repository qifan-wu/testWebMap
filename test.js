// Initialize Leaflet map
var map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);










// Function to fetch subway station data using Overpass API
function fetchSubwayStations(city) {
axios.get('https://overpass-api.de/api/interpreter', {
    params: {
    data: `[out:json][timeout:25];
            area[name="${city}"];
            node(area)["railway"="station"]["subway"];
            out;`
    }
})
.then(function (response) {
    // Process the response and display subway stations on the map
    var subwayStations = response.data.elements;
    var subwayIcon = L.icon({
    iconUrl: 'https://image.flaticon.com/icons/svg/130/130276.svg',
    iconSize: [25, 25]
    });
    subwayStations.forEach(function(station) {
    L.marker([station.lat, station.lon], {icon: subwayIcon}).addTo(map);
    });
})
.catch(function (error) {
    console.error('Error fetching subway stations:', error);
});
}

// Sample cities with their respective subway station counts
var citySubwayData = {
"New York": 472,
"Tokyo": 285,
"London": 270,
// Add more cities and their subway station counts here
};

// Function to create markers for each city
function createCityMarkers() {
Object.keys(citySubwayData).forEach(function(city) {
    var marker = L.marker(getRandomLatLng(), {
    title: city + ": " + citySubwayData[city] + " subway stations"
    });
    marker.addTo(map).bindPopup(city + ": " + citySubwayData[city] + " subway stations");
    marker.on('click', function(e) {
    map.setView(e.latlng, 12); // Zoom in when a city marker is clicked
    fetchSubwayStations(city); // Fetch subway stations for the clicked city
    });
});
}

// Function to get random LatLng coordinates for marker placement (for demonstration purposes)
function getRandomLatLng() {
var bounds = map.getBounds(),
    southWest = bounds.getSouthWest(),
    northEast = bounds.getNorthEast(),
    lngSpan = northEast.lng - southWest.lng,
    latSpan = northEast.lat - southWest.lat;

return L.latLng(
    southWest.lat + latSpan * Math.random(),
    southWest.lng + lngSpan * Math.random()
);
}

// Initialize the application
createCityMarkers();
import { STATIONS_DATA_FILE } from './constants.js'
import { createStationMarkers, handleSearchedPlace} from './utils.js';

var osmBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

// map.addLayer(osmBaseMap);
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri'});

var baseMaps = {
    "OpenStreetMap": osmBaseMap,
    "Satellite": satellite
};

export var overlayMaps = {
};

export var test = {'aaa': 12};

export var layerControl = L.control.layers(baseMaps, overlayMaps)

osmBaseMap.addTo(map);
L.control.scale().addTo(map);

layerControl.addTo(map);

//search box
var searchControl = new L.esri.Controls.Geosearch().addTo(map);
var searchedRes = new L.LayerGroup().addTo(map);
searchControl.on('results', function(data){
    handleSearchedPlace(data, searchedRes);
});

axios.get(STATIONS_DATA_FILE)
    .then(function (response) {
        var stationsData = response.data;
        console.log(new Date().toLocaleString());
        var stationMarkers = createStationMarkers(stationsData);
        console.log(new Date().toLocaleString());
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });


console.warn = () => {};
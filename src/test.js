// New York City coordinates
import { STATIONS_INFO_FILE, METRO_FILE, SOPOI_CAT } from './constants.js'
import { createStationMarkers, handleSearchedPlace} from './utils.js';
import { ESRI_ACCESS_TOKEN, MAPBOX_PUBLIC_TOKEN } from './private.js';


var lat = 40.7128;
var lon = -74.0060;

var lat_min = 40.730610
var lon_min = -73.935242
var lat_max = lat_min + 0.3
var lon_max = lon_min + 0.3

// var map = L.map('map').setView([lat, lon], 12);

var osmBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

osmBaseMap.addTo(map);



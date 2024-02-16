import { stationsDataFile } from './constants.js'
import { createStationMarkers} from './utils.js';

var basemap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
map.addLayer(basemap);

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


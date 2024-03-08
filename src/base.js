import { STATIONS_DATA_FILE } from './constants.js'
import { createStationMarkers, handleSearchedPlace} from './utils.js';
import { ARCGIS_ACCESS_TOKEN } from './private.js';

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

//old search control
// var searchControl = new L.esri.Controls.Geosearch();
// searchControl.addTo(map);
// var searchedRes = new L.LayerGroup();
// searchedRes.addTo(map);
// searchControl.on('results', function(data){
//     handleSearchedPlace(data, searchedRes);
// });

// new search control
const searchControl1 = L.esri.Geocoding.geosearch({
        position: "topright",
        placeholder: "Enter an address or place e.g. 1 York St",
        useMapBounds: false,
        providers: [
          L.esri.Geocoding.arcgisOnlineProvider({
            apikey: ARCGIS_ACCESS_TOKEN,
            nearby: {
              lat: -33.8688,
              lng: 151.2093
            }
          })
        ]
      }).addTo(map);
const results = L.layerGroup().addTo(map);
searchControl1.on("results", function (data) {
        results.clearLayers();
        for (let i = data.results.length - 1; i >= 0; i--) {
          results.addLayer(L.marker(data.results[i].latlng));
          handleSearchedPlace(data, results);
        }
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




// console.warn = () => {};
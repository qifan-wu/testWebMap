import { STATIONS_INFO_FILE, METRO_FILE, SOPOI_CATS } from './constants.js'
import { SOPOI_CAT_DISPLAY } from './styles.js'
import { createStationMarkers, handleSearchedPlace} from './utils.js';
import { ESRI_ACCESS_TOKEN, MAPBOX_PUBLIC_TOKEN } from './private.js';

var osmBaseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri'});

var mapboxStreet = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> contributors',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_PUBLIC_TOKEN
    });

var mapboxLight = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> contributors',
      maxZoom: 18,
      id: 'mapbox/light-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_PUBLIC_TOKEN
    });

var mapboxDark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
      attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/about/">OpenStreetMap</a> contributors',
      maxZoom: 18,
      id: 'mapbox/dark-v10',
      tileSize: 512,
      zoomOffset: -1,
      accessToken: MAPBOX_PUBLIC_TOKEN
    });

// display metro lines
axios.get(METRO_FILE)
    .then(function (response) {
      var metroStations = L.markerClusterGroup(); ///

      var metroLines = L.markerClusterGroup();
      var metroData = response.data;
      for (const metroUrl in metroData) {
          if (metroData.hasOwnProperty(metroUrl)) {
            const metro = metroData[metroUrl];
            // Plot metro lines
            metro.lines.forEach(function(line) {
              let lineCoordinates = line.path.map(function(coord) {
                return [coord.lat, coord.lng];
              });
              var linePoly = L.polyline(lineCoordinates, { color: line.color });
              metroLines.addLayer(linePoly);
              linePoly.on('mouseover', function(e) {
                  this.bindPopup("<h3>Metro Line: " + line.name + "</h3>" +
                                  "<p><strong>" + line.branch + "</strong></p>").openPopup({autoPan: false});
              });
            });

            // Plot metro stations
            metro.stations.forEach(function(station) {
              let stationMarkerNew = L.marker([station.lat, station.lon]);
              metroStations.addLayer(stationMarkerNew);
            });

          }
        }
        layerControl.addOverlay(metroLines, "metroLines");
        overlayMaps.metroLines = metroLines;
        map.addLayer(metroLines);


        // add stations from metro website to map
        layerControl.addOverlay(metroStations, "metroStations");
        overlayMaps.metroStations = metroStations;
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });


var baseMaps = {
    "OpenStreetMap": osmBaseMap,
    "Satellite": satellite,
    'Streets': mapboxStreet,
    'Light': mapboxLight,
    'Dark': mapboxDark
};

export var overlayMaps = {
};

export var layerControl = L.control.layers(baseMaps, overlayMaps)

let printImageButton = L.easyPrint({
	title: 'Print Map',
	position: 'bottomright',
	sizeModes: ['Current', 'A4Landscape', 'A4Portrait'],
  filename: 'map',
  defaultSizeTitles: {
      Current: 'Current Size',
      A4Landscape: 'A4 Landscape',
      A4Portrait: 'A4 Portrait'
    }
});
printImageButton.addTo(map);

let legendVals = [];
for (const [poi, poiDisplay] of Object.entries(SOPOI_CAT_DISPLAY)) {
  let labelVal = poiDisplay['label'];
  let colorVal = poiDisplay['color'];
  let legendVal = {
    label: labelVal,
    type: "circle",
    radius: 7,
    color: colorVal,
    fillColor: colorVal,
    opacity: 0.9,
    fillOpacity: 0.4,
  }
  legendVals.push(legendVal);
};

export var poiLegend = L.control.Legend({
    title: "Legend of POI",
    position: "bottomright",
    legends: legendVals,
    collapsed: false,
    symbolWidth: 20,
    opacity: 0.8
});

mapboxLight.addTo(map);
L.control.scale().addTo(map);

layerControl.addTo(map);

// new search control
const searchControl1 = L.esri.Geocoding.geosearch({
        position: "topleft",
        placeholder: "Enter an address or place e.g. 1 York St",
        useMapBounds: false,
        providers: [
          L.esri.Geocoding.arcgisOnlineProvider({
            apikey: ESRI_ACCESS_TOKEN
          })
        ]
      }).addTo(map);
const results = L.layerGroup().addTo(map);
searchControl1.on("results", function (data) {
        handleSearchedPlace(data, results);
      });

axios.get(STATIONS_INFO_FILE)
    .then(function (response) {
        var stationsData = response.data;
        var stationMarkers = createStationMarkers(stationsData);
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });

    // let poiCount = {
    //     "public_institution": 0,
    //     "commerce": 0,
    //     "food_drink": 0,
    //     "recreation": 0,
    //     "religion": 0,
    // };
    // initialize the poi count in every detail category

document.addEventListener('DOMContentLoaded', function() {
    const closeBtn = document.getElementById('closePanelBtn');
    const statsPanel = document.getElementById('statspanel');

    closeBtn.addEventListener('click', function() {
        statsPanel.style.display = 'none';
        closeBtn.style.display='none';
        document.getElementById('map').style.width = '100%';
    });
});
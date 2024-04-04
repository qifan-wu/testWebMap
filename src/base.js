import { STATIONS_INFO_FILE, METRO_FILE } from './constants.js'
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
      var metroStations = L.markerClusterGroup();
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
                  this.bindPopup("Metro line: " + line.name +
                                  "<br> Metro line branch: " + line.branch).openPopup();
              });
            });

            metro.stations.forEach(function(station) {
              let stationMarkerNew = L.marker([station.lat, station.lon]);
              metroStations.addLayer(stationMarkerNew);
            });

          }
        }
        // map.addLayer(metroStations);
        map.addLayer(metroLines);

        layerControl.addOverlay(metroLines, "metroLines");
        overlayMaps.metroLines = metroLines;

        // add stations from metro website to map
        // layerControl.addOverlay(metroStations, "metroStations");
        // overlayMaps.metroStations = metroStations;
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

export var poiLegend = L.control.Legend({
    title: "Legend of POI",
    position: "bottomright",
    legends: [
      {
        label: "Amenity",
        type: "circle",
        radius: 7,
        color: 'red',
        fillColor: 'red',
        opacity: 0.9,
        fillOpacity: 0.5,
      },
      {
        label: "Leisure",
        type: "circle",
        radius: 7,
        color: 'green',
        fillColor: 'green',
        opacity: 0.9,
        fillOpacity: 0.5
      },
      {
        label: "Shop",
        type: "circle",
        radius: 7,
        color: 'orange',
        fillColor: 'orange',
        opacity: 0.9,
        fillOpacity: 0.5
      },
      {
        label: "Historic",
        type: "circle",
        radius: 7,
        color: 'blue',
        fillColor: 'blue',
        opacity: 0.9,
        fillOpacity: 0.5
      },
    ],
    collapsed: false,
    symbolWidth: 20,
    opacity: 0.8
});

osmBaseMap.addTo(map);
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
        results.clearLayers();
        for (let i = data.results.length - 1; i >= 0; i--) {
          results.addLayer(L.marker(data.results[i].latlng));
          handleSearchedPlace(data, results);
        }
      });

axios.get(STATIONS_INFO_FILE)
    .then(function (response) {
        var stationsData = response.data;
        var stationMarkers = createStationMarkers(stationsData);
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });



// console.warn = () => {};
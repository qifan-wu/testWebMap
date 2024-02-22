import { searchGridLen } from './constants.js'
import { overlayMaps, layerControl, test } from './base.js'
import { subwayIcon, poiIcon} from './icons.js';

// Show subway stations worldwide on the map
export function createStationMarkers(stationsData) {
    var stationMarkers = L.markerClusterGroup(
        // {
        // spiderfyShapePositions: function(count, centerPt) {
        //     var distanceFromCenter = 35,
        //         markerDistance = 45,
        //         lineLength = markerDistance * (count - 1),
        //         lineStart = centerPt.y - lineLength / 2,
        //         res = [],
        //         i;

        //     res.length = count;

        //     for (i = count - 1; i >= 0; i--) {
        //         res[i] = new Point(centerPt.x + distanceFromCenter, lineStart + markerDistance * i);
        //     }

        //     return res;
        // }
        // }
    );
    stationsData.forEach(function (station) {
        var stationMarker = L.marker(new L.LatLng(station.lat, station.lon), {icon: subwayIcon});
        // marker.bindPopup(document.createTextNode(city.n_station).textContent);
        stationMarker.on('click', function() {
            console.log('clicked');

            if (overlayMaps.hasOwnProperty("stations")) {
                map.removeControl(overlayMaps["stations"]);
                map.removeLayer(overlayMaps["stations"]);
            }

            // var opl = searchPOI(station.lat, station.lon);
            searchPOIFrontend(station.lat, station.lon);

        });

        overlayMaps["stations"] = stationMarker;
        stationMarkers.addLayer(stationMarker);
    });

    map.addLayer(stationMarkers);
    layerControl.addOverlay(stationMarkers, "stations");

    overlayMaps.stations = stationMarkers;
    return stationMarkers;
};

export function generateCircle(lat, lon, radius, numPoints = 64) {
    const coordinates = [];
    const angleStep = (2 * Math.PI) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const x = lon + radius * Math.cos(angle);
        const y = lat + radius * Math.sin(angle);
        coordinates.push([x, y]); // GeoJSON uses [longitude, latitude]
    }

    // Close the polygon by adding the first point again
    coordinates.push(coordinates[0]);

    // Create GeoJSON feature
    const circleFeature = {
        type: "Feature",
        properties: {},
        geometry: {
            type: "Polygon",
            coordinates: [coordinates]
        }
    };

    // Create GeoJSON FeatureCollection
    const featureCollection = {
        type: "FeatureCollection",
        features: [circleFeature]
    };

    return featureCollection;
};


export function searchPOIFrontend(lat, lon) {
    // add selected subway station marker
    if (overlayMaps.hasOwnProperty("selectedStation")) {
        map.removeLayer(overlayMaps["selectedStation"]);
    }
    var selectedStation = L.marker([lat, lon], {icon: subwayIcon});
    selectedStation.addTo(map);
    overlayMaps.selectedStation = selectedStation;

    // add border circle for 1km
    if (overlayMaps.hasOwnProperty("border")) {
        map.removeLayer(overlayMaps["border"]);
    }
    var borderCircle = L.circle([lat, lon], {
        color: '#1C4966',
        opacity: 0.7,
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: 1000,
        weight: '3',
        dashArray: '10, 10',
        dashOffset: '10'
    });
    borderCircle.addTo(map);
    overlayMaps.border = borderCircle;

    map.fitBounds(borderCircle.getBounds());

    // const OverpassFrontend = require('overpass-frontend')

    const overpassFrontend = new OverpassFrontend('//overpass-api.de/api/interpreter')
    // var poiQuery = `(
    //     nwr(around:1000, ${lat}, ${lon})[amenity];
    //     out geom
    //     `;

    // var bounds = generateCircle(lat, lon, 1000);
    // const radius = 0.01;
    // var bounds = {
    //     "type": "Feature",
    //     "geometry": {
    //         "type": "Polygon",
    //         "coordinates": [
    //         [
    //             [lat - radius, lon - radius],
    //             [lat + radius, lon - radius],
    //             [lat + radius, lon + radius],
    //             [lat - radius, lon + radius],
    //             [lat - radius, lon - radius]
    //         ]
    //         ]
    //     },
    //     "properties": {
    //         "name": "Square Box"
    //     }
    // }

    var bounds = { minlat: lat-searchGridLen, maxlat: lat+searchGridLen, minlon: lon-searchGridLen, maxlon: lon+searchGridLen }

    var poiQuery = `
        (
        nwr[amenity];
        nwr[leisure];
        nwr[shop];
        nwr[historic];
        )
    `
    overpassFrontend.BBoxQuery(
        // 'nwr[amenity=restaurant]',
        poiQuery,
        // { minlat: lat-0.01, maxlat: lat+0.01, minlon: lon-0.01, maxlon: lon+0.01 },
        { bounds },
        {
            properties: OverpassFrontend.ALL
        },
        function (err, result) {

            // console.log('* ' + result.tags.name + ' (' + result.id + ')')
            let popup = "";

            if (result.type == "node") {
                var poiMarker = L.marker(new L.LatLng(result.data.lat, result.data.lon), {icon: poiIcon});
                poiMarker.addTo(map);

                for (var key in result.tags) {
                    popup += '<b>' + key + '</b>: ' + result.tags[key] + '<br>';
                }

                poiMarker.bindPopup(popup).openPopup();
            }

            else if (result.type == "way") {
                var latLngs = result.data.geometry.map(node => [node.lat, node.lon]);
                var wayMarker = L.polyline(latLngs, {
                    className: 'my_polyline'
                });
                wayMarker.addTo(map);
                wayMarker.bindPopup('<p>' + result.tags.name + '</p>').openPopup();
            }

            // else if (result.type == "relation") {
            //     debugger;
            // }
        },
        function (err) {
            if (err) { console.log(err) }
        }
    )


    console.log("ttttttt");
};

export function searchPOI(lat, lon) {
    // add selected subway station marker
    if (overlayMaps.hasOwnProperty("selectedStation")) {
        map.removeLayer(overlayMaps["selectedStation"]);
    }
    var selectedStation = L.marker([lat, lon], {icon: subwayIcon});
    selectedStation.addTo(map);
    overlayMaps.selectedStation = selectedStation;

    // add border circle for 1km
    if (overlayMaps.hasOwnProperty("border")) {
        map.removeLayer(overlayMaps["border"]);
    }
    var borderCircle = L.circle([lat, lon], {
        color: '#1C4966',
        opacity: 0.7,
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: 1000,
        weight: '3',
        dashArray: '10, 10',
        dashOffset: '10'
    });
    borderCircle.addTo(map);
    overlayMaps.border = borderCircle;


    // const westBound = lon - searchGridLen;
    // const eastBound = lon + searchGridLen;
    // const northBound = lat + searchGridLen;
    // const southBound = lat - searchGridLen;
    // if (map.hasLayer(opl)) {
    //     map.removeLayer(opl);
    // }
    var poiQuery = `(
        nwr(around:1000, ${lat}, ${lon})[amenity];
        nwr(around:1000, ${lat}, ${lon})[leisure];
        nwr(around:1000, ${lat}, ${lon})[shop];
        nwr(around:1000, ${lat}, ${lon})[historic];);
        out qt;`;

    map.setView(new L.LatLng(lat, lon), 15);

    var opl = new L.OverPassLayer({
        minZoom: 14,
        'query': poiQuery,

        // onSuccess: function(data) {
        //     var poiGroup= L.markerClusterGroup({
        //         showCoverageOnHover: true,
        //         disableClusteringAtZoom:18,

        //         // iconCreateFunction: function(cluster) {
        //         //     return L.divIcon({ html: '<h2>' + cluster.getChildCount() + '</h2>' });
        //         //     }
        //         });
        //     for (var i=0; i<data.elements.length; i++) {
        //         var e = data.elements[i];
        //         var pos = new L.LatLng(e.lat, e.lon);
        //         // console.info(e.tags);
        //         L.marker(pos,{
        //             // icon:restaurantIcon,
        //             title:e.tags.name, //shows restaurants names
        //             tipus:e.tags.amenity
        //         }).on('click', markerOnClick).addTo(poiGroup); //add markers to the cluster
        //     }
        //     // opl.addLayer(poiGroup);
        //     if (overlayMaps.hasOwnProperty("POI_sub")) {
        //         map.removeLayer(overlayMaps["POI_sub"]);
        //     }
        //     map.addLayer(poiGroup); //to add the cluster to the map
        //     overlayMaps.POI_sub = poiGroup;
        //     // layerControl.addOverlay(opl, "POI");

        //     function markerOnClick(event){
        //         var restaurante = event.target.options.tipus + " " +event.target.options.title;
        //         event.target.bindPopup(restaurante).openPopup();
        //     }
        // },
    });

    if (overlayMaps.hasOwnProperty("POI")) {
        map.removeLayer(overlayMaps["POI"]);
    }
    map.addLayer(opl);
    overlayMaps.POI = opl;
    console.log('zzzzz');
    return opl;
};

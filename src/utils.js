import { SEARCH_RADIUS, SEARCH_RADIUS_METER, CATEGORIE_KEYS, SOPOI_CAT_OSM, SOPOI_CAT_DETAIL, OVERPASS_INTERPRETER, STATIONS_DATA_FILE, OSM_ORG_ENDPOINT } from './constants.js'
import { SOPOI_CAT_DISPLAY } from './styles.js'
import { overlayMaps, layerControl, poiLegend} from './base.js'
import { subwayIcon, targetIcon, poiIcon} from './icons.js'
import { displayStatistics } from './statistics.js'

var clickedStation = null;
// Show subway stations worldwide on the map
export async function handleClickStationAsync(station) {
    const startTimeMain = new Date().getTime();
    const res = await handleClickStation(station);
    const endTimeMain = new Date().getTime();
    const executionTimeMain = endTimeMain - startTimeMain;
    console.log(`function handleClickStationAsync execution time: ${executionTimeMain / 1000} s`);
}

export async function createStationMarkers(stationsData) {
    var stationMarkers = L.markerClusterGroup(
    );
    stationsData.forEach(function (station) {
        var stationMarker = L.marker(new L.LatLng(station.lat, station.lon), {icon: subwayIcon});

        stationMarker.on('click', function() {
            if (!overlayMaps.hasOwnProperty("legend")) {
                overlayMaps.legend = true;
                poiLegend.addTo(map);
            }

            handleClickStationAsync(station);
        });

        overlayMaps["stations"] = stationMarker;
        stationMarkers.addLayer(stationMarker);
        stationMarker.on('mouseover', function(e) {
            this.bindPopup(
                // "osm_id: " + station.osm_id +
                "<h3>Station: " + station.name + "</h3>",
                {
                    className: 'station-popup',
                    closeButton: false,
                    autoClose: false,
                }
            ).openPopup();
        });
        stationMarker.on('mouseout', function(e) {
            this.closePopup();
        });

    });

    map.addLayer(stationMarkers);
    layerControl.addOverlay(stationMarkers, "stations");

    overlayMaps.stations = stationMarkers;
    return stationMarkers;
};

export async function handleClickStation(station) {
    // set the map and close button to normal, if previously closed
    document.getElementById('map').style.width = '75%';
    document.getElementById('closePanelBtn').style.display='flex';

    if (clickedStation !== station) {
        clickedStation = station;
    }

    document.querySelector('#downloadCSV').innerText = 'Loading...';
    document.querySelector('#downloadGeoJson').innerText = 'Loading...';

    if (overlayMaps.hasOwnProperty("selected")) {
        map.removeLayer(overlayMaps["selected"]);
    }

    addBorderCircle(station.lat, station.lon);
    await displayAllPOI(station.lat, station.lon).then(() => {
        console.log("finished displaying the pois");
    });

    await displayStatistics(station.lat, station.lon, station.name, station.pop, station.distanceToCenter);

    document.getElementById('clearPOI').addEventListener('click', clearPOI);
};

// show poi on map and statistics on panel when click on a target
export function handleSearchedPlace(data, searchedRes) {
    searchedRes.clearLayers();

    if (overlayMaps.hasOwnProperty("selected")) {
        map.removeLayer(overlayMaps["selected"]);
    }

    if (overlayMaps.hasOwnProperty("border")) {
        map.removeLayer(overlayMaps["border"]);
    }

    if (overlayMaps.hasOwnProperty("POI_group")) {
        map.removeLayer(overlayMaps["POI_group"]);
    }

    let selectedArr = [];
    for (let i = data.results.length - 1; i >= 0; i--) {
        let target = data.results[i];
        let targetMarker = L.marker(target.latlng, {icon: targetIcon});

        (function(target) {
            targetMarker.on('mouseover', function(e) {
                if (target.text !== null) {
                    this.bindPopup(
                        "<h3>" + target.text + "</h3>",
                        {
                            className: 'station-popup',
                            closeButton: false,
                            autoClose: false,
                        }
                        ).openPopup();
                } else {
                    this.bindPopup(
                        "<h3>searched target</h3>",
                        {
                            className: 'station-popup',
                            closeButton: false,
                            autoClose: false,
                        }
                        ).openPopup();
                }
            });

            targetMarker.on('mouseout', function(e) {
                this.closePopup();
            });

            targetMarker.on('click', function(e) {
                // set the map and close button to normal, if previously closed
                document.getElementById('map').style.width = '75%';
                document.getElementById('closePanelBtn').style.display='flex';

                addBorderCircle(target.latlng.lat, target.latlng.lng);
                displayAllPOI(target.latlng.lat, target.latlng.lng);
                displayStatistics(target.latlng.lat, target.latlng.lng);
            });
        })(target);

        selectedArr.push(targetMarker);
    };

    let targets = L.layerGroup(selectedArr);
    searchedRes.addLayer(targets);
    overlayMaps["selected"] = targets;

    document.getElementById('clearPOI').addEventListener('click', clearPOI);
};

// save overpasslayer of all categories in an array, save feature info as cache
export async function getAllPOI(lat, lon) {
    const startTime = new Date().getTime();

    // clear up poi cache
    var opl_arr = [];

    for (const [category, details] of Object.entries(SOPOI_CAT_DETAIL)) {
        for (const detailCat in details) {
            // console.log(key, detailCat, vals);
            var opl = await searchPOICat(lat, lon, category, detailCat);
            opl_arr.push(opl);
        }
    };

    const endTime = new Date().getTime();
    console.log("Time for function getAllPOI (Preparing opl for map show): ", (endTime - startTime) / 1000, "s");
    return opl_arr;
};

// display all poi on the map
export async function displayAllPOI(lat, lon) {
    // Show the mask
    const loadingIndicator = document.getElementById('loading-indicator');
    loadingIndicator.style.display = 'flex';

    const startTime = new Date().getTime();

    let zoom = Math.log2(map.getSize().y * 40);

    map.setView(new L.LatLng(lat, lon), zoom);

    let opl_arr = await getAllPOI(lat, lon);


    var opl_group = L.layerGroup(opl_arr);

    if (overlayMaps.hasOwnProperty("POI_group")) {
        map.removeLayer(overlayMaps["POI_group"]);
    }
    overlayMaps.POI_group = opl_group;
    opl_group.addTo(map);

    const endTime = new Date().getTime();
    console.log("Time for function displayAllPOI to execute: ", (endTime - startTime) / 1000, "s");
}

// help generate the query specifed for OverpassLayer
export function genOPLQueryHelper(lat, lon, category, values) {
    const queryHelp = values.map(value => `t["${category}"]=="${value}"`).join(" || ");
    let poiQuery = `nwr(around:${SEARCH_RADIUS_METER},${lat},${lon})(if:`;
    poiQuery += queryHelp;
    poiQuery += ')';
    return poiQuery;
};

function openNewPage(url) {
        window.open(url, '_blank');
    };


export async function searchPOICat(lat, lon, category, detailCat) {

    const overpassURL = '//overpass-api.de/api/interpreter';

    const overpassFrontend = new OverpassFrontend(overpassURL, {
        timeGap: 10,
        effortPerRequest: 100
    });

    let poiQuery = genOPLQueryHelper(lat, lon, category, SOPOI_CAT_DETAIL[category][detailCat]);

    let poi_color = SOPOI_CAT_DISPLAY[detailCat]['color'];


    // function openNewPage(url) {
    //     window.open(url, '_blank');
    // };

    // clear up poi feature info
    var opl = new OverpassLayer({
        overpassFrontend: overpassFrontend,
        query: poiQuery,

        minZoom: 13,
        feature: {
            title: function (info) {
                let title = '';

                let headline = {};
                for (let key in info.tags) {
                    // title += '<b>' + key + '</b>: ' + info.tags[key] + '<br>';
                    if (key == "name") {
                        headline['name'] = info.tags[key];
                    }
                    if (CATEGORIE_KEYS.includes(key)) {
                        headline['type'] = {'key': key, 'val': info.tags[key]};
                    }
                }


                if (headline['name'] !== undefined) {
                    title += '<h3>' + headline['name'] + '</h3>';
                } else {
                    title += '<h3>' + "Name Undefined" + '</h3>';
                }

                title += '<p>' + headline['type']['key'] + ': <em>' + headline['type']['val'] + '</em></p>';

                return title;
            },
            style: {
                width: 1,
                color: poi_color,
                fillColor: poi_color,
                opacity: 0.9,
                fillOpacity: 0.4,
                radius: 5
            },
            description: function (info) {
                if (info.osm_id === null) {
                    return;
                }
                let link = `${OSM_ORG_ENDPOINT}/${info.type}/${info.osm_id}`;
                let descrip = `<a href="#"
                    onclick="(function(url) { window.open(url, '_blank'); })('${link}'); return false;">
                    See this place on OpenStreetMap</a>`;
                return descrip;
            },
            // body: function (info) {
            //     let content = '<b>Other tags information:</b><br>';
            //     content += '<b>' + 'id' + '</b>: ' + info.id + '<br>';
            //     content += '<b>' + 'osm_id' + '</b>: ' + info.osm_id + '<br>';
            //     for (let key in info.tags) {
            //         content += '<b>' + key + '</b>: ' + info.tags[key] + '<br>';
            //     }
            //     return content;
            // },
        }
    });

    return opl;

}


export function displaySelectStation(lat, lon) {
    // add selected subway station marker
    map.setView(new L.LatLng(lat, lon), 15);

    if (overlayMaps.hasOwnProperty("selected")) {
        map.removeLayer(overlayMaps["selected"]);
    }
    var selectedStation = L.marker([lat, lon], {icon: subwayIcon});
    selectedStation.addTo(map);

    overlayMaps.selected = selectedStation;

}

export function addBorderCircle(lat, lon) {
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
    borderCircle.bringToBack();
}


export function clearPOI() {
    if (overlayMaps.border !== undefined) {
        map.removeLayer(overlayMaps["border"]);
    }
    if (overlayMaps.POI_group != undefined) {
        map.removeLayer(overlayMaps["POI_group"]);
    }
    if (overlayMaps.selected !== undefined) {
        map.removeLayer(overlayMaps["selected"]);
    }

    // document.getElementById('closePanelBtn').style.display='flex';
    document.getElementById('defaultpanel').style.display = 'block';
    document.getElementById('statspanel').style.display = 'none';

};


// ==========================================

export function searchPOI(lat, lon) {

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
        node(around:1000, ${lat}, ${lon})[amenity];
        node(around:1000, ${lat}, ${lon})[leisure];
        node(around:1000, ${lat}, ${lon})[shop];
        node(around:1000, ${lat}, ${lon})[historic];);
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
    displaySelectStation(lat, lon);

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

    var bounds = { minlat: lat-SEARCH_RADIUS, maxlat: lat+SEARCH_RADIUS, minlon: lon-SEARCH_RADIUS, maxlon: lon+SEARCH_RADIUS }

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
            console.log('* ' + result.tags.name + ' (' + result.id + ')');
            displayResults(result);
        },
        function (err) {
            if (err) { console.log(err) };
        }
    )
};

export function displayResults(result) {
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
}

// export function buildOPL(lat, lon, category) {
//     const overpassURL = '//overpass-api.de/api/interpreter';

//     const overpassFrontend = new OverpassFrontend(overpassURL, {
//         timeGap: 10,
//         effortPerRequest: 100
//     });

//     let poiQuery = genOPLQueryHelper(lat, lon, category, SOPOI_CAT[category]);

//     var poi_color = 'grey';

//     if (category == "amenity") {
//         poi_color = 'red';
//     }
//     else if (category == "leisure"){
//         poi_color = 'green';
//     }
//     else if (category == "shop"){
//         poi_color = 'orange';
//     }
//     else if (category == "historic"){
//         poi_color = 'blue';
//     }

//     return new Promise((resolve, reject) => {
//         setTimeout(() => {
//             var poiCache = [];
//             let opl = new OverpassLayer({
//                 overpassFrontend: overpassFrontend,
//                 query: poiQuery,

//                 minZoom: 13,
//                 feature: {
//                     title: function (info) {
//                         var title = '';
//                         title += '<b>' + 'id' + '</b>: ' + info.id + '<br>';
//                         title += '<b>' + 'osm_id' + '</b>: ' + info.osm_id + '<br>';

//                         for (var key in info.tags) {
//                             title += '<b>' + key + '</b>: ' + info.tags[key] + '<br>';
//                         }

//                         // for saving the info to local
//                         // console.log(JSON.stringify(info));
//                         var feature_info = {"osm_id": info.osm_id, "type": info.type, "tags": info.tags};
//                         poiCache.push(feature_info);

//                         return title;
//                     },
//                     style: {
//                         width: 1,
//                         color: poi_color,
//                         fillColor: poi_color,
//                         opacity: 0.9,
//                         fillOpacity: 0.5
//                     }
//                 }
//             });
//             resolve({"opLayer": opl, "oplFeatures": poiCache});
//         }, 10000);
//     });
// };
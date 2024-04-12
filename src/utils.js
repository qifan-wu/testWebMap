import { SEARCH_RADIUS, SEARCH_RADIUS_METER, CATEGORIE_KEYS, SOPOI_CAT, SOPOI_CAT_DETAIL, OVERPASS_INTERPRETER, STATIONS_DATA_FILE, OSM_ORG_ENDPOINT } from './constants.js'
import { overlayMaps, layerControl, poiLegend} from './base.js'
import { subwayIcon, targetIcon, poiIcon} from './icons.js'
import { displayStatistics } from './statistics.js'
import { PUBLIC_INSTITUTION_COLOR, COMMERCE_COLOR, COMMUNITY_SPACE_COLOR, RECREATION_ACT_COLOR, RELIGION_COLOR} from './styles.js';

// Show subway stations worldwide on the map
export function createStationMarkers(stationsData) {
    var stationMarkers = L.markerClusterGroup(
    );
    stationsData.forEach(function (station) {
        var stationMarker = L.marker(new L.LatLng(station.lat, station.lon), {icon: subwayIcon});

        stationMarker.on('click', function() {
            console.log('clicked');

            if (!overlayMaps.hasOwnProperty("legend")) {
                overlayMaps.legend = true;
                poiLegend.addTo(map);
            }

            document.querySelector('#downloadCSV').innerText = 'Loading...';

            // if (overlayMaps.hasOwnProperty("stations")) {
            //     map.removeControl(overlayMaps["stations"]);
            //     map.removeLayer(overlayMaps["stations"]);
            // }

            // displaySelectStation(station.lat, station.lon);
            if (overlayMaps.hasOwnProperty("selected")) {
                map.removeLayer(overlayMaps["selected"]);
            }

            addBorderCircle(station.lat, station.lon);
            displayAllPOI(station.lat, station.lon).then(() => {
                console.log("finished displaying the pois");
            });

            displayStatistics(station.lat, station.lon, station.name, station.pop, station.distanceToCenter);
        });

        overlayMaps["stations"] = stationMarker;
        stationMarkers.addLayer(stationMarker);
        stationMarker.on('mouseover', function(e) {
            this.bindPopup("osm_id: " + station.osm_id +
                            "<br>name: " + station.name).openPopup();
        });

    });

    map.addLayer(stationMarkers);
    layerControl.addOverlay(stationMarkers, "stations");

    overlayMaps.stations = stationMarkers;
    return stationMarkers;
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
                    this.bindPopup(target.text).openPopup();
                } else {
                    this.bindPopup("searched target").openPopup();
                }
            });

            targetMarker.on('click', function(e) {
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
    console.log("Time for Preparing opl for map show: ", (endTime - startTime) / 1000, "s");
    return opl_arr;
};

export function downloadPOI(lat, lon) {
    // let query = genQueryHelper(lat, lon);
    // let query = '(node["amenity"~".*"]; node["historic"~".*"];);out body;'
    let query = `[out:json];
(nwr(around:1000,${lat},${lon})["leisure"];);
out body;`
    // console.log(query);

    fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(query)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error with fetch", error);
    })

}

// display all poi on the map
export async function displayAllPOI(lat, lon) {
    map.setView(new L.LatLng(lat, lon), 15);

    let opl_arr = await getAllPOI(lat, lon);
    var opl_group = L.layerGroup(opl_arr);

    // var dldata = downloadPOI(lat, lon);
    // console.log(dldata);

    if (overlayMaps.hasOwnProperty("POI_group")) {
        map.removeLayer(overlayMaps["POI_group"]);
    }
    overlayMaps.POI_group = opl_group;
    opl_group.addTo(map);

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

    var poi_color = 'grey';


    if (detailCat == "public_institution") {
        poi_color = PUBLIC_INSTITUTION_COLOR;
    }
    else if (detailCat == "commerce"){
        poi_color = COMMERCE_COLOR;
    }
    else if (detailCat == "community_space"){
        poi_color = COMMUNITY_SPACE_COLOR;
    }
    else if (detailCat == "recreational_activities"){
        poi_color = RECREATION_ACT_COLOR;
    }
    else if (detailCat == "religion"){
        poi_color = RELIGION_COLOR;
    }

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

                if (headline['name'] != "undefined") {
                    title += '<h2>' + headline['name'] + '</h2>';
                } else {
                    title += '<h2>' + "Name Unavailable" + '</h2>';
                }

                title += '<h3>' + headline['type']['key'] + ': ' + headline['type']['val'] + '</h3>';

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
                    See something wrong? Click here to update it with OSM editor</a>`;
                return descrip;
            },
            body: function (info) {
                let content = '<b>Other tags information:</b><br>';
                content += '<b>' + 'id' + '</b>: ' + info.id + '<br>';
                content += '<b>' + 'osm_id' + '</b>: ' + info.osm_id + '<br>';
                for (let key in info.tags) {
                    content += '<b>' + key + '</b>: ' + info.tags[key] + '<br>';
                }
                return content;
            },
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
}



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
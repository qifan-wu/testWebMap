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




const bbox = [lat_min, lon_min, lat_max, lon_max];
// const ohsomeEndpoint = "https://api.ohsome.org/v1/elements";
const SEARCH_RADIUS = 1000;
const ohsomeEndpoint = "https://api.ohsome.org/v1/elements";


// document.getElementById("buildingArea").innerHTML = getBuildingArea1(40.632967, -73.943950);
// function getBuildingArea1(lat, lon) {
//     return lat + lon;
// }
function test(lat, lon) {
    console.log(lat, lon);
}



export function genQueryHelper(lat, lon) {
    let query = `
        [out:json];
        (`;
    for (const cat in SOPOI_CAT) {
        const values = SOPOI_CAT[cat];
        const valStr = values.join('|');

        query += `nwr(around:${SEARCH_RADIUS_METER},${lat},${lon})["${cat}"~"${valStr}"];`
    }
    query += `
        );
        out body;
        >;
        out skel qt;`;
    return query;
};
// const SOPOI_CAT = {
//                 amenity: [
//                     "social facility", "library", "arts centre", "school", "university", "college"
//                 ],
//                 leisure: [
//                     "park", "garden"
//                 ]
//             };
const SEARCH_RADIUS_METER = 1000;

async function getPOIdata(latitude, longitude) {
            const radius = 1000; // 1000 meters

            // Constructing the Overpass API query
            // const overpassQuery = `[out:json];
            //     (
            //         nwr(around:${radius},${latitude},${longitude})["amenity"~"school|college|restaurant"] ;

            //         node(around:${radius},${latitude},${longitude})["leisure"~"park|garden"] ;
            //         way(around:${radius},${latitude},${longitude})["leisure"~"park|garden"] ;
            //         relation(around:${radius},${latitude},${longitude})["leisure"~"park|garden"] ;
            //     );
            //     out body;
            //     >;
            //     out skel qt;`;

            let SEARCH_RADIUS_METER = 1000; ///
            // let query = `
            //     [out:json];
            //     (`;
            // for (const cat in SOPOI_CAT) {
            //     const values = SOPOI_CAT[cat];
            //     const valStr = values.join('|');

            //     query += `nwr(around:${SEARCH_RADIUS_METER},${latitude},${longitude})["${cat}"~"${valStr}"];`
            // }
            // query += `
            //     );
            //     out body;
            //     >;
            //     out skel qt;`;

            const overpassQuery = genQueryHelper(latitude, longitude);
            console.log(overpassQuery);

            try {
                // Sending the request to Overpass API
                const response = await fetch('https://overpass-api.de/api/interpreter', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: `data=${encodeURIComponent(overpassQuery)}`
                });

                // Parsing the response
                const data = await response.json();
                console.log(data.elements[0]);
                return data.elements;
            } catch (error) {
                console.error('Error fetching places:', error);
                return null;
            }
        }

const CATEGORIES = ["amenity", "leisure", "shop", "historic"];

function processPOIData(poiData) {
    // clear up poiCount
    var poiCount = {"amenity": 0, "leisure": 0, "shop": 0, "historic": 0};
    for (let i=0; i<poiData.length; i++) {
        let poi = poiData[i];

        if (poi.tags == undefined) {
            continue;
        }
        else if (poi.tags.hasOwnProperty("amenity")) {
            poiCount.amenity += 1;
        }
        else if (poi.tags.hasOwnProperty("leisure")) {
            poiCount.leisure += 1;
        }
        else if (poi.tags.hasOwnProperty("shop")) {
            poiCount.shop += 1;
        }
        else if (poi.tags.hasOwnProperty("historic")) {
            poiCount.historic += 1;
        }
    }
    console.log(poiCount)
    return poiCount;
};

function convertJsonToCSV(poiData) {
    if (!poiData || poiData.length === 0) {
        return '';
    }
    const csvHeader = 'id, type, tags\n';
    const csvRows = poiData.map(element => {
        if (element.tags !== undefined) {
            const tags = JSON.stringify(element.tags);
            return `${element.id},${element.type},${tags}`;
        }
    });
    return csvHeader + csvRows.join('\n');
}

function convertJsonToGeoJson(poiData) {
    if (!poiData || poiData.length === 0) {
        return { type: 'FeatureCollection', features: [] }; // Return empty GeoJSON FeatureCollection if there's no data
    }

    // Helper function to get coordinates for a node ID
    const getNodeCoordinates = nodeId => {
        const node = poiData.find(item => item.type === 'node' && item.id === nodeId);
        return node ? [node.lon, node.lat] : null;
    };

    const features = poiData.map(element => {
        if (!element.tags) {
            return null; // Skip element without tags
        }

        let geometry;
        if (element.type === "node") {
            geometry = {
                type: 'Point',
                coordinates: [element.lon, element.lat] // GeoJSON coordinates are [longitude, latitude]
            };
        }
        else if (element.type === "way") {
            const coordinates = element.nodes.map(nodeId => getNodeCoordinates(nodeId)).filter(coord => coord !== null);
            if (coordinates.length < 2) {
                return null; // Skip ways with less than 2 valid coordinates
            }
            geometry = {
                type: 'Polygon',
                coordinates
            };
        }
        // else if (element.type === "relation") {

            // const outerWay = element.members.find(member => member.type === 'way' && member.role === 'outer');
            // const innerWays = element.members.filter(member => member.type === 'way' && member.role === 'inner');
            // if (outerWay) {
            //     const outerNodes = outerWay.ref.nodes.map(node => [node.lon, node.lat]);
            //     const innerRings = innerWays.map(innerWay => innerWay.ref.nodes.map(node => [node.lon, node.lat]));

            //     geometry = {
            //         type: 'MultiPolygon',
            //         coordinates: [outerNodes, ...innerRings]
            //     };
            // } else {
            //     return null; // Skip relation if outer way is not found
            // }

        // }
        else {
            return null;
        }


        const properties = {id: element.id, type: element.type, tags: element.tags}
        return {
            type: 'Feature',
            properties,
            geometry
        };
    }).filter(feature => feature !== null);
    return {type: 'FeatureCollection', features};
};

// getBuildingArea(40.632967, -73.943950);
// getRoadLength(40.632967, -73.943950);
test(40.632967, -73.943950);
// getPOIgeojson(40.632967, -73.943950);
var poiData = await getPOIdata(40.632967, -73.943950);
processPOIData(poiData);
// console.log(JSON.stringify(poiData));
// var csvdata = convertJsonToCSV(poiData);
// console.log(csvdata);
var geojsondata = convertJsonToGeoJson(poiData);
console.log(JSON.stringify(geojsondata))




// ///////======

async function getPOIgeojson(lat, lon) {
    var poiQuery = `(
        node(around:1000, ${lat}, ${lon})[amenity];
        node(around:1000, ${lat}, ${lon})[leisure];
        node(around:1000, ${lat}, ${lon})[shop];
        node(around:1000, ${lat}, ${lon})[historic];);
        out qt;`;

    var result = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
            method: "POST",
            // The body contains the query
            // to understand the query language see "The Programmatic Query Language" on
            // https://wiki.openstreetmap.org/wiki/Overpass_API#The_Programmatic_Query_Language_(OverpassQL)
            body: "data="+ encodeURIComponent(`
                [bbox:30.618338,-96.323712,30.591028,-96.330826]
                [out:json]
                [timeout:90]
                ;
                (
                    nwr
                        (
                            30.626917110746,
                            -96.348809105664,
                            30.634468750236,
                            -96.339893442898
                        );
                );
                out geom;
            `)
        },
    ).then(
        (data)=>data.json()
    )
    console.log(JSON.stringify(result , null, 2));

        // console.log(poiQuery);
}
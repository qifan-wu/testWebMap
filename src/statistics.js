import { SEARCH_RADIUS_METER, HIGHWAY_TYPES, OHSOME_ENDPOINT, MOTER_ROAD_TYPES, PEDCYCLE_ROAD_TYPES, SOPOI_CAT, SOPOI_CAT_DETAIL} from './constants.js'


export async function displayStatistics(lat, lon, name=null, population=null, distance=null) {

    // build env stats
    document.getElementById('defaultpanel').style.display = 'none';
    document.getElementById('statspanel').style.display = 'block';

    const stationDiv = document.getElementById('metroInfo');
    if (name != null) {
        stationDiv.innerHTML = `<h3>Metro Station: ${name}</h3>`;
    } else {
        name = "Selected_Target";
        stationDiv.innerHTML = `<h3>Selected Target</h3>`
    }

    // population
    const popInfoDiv = document.getElementById('popInfo');
    if (population != null) {
        popInfoDiv.innerHTML = `<p>Population: ${Math.round(population).toLocaleString()}</p>`;
    } else {
        popInfoDiv.innerHTML = `<p>Population not available</p>`;
    }

    // distance to center
    const distDiv = document.getElementById('distToCenter');
    if (distance != null) {
        distDiv.innerHTML = `<p>Distance to city center: ${(distance / 1000).toFixed(2)}km </p>`;
    } else {
        distDiv.innerHTML = `<p>Distance to city center not available </p>`;
    }

    // building
    var buildingArea = await getBuildingArea(lat, lon);
    const buildingDiv = document.getElementById("buildingAreaInfo");
    buildingDiv.innerHTML = `<p>Total Building Area: ${Math.round(buildingArea).toLocaleString()}m² </p>`;

    // highway
    var highwayStatistics = await getRoadLength(lat, lon);
    displayRoadLen(highwayStatistics);

    // poi statistics
    showPOIstats(lat, lon, name);
}


// ====== Build Environment statistics =======
export async function getBuildingArea(lat, lon) {
    let bcircle = [lon,lat, SEARCH_RADIUS_METER]
    const params = new URLSearchParams({
        bcircles: bcircle,
        time: "2024-01-01",
        filter: "building=yes and type:way"
    });

    const url = `${OHSOME_ENDPOINT}/area?${params}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch building area statistics: ${response.status}`);
        }
        const data = await response.json();
        var buildingArea = data.result[0].value;

        return buildingArea;
    } catch (error) {
        console.error("Error fetching building area:", error);
        return -1;
    }


};


export async function getRoadLength(lat, lon) {

    let bcircle = [lon,lat, SEARCH_RADIUS_METER];
    const params = new URLSearchParams({
        bcircles: bcircle,
        time: "2024-01-01",
        filter: "highway=* and type:way",
        groupByKey: "highway",
        groupByValues: HIGHWAY_TYPES
    });

    const url = `${OHSOME_ENDPOINT}/length/groupBy/tag?${params}`;
    // const highwayDiv = document.getElementById('highwayInfo');

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch road length statistics: ${response.status}`);
        }
        const data = await response.json();

        var moterLen = 0;
        var pedestrianLen = 0;
        var othersLen = 0;

        data.groupByResult.forEach((highway) => {
            const roadLen = highway.result[0].value;
            const highwayType = highway.groupByObject; // highwayType e.g. "highway=residential"

            if (MOTER_ROAD_TYPES.includes(highwayType.slice(8))) {
                moterLen += roadLen;
            }
            else if (PEDCYCLE_ROAD_TYPES.includes(highwayType.slice(8))) {
                pedestrianLen += roadLen;
            }
            else {
                othersLen += roadLen;
            }
        });

        return {
            moterLen: moterLen,
            pedestrianLen: pedestrianLen,
            othersLen: othersLen
        };

    } catch (error) {
        console.error("Error fetching road length:", error);
        return null;
    };

};

export function displayRoadLen(roadLenInfo) {
    if (roadLenInfo == null) {
        highwayDiv.innerHTML = `<p>Total Road Length Not Available</p>`;
    }
    document.getElementById('highway-chart').style.display = 'flex';

        let moterLen = roadLenInfo.moterLen;
        let pedestrianLen = roadLenInfo.pedestrianLen;
        let othersLen = roadLenInfo.othersLen;
        const totalLen = moterLen + pedestrianLen + othersLen;

        const highwayDiv = document.getElementById('highwayInfo');
        highwayDiv.innerHTML = `<p>Total Road Length: ${(totalLen / 1000).toFixed(1)}km</p>`;

        const moterProportion = (moterLen / totalLen) * 100;
        const pedestrianProportion = (pedestrianLen / totalLen) * 100;
        const othersProportion = (othersLen / totalLen) * 100;

        document.getElementById('moterBar').style.setProperty('width', `${moterProportion}%`);
        document.getElementById('pedestrianBar').style.setProperty('width', `${pedestrianProportion}%`);
        document.getElementById('othersBar').style.setProperty('width', `${othersProportion}%`);

        document.getElementById('moterBar').innerHTML = `<p>Motor Vehicles<br>${(moterLen/1000).toFixed(1)}km</p>`;
        document.getElementById('pedestrianBar').innerHTML = `<p>Biking/Pedestrian friendly<br>${(pedestrianLen/1000).toFixed(1)}km</p>`;
        document.getElementById('othersBar').innerHTML = `<p>Other<br>${(othersLen/1000).toFixed(1)}km</p>`;
        // console.log(moterProportion, pedestrianProportion, othersProportion);
        document.getElementById('barLegend').style.setProperty('display', 'flex');

};


// help generate the overpass query
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

// ====== POI statistics and data download =======
// get poi data for download from overpass API
export async function getPOIdata(latitude, longitude) {
    const startTime = new Date().getTime();

    const overpassQuery = genQueryHelper(latitude, longitude);
    // console.log(overpassQuery);

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
        // console.log(data.elements[0]);
        const endTime = new Date().getTime();
        console.log("Time for retrieving poi data for download", (endTime - startTime) / 1000, "s");
        return data.elements;
    } catch (error) {
        console.error('Error fetching places:', error);
        return null;
    }
};

// get the poi count of each category
export function processPOIData(poiData) {
    // var poiCount = {"amenity": 0, "leisure": 0, "shop": 0, "historic": 0};
    let poiCount = {
        "public_institution": 0,
        "commerce": 0,
        "community_space": 0,
        "recreational_activities": 0,
        "religion": 0,
    };

    for (let i=0; i<poiData.length; i++) {
        let poi = poiData[i];

        if (poi.tags == undefined) {
            continue;
        }
        for (const [category, details] of Object.entries(SOPOI_CAT_DETAIL)) {
            if (poi.tags.hasOwnProperty(category)) {
                for (const [detailCat, vals] of Object.entries(details)) {
                    if (vals.includes(poi.tags[category])) {
                        poiCount[detailCat] += 1;
                        break;
                    }
                };
                break;
            };
        };

        // else if (poi.tags.hasOwnProperty("amenity")) {

        //     poiCount.amenity += 1;
        // }
        // else if (poi.tags.hasOwnProperty("leisure")) {
        //     poiCount.leisure += 1;
        // }
        // else if (poi.tags.hasOwnProperty("shop")) {
        //     poiCount.shop += 1;
        // }
        // else if (poi.tags.hasOwnProperty("historic")) {
        //     poiCount.historic += 1;
        // }
    }
    return poiCount;
};


// export function convertJsonToCSV(poiData) {
//     if (!poiData || poiData.length === 0) {
//         return '';
//     }
//     const csvHeader = 'id, type, tags\n';
//     const csvRows = poiData.map(element => {
//         if (element.tags !== undefined) {
//             const tags = JSON.stringify(element.tags);
//             return `${element.id},${element.type},${tags}`;
//         }
//     });
//     return csvHeader + csvRows.join('\n');
// };
export function convertJsonToCSV(poiData) {
    if (!poiData || poiData.length === 0) {
        return '';
    }
    const attrs = ['id', 'type'];
    const attrs_tags = ['name', 'amenity', 'leisure', 'shop', 'historic', 'cuisine', 'addr:street', 'addr:postcode', 'website']
    const csvHeader = attrs.concat(attrs_tags).join(',');
    const csvRows = poiData.map(element => {
        if (element.tags == undefined) {
            return;
        }
        let csvRow = `${element.id},${element.type}`;

        attrs_tags.forEach(tag_name => {
            let tagVal = element.tags[tag_name];
            if (tagVal == undefined) {
                csvRow += ",";
            } else {
                csvRow += `,${tagVal}`;
            }
        });
        return csvRow;
    });
    // add header
    csvRows.unshift(csvHeader);

    return csvRows.join('\r\n');
};

export function convertJsonToGeoJson(poiData) {
    let json = {elements: poiData};
    let geoJson = osmtogeojson(json);
    // console.log();
    return JSON.stringify(geoJson);
};


export async function showPOIstats(lat, lon, stationName) {

    let poiData = await getPOIdata(lat, lon);
    // console.log(JSON.stringify(poiData));
    // change download button after retrieving finished
    document.querySelector('#downloadCSV').innerText = 'Download POI Data in CSV';
    document.querySelector('#downloadGeoJson').innerText = 'Download POI Data in Geojson';

    const startTimePC = new Date().getTime();
    let poiCount = processPOIData(poiData);

    const poiInfoDiv = document.getElementById('poiStats');
    if (poiCount == null) {
        poiInfoDiv.innerHTML = `<p>POI information not available</p>`;
    } else {
        let poiInfoTxt = '';
        let totalPOICount = 0;
        for (const detailCat in poiCount) {
            poiInfoTxt += `${detailCat}: ${poiCount[detailCat]}\n`;
            totalPOICount += poiCount[detailCat];
        }
        poiInfoDiv.innerHTML = `
        <p>Total count of POI: ${totalPOICount}, including:</p>
        <p>${poiInfoTxt}</p>
        `;
    }

    const endTimePC = new Date().getTime();
    console.log("Time for Preparing poi count stats: ", (endTimePC - startTimePC) / 1000, "s");

    downloadCSV(poiData, stationName);
    downloadGeoJson(poiData, stationName);
};

export function downloadCSV(poiData, stationName) {
    document.getElementById('downloadCSV').addEventListener('click', function() {
        const startTimeCSV = new Date().getTime();

        const poiDataCSV = convertJsonToCSV(poiData);
        this.textContent = "Downloading";
        let fileName = stationName.replace(/ /g, "_") + "_POIdata.csv";

        downloadData(poiDataCSV, fileName);
        this.textContent = "Download finished";

        const endTimeCSV = new Date().getTime();
        console.log("Time for csv download: ", (endTimeCSV - startTimeCSV) / 1000, "s");
    });
};

export function downloadGeoJson(poiData, stationName) {
    document.getElementById('downloadGeoJson').addEventListener('click', function() {
        const startTimeGeojson = new Date().getTime();

        const poiDataGeojson = convertJsonToGeoJson(poiData);
        this.textContent = "Downloading";
        let fileName = stationName.replace(/ /g, "_") + "_POIdata.geojson";

        downloadData(poiDataGeojson, fileName);
        this.textContent = "Download finished";

        const endTimeGeojson = new Date().getTime();
        console.log("Time for Geojson download: ", (endTimeGeojson - startTimeGeojson) / 1000, "s");
    });
}

export function downloadData(data, file_name) {
    var blob = new Blob([data], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


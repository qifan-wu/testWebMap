import { SEARCH_RADIUS_METER, HIGHWAY_TYPES, OHSOME_ENDPOINT, MOTER_ROAD_TYPES, PEDCYCLE_ROAD_TYPES, SOPOI_CAT} from './constants.js'


export async function displayStatistics(lat, lon, name=null, population=null, distance=null) {

    // build env stats
    document.getElementById('defaultpanel').style.display = 'none';
    document.getElementById('statspanel').style.display = 'block';

    const stationDiv = document.getElementById('metroInfo');
    if (name != null) {
        stationDiv.innerHTML = `<h3>Metro Station: ${name}</h3>`;
    } else {
        stationDiv.innerHTML = `<h3>Selected Target</h3>`
    }

    const popInfoDiv = document.getElementById('popInfo');
    if (population != null) {
        popInfoDiv.innerHTML = `<p>Population: ${population}</p>`;
    } else {
        popInfoDiv.innerHTML = `<p>Population Not Available</p>`;
    }

    const distDiv = document.getElementById('distToCenter');
    if (distance != null) {
        distDiv.innerHTML = `<p>Distance to city center: ${distance} meters </p>`;
    } else {
        distDiv.innerHTML = `<p>Distance to city center not available </p>`;
    }

    var buildingArea = await getBuildingArea(lat, lon);

    var highwayStatistics = await getRoadLength(lat, lon);
    displayRoadLen(highwayStatistics);

    const buildingDiv = document.getElementById("buildingAreaInfo");
    buildingDiv.innerHTML = `<p>Total Building Area: ${buildingArea} square meter </p>`;

    // poi statistics
    showPOIstats(lat, lon);
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
        highwayDiv.innerHTML = `<p>Total Road Length is ${totalLen}m</p>`;

        const moterProportion = (moterLen / totalLen) * 100;
        const pedestrianProportion = (pedestrianLen / totalLen) * 100;
        const othersProportion = (othersLen / totalLen) * 100;

        document.getElementById('moterBar').style.setProperty('width', `${moterProportion}%`);
        document.getElementById('pedestrianBar').style.setProperty('width', `${pedestrianProportion}%`);
        document.getElementById('othersBar').style.setProperty('width', `${othersProportion}%`);

        document.getElementById('moterBar').innerHTML = `<p>Auto<br>${moterLen.toFixed(2)}m</p>`;
        document.getElementById('pedestrianBar').innerHTML = `<p>Biking/Pedestrian-friendly<br>${pedestrianLen.toFixed(2)}m</p>`;
        document.getElementById('othersBar').innerHTML = `<p>Other<br>${othersLen.toFixed(2)}m</p>`;
        // console.log(moterProportion, pedestrianProportion, othersProportion);

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
        return data.elements;
    } catch (error) {
        console.error('Error fetching places:', error);
        return null;
    }
};

// get the poi count of each category
export function processPOIData(poiData) {
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
    return poiCount;
};


export function convertJsonToCSV(poiData) {
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
};


export async function showPOIstats(lat, lon) {
    let poiData = await getPOIdata(lat, lon);
    document.querySelector('#downloadCSV').innerText = 'Download POI Data in CSV';

    let poiCount = processPOIData(poiData);

    console.log(poiCount);
    const poiInfoDiv = document.getElementById('poiStats');
    if (poiCount == null) {
        poiInfoDiv.innerHTML = `<p>POI information not available</p>`;
    } else {
        poiInfoDiv.innerHTML = `
        <p>Total count of POI: ${poiCount.amenity + poiCount.leisure + poiCount.shop + poiCount.historic}</p>
        <p>amenity: ${poiCount.amenity}, leisure: ${poiCount.leisure}, shop: ${poiCount.shop}, historic: ${poiCount.historic}</p>
        `;
    }

    document.getElementById('downloadCSV').addEventListener('click', function() {
        const poiDataCSV = convertJsonToCSV(poiData);
        this.textContent = "Downloading";
        downloadData(poiDataCSV, "poi_data.csv");
        this.textContent = "Download finished";
    });
};


export function downloadData(data, file_name) {
    var blob = new Blob([data], { type: "text/plain" });
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


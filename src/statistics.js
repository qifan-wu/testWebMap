import { SEARCH_RADIUS_METER, HIGHWAY_TYPES, OHSOME_ENDPOINT } from './constants.js'

export async function displayStatistics(lat, lon, population=null, distance=null) {
    // debugger;
    const popInfoDiv = document.getElementById('popInfo');
    if (population != null) {
        popInfoDiv.innerHTML = population;
    } else {
        popInfoDiv.innerHTML = "Not available ";
    }

    const distDiv = document.getElementById('distToCenter');
    if (distance != null) {
        distDiv.innerHTML = distance + "meters";
    } else {
        distDiv.innerHTML = "Not available ";
    }

    var buildingArea = await getBuildingArea(lat, lon);

    var highwayStatistics = await getRoadLength(lat, lon);

    const buildingDiv = document.getElementById("buildingAreaInfo");
    buildingDiv.innerHTML = "Total Building Area: " + buildingArea + " square meter";

    const highwayDiv = document.getElementById('highwayInfo');
    highwayDiv.innerHTML = highwayStatistics;
}

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

    let bcircle = [lon,lat, SEARCH_RADIUS_METER]
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

        var totalRoadLen = 0;
        var highwayStatistics = "";
        data.groupByResult.forEach((highway) => {
            const roadLen = highway.result[0].value;
            const highwayInfo = `Type "${highway.groupByObject}" has length: ${roadLen}m`;
            highwayStatistics += `<p>${highwayInfo}</p>`;
            totalRoadLen += roadLen;
        });
        return `<p>Total Road Length is ${totalRoadLen}m</p>` + highwayStatistics;

    } catch (error) {
        console.error("Error fetching road length:", error);
    };

};
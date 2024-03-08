import { SEARCH_RADIUS_METER, HIGHWAY_TYPES, OHSOME_ENDPOINT } from './constants.js'

export async function displayStatistics(lat, lon) {
    // debugger;
    var buildingArea = await getBuildingArea(lat, lon);

    var roadInfo = getRoadLength(lat, lon);
    console.log("--------");
    console.log(buildingArea);
    const buildingDiv = document.getElementById("buildingAreaInfo");
    buildingDiv.innerHTML = "Total Building Area: " + buildingArea + " square meter";
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
        console.log(buildingArea);
        return buildingArea;
    } catch (error) {
        console.error("Error:", error);
        return -1;
    }

        // .then(response => {
        //     if (!response.ok) {
        //         throw new Error(`Failed to fetch statistics: ${response.status}`);
        //     }
        //     return response.json();
        // })
        // .then(data => {
        //     // console.log(data); // Process the response data as needed
        //     var buildingArea = data.result[0].value;
        //     console.log(buildingArea);
        //     return buildingArea;
        //     // resultDiv.innerHTML = "Total Building Area: " + buildingArea + " square meter";
        // })
        // .catch(error => {
        //     console.error("Error:", error);
        //     return -1;
        // });
};


export function getRoadLength(lat, lon) {

    let bcircle = [lon,lat, SEARCH_RADIUS_METER]
    const params = new URLSearchParams({
        bcircles: bcircle,
        time: "2024-01-01",
        filter: "highway=* and type:way",
        groupByKey: "highway",
        groupByValues: HIGHWAY_TYPES
    });

    const url = `${OHSOME_ENDPOINT}/length/groupBy/tag?${params}`;
    const highwayDiv = document.getElementById('highwayInfo');

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch statistics: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // console.log(data); // Process the response data as needed
            // console.log(data.groupByResult);
            var highwayStatistics = "";
            data.groupByResult.forEach((highway) => {
                // console.log(highway);
                // console.log(highway.groupByObject);
                // console.log(highway.result[0].value);
                const highwayInfo = `Type ${highway.groupByObject} has total length: ${highway.result[0].value}m`;
                highwayStatistics += `<p>${highwayInfo}</p>`;
                // highwayStatistics += '<p>vlaaaa</p>';


            });
            highwayDiv.innerHTML = highwayStatistics;
            // for (var obj in data.groupByResult) {
            //     console.log(obj);
            //     // console.log(obj.groupByObject);
            //     // console.log(obj.result);
            // }
        })
        .catch(error => {
            console.error("Error:", error);
        });
};
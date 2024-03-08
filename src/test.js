// New York City coordinates
var lat = 40.7128;
var lon = -74.0060;

var lat_min = 40.730610
var lon_min = -73.935242
var lat_max = lat_min + 0.3
var lon_max = lon_min + 0.3

var map = L.map('map').setView([lat, lon], 12);

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
function getBuildingArea(lat, lon) {
    let bcircle = [lon,lat, SEARCH_RADIUS]
    const params = new URLSearchParams({
        bcircles: bcircle,
        time: "2024-01-01",
        filter: "building=yes and type:way"
    });

    const url = `${ohsomeEndpoint}/area?${params}`;
    const resultDiv = document.getElementById("buildingAreaInfo");
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch statistics: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data); // Process the response data as needed
            let buildingArea = data.result[0].value;
            console.log(buildingArea);
            resultDiv.innerHTML = "Total Building Area: " + buildingArea + " square meter";
        })
        .catch(error => {
            console.error("Error:", error);
        });
};


const highwayTypes = "motorway,trunk,primary,secondary,tertiary,unclassified,residential";
function getRoadLength(lat, lon) {

    let bcircle = [lon,lat, SEARCH_RADIUS]
    const params = new URLSearchParams({
        bcircles: bcircle,
        time: "2024-01-01",
        filter: "highway=* and type:way",
        groupByKey: "highway",
        groupByValues: highwayTypes
    });

    const url = `${ohsomeEndpoint}/length/groupBy/tag?${params}`;
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
                console.log(highway.groupByObject);
                console.log(highway.result[0].value);
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
getBuildingArea(40.632967, -73.943950);
getRoadLength(40.632967, -73.943950);
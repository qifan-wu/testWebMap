import { stationsDataFile } from './constants.js'
import { createStationMarkers} from './utils.js';


axios.get(stationsDataFile)
    .then(function (response) {
        var stationsData = response.data;
        console.log(new Date().toLocaleString());
        createStationMarkers(stationsData);
        console.log(new Date().toLocaleString());
    })
    .catch(function (error) {
        console.error("error fetching cache: ", error)
    });


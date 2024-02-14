import { map } from './universal.js'

export function searchPOI(lat, lon) {
    map.setView([lat, lon], 12); // Adjust the zoom level as needed

}
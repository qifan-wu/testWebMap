import { searchGridLen } from './universal.js'

// import { OverPassLayer } from './OverPassLayer.js';

export function searchPOI(lat, lon) {

    // const westBound = lon - searchGridLen;
    // const eastBound = lon + searchGridLen;
    // const northBound = lat + searchGridLen;
    // const southBound = lat - searchGridLen;
    var poiQuery = `(
        node(around:1000, ${lat}, ${lon})[amenity];
        node(around:1000, ${lat}, ${lon})[leisure];
        node(around:1000, ${lat}, ${lon})[shop];
        node(around:1000, ${lat}, ${lon})[historic];);
        out qt;`;

    // map.setView(new L.LatLng(lat, lon), 14);
    map.setView(new L.LatLng(40.7128, -74.0060), 14);
    var opl = new L.OverPassLayer({
        minZoom: 14,
        'query': poiQuery,
    });
    map.addLayer(opl);
    console.log('zzzzz');

};
import { map } from './universal.js'

// import { OverPassLayer } from './OverPassLayer.js';

export function searchPOI(lat, lon) {
    // map.setView([lat, lon], 12); // Adjust the zoom level as needed
    // var query = `
    //         (node["amenity"~".*"](around:1000,${lat},${lon});
    //         node["leisure"~".*"](around:1000,${lat},${lon});
    //         node["shop"~".*"](around:1000,${lat},${lon});
    //         node["historic"~".*"](around:1000,${lat},${lon});
    //         );
    //         out body;
    //     `;

    // var opl = new leaflet.OverPassLayer({'query': query});
    // var opl = new L.OverPassLayer({
    //     query: query,
    //     })
    map.setView(new L.LatLng(lat, lon), 14);
    var opl = new L.OverPassLayer({
        query: `node["amenity"~".*"](around:1000,${lat},${lon}`,
        });

    console.log('after opl: ');
    console.log(new Date().toLocaleString());
    map.addLayer(opl);
    console.log('after Addlayer: ');
    console.log(new Date().toLocaleString());
}
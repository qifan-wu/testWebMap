import { searchGridLen } from './constants.js'
import { overlayMaps, layerControl, test } from './base.js'
import { subwayIcon } from './icons.js';

// Show subway stations worldwide on the map
export function createStationMarkers(stationsData) {
    var stationMarkers = L.markerClusterGroup(
        // {
        // spiderfyShapePositions: function(count, centerPt) {
        //     var distanceFromCenter = 35,
        //         markerDistance = 45,
        //         lineLength = markerDistance * (count - 1),
        //         lineStart = centerPt.y - lineLength / 2,
        //         res = [],
        //         i;

        //     res.length = count;

        //     for (i = count - 1; i >= 0; i--) {
        //         res[i] = new Point(centerPt.x + distanceFromCenter, lineStart + markerDistance * i);
        //     }

        //     return res;
        // }
        // }
    );
    stationsData.forEach(function (station) {
        var stationMarker = L.marker(new L.LatLng(station.lat, station.lon), {icon: subwayIcon});
        // marker.bindPopup(document.createTextNode(city.n_station).textContent);
        stationMarker.on('click', function() {
            console.log('clicked');

            if (overlayMaps.hasOwnProperty("stations")) {
                map.removeControl(overlayMaps["stations"]);
                map.removeLayer(overlayMaps["stations"]);
            }

            var opl = searchPOI(station.lat, station.lon);

        });

        overlayMaps["stations"] = stationMarker;
        stationMarkers.addLayer(stationMarker);
    });

    map.addLayer(stationMarkers);
    layerControl.addOverlay(stationMarkers, "stations");

    overlayMaps.stations = stationMarkers;
    return stationMarkers;
};


export function searchPOI(lat, lon) {
    // add selected subway station marker
    if (overlayMaps.hasOwnProperty("selectedStation")) {
        map.removeLayer(overlayMaps["selectedStation"]);
    }
    var selectedStation = L.marker([lat, lon], {icon: subwayIcon});
    selectedStation.addTo(map);
    overlayMaps.selectedStation = selectedStation;

    // add border circle for 1km
    if (overlayMaps.hasOwnProperty("border")) {
        map.removeLayer(overlayMaps["border"]);
    }
    var borderCircle = L.circle([lat, lon], {
        color: '#1C4966',
        opacity: 0.7,
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: 1000,
        weight: '3',
        dashArray: '10, 10',
        dashOffset: '10'
    });
    borderCircle.addTo(map);
    overlayMaps.border = borderCircle;


    // const westBound = lon - searchGridLen;
    // const eastBound = lon + searchGridLen;
    // const northBound = lat + searchGridLen;
    // const southBound = lat - searchGridLen;
    // if (map.hasLayer(opl)) {
    //     map.removeLayer(opl);
    // }
    var poiQuery = `(
        node(around:1000, ${lat}, ${lon})[amenity];
        node(around:1000, ${lat}, ${lon})[leisure];
        node(around:1000, ${lat}, ${lon})[shop];
        node(around:1000, ${lat}, ${lon})[historic];);
        out qt;`;

    map.setView(new L.LatLng(lat, lon), 15);

    var opl = new L.OverPassLayer({
        minZoom: 14,
        'query': poiQuery,

        onSuccess: function(data) {
            var poiGroup= L.markerClusterGroup({
                showCoverageOnHover: true,
                disableClusteringAtZoom:18,

                // iconCreateFunction: function(cluster) {
                //     return L.divIcon({ html: '<h2>' + cluster.getChildCount() + '</h2>' });
                //     }
                });
            for (var i=0; i<data.elements.length; i++) {
                var e = data.elements[i];
                var pos = new L.LatLng(e.lat, e.lon);
                // console.info(e.tags);
                L.marker(pos,{
                    // icon:restaurantIcon,
                    title:e.tags.name, //shows restaurants names
                    tipus:e.tags.amenity
                }).on('click', markerOnClick).addTo(poiGroup); //add markers to the cluster
            }
            // opl.addLayer(poiGroup);
            if (overlayMaps.hasOwnProperty("POI_sub")) {
                map.removeLayer(overlayMaps["POI_sub"]);
            }
            map.addLayer(poiGroup); //to add the cluster to the map
            overlayMaps.POI_sub = poiGroup;
            // layerControl.addOverlay(opl, "POI");

            function markerOnClick(event){
                var restaurante = event.target.options.tipus + " " +event.target.options.title;
                event.target.bindPopup(restaurante).openPopup();
            }
        },
    });

    if (overlayMaps.hasOwnProperty("POI")) {
        map.removeLayer(overlayMaps["POI"]);
    }
    map.addLayer(opl);
    overlayMaps.POI = opl;
    console.log('zzzzz');
    return opl;
};

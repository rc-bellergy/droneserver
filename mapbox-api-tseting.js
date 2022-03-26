/*
Testing:
1. multiple http requests to mapbox api
2. get buildings features

*/

import { config } from './config.js';
import { Client } from '@googlemaps/google-maps-services-js';
import request from "request-promise";

const gateway="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/";
const locations = [
    "114.23623241544855,22.307360431666915", 
    "114.30739452086544,22.30423718305112",
    "114.26991417887967,22.296903502407137",
    "114.21944338507242,22.287641500421007",
    "114.21335521273765,22.287574395080807"
];
const promises = locations.map(location => request(gateway + location + ".json?radius=10&layers=building&access_token=" + config.MAPBOX_API_KEY));

var buildingHeight = [];

Promise.all(promises).then((data) => {

    data.forEach(location => {
        var features = JSON.parse(location).features;
        var height = 0;
        features.forEach(feature => {
            height = height < feature.properties.height ? feature.properties.height : height;
        });
        buildingHeight.push(height);
    })
    console.log(buildingHeight);
});
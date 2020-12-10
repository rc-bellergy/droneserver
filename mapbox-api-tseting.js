/*
Testing multiple http requests to mapbox api
*/

import { config } from './config.js';
import request from "request-promise";

const gateway="https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/";
const key="access_token=pk.eyJ1IjoiZHFtaWNoYWVsIiwiYSI6ImNrZ2hodGlxMjBiZmszMHBnYmlrdGU4OTEifQ.g_yEmozIITINLVoEtDXCag";
const locations = ["114.23623241544855,22.307360431666915", "114.30739452086544,22.30423718305112"];
const urls = [
    gateway + locations[0] + ".json?radius=10&layers=building&" + key,
    gateway + locations[1] + ".json?radius=10&layers=building&" + key,
];

const promises = urls.map(url => request(url));
Promise.all(promises).then((data) => {
    console.log(data);
    
    /* It will return
    [
        '{"type":"FeatureCollection","features":[{"type":"Feature","id":121701404,"geometry":{"type":"Point","coordinates":[114.23623241544855,22.307360431666915]},"properties":{"extrude":"true","iso_3166_1":"HK","underground":"false","height":117,"type":"building","min_height":0,"iso_3166_2":"CN-91","tilequery":{"distance":0,"geometry":"polygon","layer":"building"}}}]}',
        '{"type":"FeatureCollection","features":[]}'
    ] */
    
});
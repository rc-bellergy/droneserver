import { Client } from '@googlemaps/google-maps-services-js';
import { config } from './config.js';
import Express from 'express';
import Http from 'http';
import Socket from 'socket.io';
import Log from './log.js';

// console.log(Config);

var app = new Express();
var server = Http.createServer(app);
var io = new Socket(server);
var serverLog = new Log('server.log');
var eventLog = new Log('events.log');

var map = new Client({});
map.elevation({
    params: {
        path: ["36.579,-118.292|36.606,-118.0638"],
        samples:10,
        key: config.GOOGLE_API_KEY
    },
    timeout: 1000
})
.then((r) => {
    // console.log(r.data.results);
})
.catch((e) => {
    console.log("Error:", e);
});
import { Client } from '@googlemaps/google-maps-services-js';
import { config } from './config.js';
import Express from 'express';
import Http from 'http';
import Socket from 'socket.io';
import LatLon from 'geodesy/latlon-spherical.js';
import Log from './log.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = new Express();
var server = Http.createServer(app);
var io = new Socket(server);
var map = new Client({});

var serverLog = new Log('server.log');
var eventLog = new Log('events.log');
var homeLocation;

// create the client page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// When user connected
io.on('connection', (socket) => {
    // console.log(socket); 
    var user = socket.handshake.address.split(':')[3];
    var msg = user +' connected';
    serverLog.log(msg);
    io.emit('message', msg);

    // Update drone's home location
    socket.on('home_location_updated', (data) => {
        io.emit('home_location_updated', data);
        homeLocation = data;
        eventLog.event(data, 'home_location_updated');
    })

    // Input two locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2

    socket.on('drone_location_updated', (drone) => {
        io.emit('drone_location_updated', drone);
        eventLog.event(drone, "drone_location_updated");

        // calculate distance
        var p1 = new LatLon(homeLocation.lat, homeLocation.lon);
        var p2 = new LatLon(drone.lat, drone.lon);
        var distance = p1.distanceTo(p2);
        var samples = Math.floor(distance / 10)
        samples = samples > 500 ? 500 : samples;
        samples = samples < 1 ? 1 : samples;

        // Using Google Map elevation API to get the elevations on the RTL path
        var path = homeLocation.lat + "," + homeLocation.lon + "|" + drone.lat + "," + drone.lon;

        // console.log(path);
        map.elevation({
            params: {
                path: [path],
                samples: samples, // TODO: change the samples by distance of the path
                key: config.GOOGLE_API_KEY, 
            },
            timeout: 1000, // milliseconds
        })
        .then((r) => {
            // console.log(r.data.results[0]);
            var results = r.data.results;
            var maxAlt = results[0];
            for (var i=1; i<results.length; i++) {
                maxAlt = maxAlt.elevation > results[i].elevation ? maxAlt : results[i];
            }

            io.emit('rtl_altitude_updated', maxAlt.elevation);
            eventLog.event(maxAlt.elevation, 'rtl_altitude_updated (samples:' + samples +')');


            // io.emit('drone_location_updated', {
            //     "max_alt": { 'lat': maxAlt.lat, 'lon': maxAlt.lon, 'alt': maxAlt.elevation },
            //     "drone": drone
            // });
            // eventLog.event(maxAlt, 'drone_location_updated');

        })
        .catch((e) => {
            console.log(e);
            serverLog.log('google map api elevation error' + e.response.data.error_message);
        });
        
    });

    socket.on('disconnect', () => {
        serverLog.log(user +' disconnected');
    });
});

server.listen(3000, () => {
    serverLog.log('Server listening on *:3000');
});
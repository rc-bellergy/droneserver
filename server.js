import { Client } from '@googlemaps/google-maps-services-js';
import { config } from './config.js';
import Express from 'express';
import Http from 'http';
import Socket from 'socket.io';
import LatLon from 'geodesy/latlon-spherical.js';
import Log from './log.js';

var app = new Express();
var server = Http.createServer(app);
var io = new Socket(server);
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
    socket.on('update_home_location', (data) => {
        io.emit('update_home_location', data);
        homeLocation = data;
        eventLog.event(data, 'update_home_location');
    })

    // Input two locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2
    socket.on('update_drone_location', (drone) => {
        io.emit('update_drone_location', drone);
        eventLog.event(drone, "update_drone_location");

        // calculate distance
        const h = new LatLon(homeLocation.lat, homeLocation.lon);
        const d = new LatLon(drone.lat, drone.lon);
        const distance = p1.distanceTo(p2);
        const samples = Math.floor(distance / 10)
        sample = sample > 500 ? 500 : sample;

        // Using Google Map elevation API to get the elevations on the RTL path
        const path = homeLocation.lat + "," + homeLocation.lon + "|" + drone.lat + "," + drone.lon;

        // console.log(path);
        map.elevation({
            params: {
                path: [path],
                samples: sample, // TODO: change the samples by distance of the path
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
            io.emit('set_rtl_altitude', maxAlt.elevation);
            eventLog.event(maxAlt, 'set_rtl_altitude');

            var result = {
                "max_alt": { 'lat': maxAlt.lat, 'lon': maxAlt.lon, 'alt': maxAlt.elevation },
                "drone": data
            }
            io.emit('update_drone_location', maxAlt.elevation);
            eventLog.event(maxAlt, 'update_drone_location');

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
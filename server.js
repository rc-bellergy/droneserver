const config = require('./config.js');
const Log = require('./log.js');
const { Client } = require("@googlemaps/google-maps-services-js");

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
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
    socket.on('update_home_location', (data) => {
        io.emit('update_home_location', data);
        homeLocation = data;
        eventLog.event(data, 'update_home_location');
    })

    // Input two locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2
    socket.on('update_drone_location', (droneLocation) => {
        io.emit('update_drone_location', droneLocation);
        eventLog.event(droneLocation, "update_drone_location");

        // Using Google Map elevation API to get the elevations on the RTL path
        path = homeLocation.lat + "," + homeLocation.lon + "|" + droneLocation.lat + "," + droneLocation.lon;
        // console.log(path);
        map.elevation({
            params: {
                path: [path],
                samples: 500, // TODO: change the samples by distance of the path
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
            variable            io.emit('set_rtl_altitude', maxAlt);
            io.emit('update_gcs', {
                "max_alt":maxAlt,
                "drone":droneLocation
            })
            eventLog.event(maxAlt, 'set_rtl_altitude');
        })
        .catch((e) => {
            console.log(e);
            // eventLog.log('droneserver,error,set_rtl_altitude,' + e.response.data.error_message);
        });
        
    });

    socket.on('disconnect', () => {
        serverLog.log(user +' disconnected');
    });
});

http.listen(3000, () => {
    serverLog.log('Server listening on *:3000');
});
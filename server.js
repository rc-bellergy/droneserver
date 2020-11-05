const config = require('./config.js');
const Log = require('./log.js');
const { Client } = require("@googlemaps/google-maps-services-js");

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var map = new Client({});
var serverLog = new Log('server.log');
var eventLog = new Log('events.log')

// create the client page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// When user connected
io.on('connection', (socket) => {
    // console.log(socket);
    var user = socket.handshake.address.split(':')[3];
    serverLog.log(user +' connected');

    // Input two locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2
    socket.on('get_rtl_altitude', (data) => {
        io.emit('get_rtl_altitude', data);
        eventLog.log(user + ',receive,get_rtl_altitude,' + JSON.stringify(data));

        // Using Google Map elevation API to get the elevations on the RTL path
        map.elevation({
            params: {
                path: [data.home + "|" + data.drone],
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
            var result = {
                "max_alt": maxAlt,
                "drone": {
                    "location": [ Number(data.drone.split(',')[1]), Number(data.drone.split(',')[0]) ]
                }
            }
            io.emit('set_rtl_altitude', result);
            eventLog.log('droneserver,send,set_rtl_altitude,' + result);
        })
        .catch((e) => {
            eventLog.log('droneserver,error,set_rtl_altitude,' + e.response.data.error_message);
        });
        
    });

    socket.on('disconnect', () => {
        serverLog.log(user +' disconnected');
    });
});

http.listen(3000, () => {
    serverLog.log('Server listening on *:3000');
});
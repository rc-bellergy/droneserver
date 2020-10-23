const config = require('./config.js');
const { Client } = require("@googlemaps/google-maps-services-js");

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var map = new Client({});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('message', (data) => {
        io.emit('message', data);
        console.log('message: ' + data);
    });
    
    // Input 2 locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2
    socket.on('get_rtl_altitude', (data) => {
        io.emit('get_rtl_altitude', data);
        console.log('Receive get_rtl_altitude: ' + JSON.stringify(data));

        map.elevation({
            params: {
                path: [data.home + "|" + data.drone],
                samples: 500,
                key: config.GOOGLE_API_KEY, 
            },
            timeout: 1000, // milliseconds
        })
        .then((r) => {
            // console.log(r.data.results[0].elevation);
            var max_alt = Math.max.apply(Math, r.data.results.map(function(o) { return o.elevation; }));
            io.emit('set_rtl_altitude', max_alt);
            console.log("Send set_rtl_altitude:", max_alt);
        })
        .catch((e) => {
            console.log(e.response.data.error_message);
        });
        
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
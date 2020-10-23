var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const { Client } = require("@googlemaps/google-maps-services-js");
const client = new Client({});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('message', (data) => {
        io.emit('message', data);
        console.log('message: ' + data);
    });
    
    // Input 2 locations to create a path, emit the "max alt" of the path
    // Data format: lat1,lon1|lat2,lon2
    socket.on('get_rtl_altitude', (data) => {
        io.emit('get_rtl_altitude', data);
        console.log('get_rtl_altitude: ' + JSON.stringify(data));

        client
            .elevation({
                params: {
                    path: [data.home + "|" + data.drone],
                    samples: 500,
                    key: "AIzaSyD0HYlt9qi-a3bBwvuF8V3XESsxOiU1ZK0", /* key from travmix */
                },
                timeout: 1000, // milliseconds
            })
            .then((r) => {
                // console.log(r.data.results[0].elevation);
                var max_alt = Math.max.apply(Math, r.data.results.map(function(o) { return o.elevation; }));
                console.log("max_alt:", max_alt);
                io.emit('set_rtl_altitude', max_alt);
            })
            .catch((e) => {
                console.log(e.response.data.error_message);
            });
        
    });
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
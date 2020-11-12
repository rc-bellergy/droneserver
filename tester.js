/* A dummy drone (client) test server functions */

import io from 'socket.io-client';

const socket = io('http://droneserver.zt:3000');
console.log('Connecting to droneserver.');

socket.on('connect', () => {
    console.log('Connected to droneserver.', socket);
    
    socket.emit('message', 'Hello from drmmy drone!');
    console.log('Sent Hello message to server');
    // socket.emit('home_location_updated', data);
});

console.log("End");

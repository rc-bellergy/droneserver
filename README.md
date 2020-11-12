# A socket server support drone flight

## Start the server
node server.js

## Client browser
http://localhost:3000

## Testing Server (under Zerotier NAVIO private network)
NOTE: For security reason, the server wroks on local network only.
http://192.168.192.159:3000/

---
## Events
#### Listen the event:
```js
socket.on('event_name', (event_data) => { });
```
#### Emit the event:
```js
io.emit('event_name', (event_data));
```

### Events List
| Event name        | Event Data   | Description                     |
| ----------------- | ------------ | ------------------------------- |
| set_rtl_altitude  | Number       | Set the altitude of RTL setting |
| set_home_location | LocationData | Set the home location           |
| update_location   | LocationData | Update the vehicle GPS location |

---
## Log

Event Log format

    data_time sender_id action event_name event_data

---
## Make it as system service
Add the file `/etc/systemd/system/droneserver.service`

Make it auto start when boot `systemctl enable droneserver.service`

```
[Unit]
Description=Start droneserver
Wants=zerotier-one.service
After=network-online.target zerotier-one.service

[Service]
Type=simple
ExecStart=/usr/bin/node /{the-path-to-server-file}/server.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

---
## References:
[Geodesy Library](https://www.movable-type.co.uk/scripts/geodesy-library.html)
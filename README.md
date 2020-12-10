# A socket server support drone flight

## Funcations:
### Auto update the RTL alt setting:
1. When the drone arm, record the home location;
2. When the drone fly, get the RTL (Return to Land) path and using Google Map API to find the max alt in the path;
3. update the RTL alt of the drone, if need;

## Start the server
node server.js

## Server (under Zerotier NAVIO private network)
NOTE: For security reason, the server wroks on private zerotier network only.
http://dronezerver.zt:3000/

## Client browser
http://localhost:3000
It just echo the message the server received. If you need the map viewer, you need run the `Flightvi` client.
[Flightvi in the GitHub](https://github.com/rc-bellergy/flightvi)

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
| Event name                | Event Data   | Description                         |
| ------------------------- | ------------ | ----------------------------------- |
| full_rtl_altitude_updated | RTLData      | Set the altitude of RTL             |
| home_location_updated     | LocationData | The drone's home location updated   |
| drone_location_updated    | LocationData | The drone's flying position updated |

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


## Using the Mapbox API get building height (server-side)

https://docs.mapbox.com/api/maps/tilequery/

## Retrieve features from vector tiles

/v4/{tileset_id}/tilequery/{lon},{lat}.json

### Sample: Get 平善樓 Ping Sin House infomation
```sh
curl "https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/114.23623241544855,22.307360431666915.json?radius=10&layers=building&access_token=pk.eyJ1IjoiZHFtaWNoYWVsIiwiYSI6ImNrZ2hodGlxMjBiZmszMHBnYmlrdGU4OTEifQ.g_yEmozIITINLVoEtDXCag"
```
### Return JSON
```json
{
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "id": 121701404,
            "geometry": {
                "type": "Point",
                "coordinates": [
                    114.23623241544855,
                    22.307360431666915
                ]
            },
            "properties": {
                "extrude": "true",
                "iso_3166_1": "HK",
                "underground": "false",
                "height": 117,
                "type": "building",
                "min_height": 0,
                "iso_3166_2": "CN-91",
                "tilequery": {
                    "distance": 0,
                    "geometry": "polygon",
                    "layer": "building"
                }
            }
        }
    ]
}
```




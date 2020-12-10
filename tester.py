#!/usr/bin/env python3

'''
Send testing data to droneserver
'''

import asyncio
import socketio
import random

droneserver = 'http://droneserver.zt:3000?user=Dummy-Drone'


async def run():
    print("Connecting to droneserver")
    sio = socketio.AsyncClient()
    await sio.connect(droneserver)
    print("droneserver connected")

    # Send home location
    location = { "lat": 22.309058, "lon": 114.304060, "alt": 19.5 }
    await sio.emit('home_location_updated', location)

    drone_location = { "lat": 22.309058, "lon": 114.304060, "alt": 50, "heading": 270 }
    lat_move = 0.0
    lon_move = 0.0
    
    while True:
        # Update drone location
        # location = { "lat": 22.307990, "lon": 114.301596 }
        await sio.emit('drone_location_updated', drone_location)
        
        lat_move = lat_move + random.uniform(-0.00005,0.00005)
        lon_move = lon_move + random.uniform(-0.00005,0.00005)
        drone_location['lat'] = drone_location['lat'] + lat_move
        drone_location['lon'] = drone_location['lon'] + lon_move
        drone_location['heading'] = drone_location['heading'] + 25

        await asyncio.sleep(2)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run())
# homebridge-photon-garagedoor

![](https://j.gifs.com/DkO2nB.gif)

HD video: https://youtu.be/2AzlH0_7FK4

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-photon-garagedoor
3. Update your configuration file. See sample config.json snippet below. 

# Configuration

Configuration sample:

 ```
	"accessories": [
      {
          "accessory": "PhotonGarageDoor",
          "name": "Garage Door",
          "access_token": "<your_access_token>",
          "url": "https://api.particle.io/v1/devices/",
          "deviceid": "<your_deviceid>",
          "doorOpensInSeconds": 20,
          "doorStateChangedEventName": "doorState",
          "doorOpenCloseFunctionName": "openClose",
          "doorOpenSensorVariableName": "openSensor"
      }
  ]
```

Fields: 

* "accessory": Must always be "PhotonGarageDoor" (required)
* "name": Can be anything (required)
* "access_token": Particle access token (see https://docs.particle.io/guide/getting-started/intro/photon/) (required)
* "deviceid": Photon device ID (see https://docs.particle.io/guide/getting-started/intro/photon/) (required)
* "url": Don't change (required) 
* "doorStateChangedEventName": Don't change if using sample-garageDoor.ino (required)
* "doorOpenCloseFunctionName": Don't change if using sample-garageDoor.ino (required)
* "doorIsClosedVariableName": Don't change if using sample-garageDoor.ino (required)


var request = require("request");
var eventSource = require('eventsource');
var Service, Characteristic, DoorState; // set in the module.exports, from homebridge

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  DoorState = homebridge.hap.Characteristic.CurrentDoorState;

  homebridge.registerAccessory("homebridge-photon-garagedoor", "PhotonGarageDoor", PhotonGarageDoor);
}

function PhotonGarageDoor(log, config) {
  this.log = log;
  this.name = config["name"];
  this.accessToken = config["access_token"];
  this.deviceId = config["deviceid"];
  this.url = config["url"];

  this.doorOpensInSeconds = config["doorOpensInSeconds"];
  this.eventName = config["doorStateChangedEventName"];
  this.functionName = config["doorOpenCloseFunctionName"];
  this.variableName = config["doorOpenSensorVariableName"];

  this.isClosed = true;

  this.initService();
}

PhotonGarageDoor.prototype = {

  initService: function() {
    this.garageDoorOpener = new Service.GarageDoorOpener(this.name,this.name);

    this.currentDoorState = this.garageDoorOpener.getCharacteristic(DoorState);

    this.targetDoorState = this.garageDoorOpener.getCharacteristic(Characteristic.TargetDoorState);
    this.targetDoorState.on('set', this.setState.bind(this));
    this.targetDoorState.on('get', this.getTargetState.bind(this));

    this.operating = false;

    var eventUrl = this.url + this.deviceId + "/events/" + this.eventName + "?access_token=" + this.accessToken;
    var es = new eventSource(eventUrl);

    this.log("registering event: " + eventUrl);

    es.onerror = function() {
      console.error('ERROR!');
    };

    es.addEventListener(this.eventName, this.doorStateDidChange.bind(this), false);

    this.infoService = new Service.AccessoryInformation();
    this.infoService
      .setCharacteristic(Characteristic.Manufacturer, "Opensource Community")
      .setCharacteristic(Characteristic.Model, "Particle Photon GarageDoor")
      .setCharacteristic(Characteristic.SerialNumber, "Version 1.0.0");

    this.fetchCurrentState();
  },

  doorStateDidChange: function(e) {
      var data = JSON.parse(e.data);

      this.log("doorStateDidChange: " + data.data);

      if (!this.operating) {
        if (data.data == "door-opened") {
          this.currentDoorState.setValue(DoorState.OPEN);
          this.isClosed = false;
        }
        else {
          this.currentDoorState.setValue(DoorState.CLOSED);
          this.isClosed = true;
        }
      }
  },

  getTargetState: function(callback) {
    callback(null, this.targetState);
  },

  fetchCurrentState: function() {
    this.getState(this.setFinalDoorState.bind(this));
  },

  setFinalDoorState: function(error, state) {
    if (!error) {
      this.isClosed = state == DoorState.CLOSED

      if ((this.targetState == DoorState.CLOSED && !this.isClosed) || (this.targetState == DoorState.OPEN && this.isClosed)) {
        this.log("Was trying to " + (this.targetState == DoorState.CLOSED ? " CLOSE " : " OPEN ") + "the door, but it is still " + (this.isClosed ? "CLOSED":"OPEN"));
        this.currentDoorState.setValue(DoorState.STOPPED);
      } else {
        this.log("GarageDoor is " + (this.isClosed ? "CLOSED ("+DoorState.CLOSED+")" : "OPEN ("+DoorState.OPEN+")"));
        this.currentDoorState.setValue(this.targetState);
      }

    } else {
      console.error(error);
    }

    this.operating = false;
  },

  setState: function(state, callback) {
    this.targetState = state;

    if (this.operating ||
      (state == DoorState.OPEN && !this.isClosed)
      || (state == DoorState.CLOSED  && this.isClosed)) {
      callback();
    }
    else {
        this.log("Door is " + (this.isClosed ? "Closed" : "Open") + ". Setting state to " + state);

        this.operating = true;

        if (state == DoorState.OPEN) {
            this.currentDoorState.setValue(DoorState.OPENING);
        } else {
            this.currentDoorState.setValue(DoorState.CLOSING);
        }

        var openCloseUrl = this.url + this.deviceId + "/" + this.functionName;

        this.log.info("Calling function: " + openCloseUrl);

        request.post(
          openCloseUrl, {
            form: {
              access_token: this.accessToken,
              args: state == DoorState.OPEN ? "open" : "close"
            }
          },
          function(error, response, body) {
            console.log(response);

            if (!error) {
              callback();
            } else {
              callback(error);
            }
          }
        );

        setTimeout(this.fetchCurrentState.bind(this), this.doorOpensInSeconds * 1000);
    }
  },

  getState: function(callback) {

    var isClosedUrl = this.url + this.deviceId + "/" + this.variableName + "?access_token=" + this.accessToken;

    this.log("Calling function: " + isClosedUrl);

    request.get(
      isClosedUrl, {
        form: {

        }
      },
      function(error, response, body) {
        if (!error) {
          console.log(body);
          var result = JSON.parse(body)["result"]
          if (result == 0) {
            callback(null, DoorState.CLOSED);
          } else if (result == 1) {
            callback(null, DoorState.OPEN);
          }
          else {
            console.error("Cannot get doorState");
            callback(null, null);
          }

        } else {
          console.error(error);
          callback(error, null);
        }
      }
    );
  },

  getServices: function() {
    return [this.infoService, this.garageDoorOpener];
  }
};

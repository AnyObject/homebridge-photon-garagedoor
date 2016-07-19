int lastOpenSensor = 0;
int openSensor = 0;

int relayPin = D0;
int doorOpenSensorPin = D1;


void setup() {
    Particle.function("openClose", openClose);
    Particle.variable("openSensor", &openSensor, INT);
    pinMode(relayPin, OUTPUT);
    pinMode(doorOpenSensorPin, INPUT);

    publishDoorState();
}



void loop() {
    getDoorSensor();

    if (openSensor != lastOpenSensor) {
        publishDoorState();

        lastOpenSensor = openSensor;
    }

    delay(1000);
}

void publishDoorState() {
    if (openSensor == 1 ) {
        Particle.publish("doorState", "door-opened", 1);
    }
    else {
        Particle.publish("doorState", "door-closed", 1);
    }
}

int openClose(String value) {
    if (value == "open") {
        open();
        return 1;
    }
    else if (value == "close") {
        close();
        return 1;
    }

    return 0;
}

void open() {
    //your code here

    //example codes only
    digitalWrite(relayPin, HIGH);
    delay(1000);
    digitalWrite(relayPin, LOW);
}

void close() {
    //your code here

    //example codes only
    digitalWrite(relayPin, HIGH);
    delay(1000);
    digitalWrite(relayPin, LOW);
}

int getDoorSensor() {
   //your code here
   openSensor = digitalRead(doorOpenSensorPin);
   return openSensor;
}

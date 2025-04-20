const express = require('express');
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const app = express();
const port = 3000; 

const mqttBrokerAddress = 'mqtt://192.168.240.149';
const mqttChannel = 'test';

const client = mqtt.connect(mqttBrokerAddress);

app.use(bodyParser.json());

app.get('/runMotor', (req, res) => {
  const message = 'run';
  client.publish(mqttChannel, message);
  res.send('Motor command sent');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
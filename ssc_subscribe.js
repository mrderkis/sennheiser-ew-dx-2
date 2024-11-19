const dgram = require('dgram');
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const client = dgram.createSocket('udp4');
const app = express();
const server = http.createServer(app);
const port = 3000;

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

const devices = [
    { ip: '192.168.9.13', port: 45, name: 'Receiver 1', filePrefix: 'R1' },
    { ip: '192.168.9.177', port: 45, name: 'Receiver 2', filePrefix: 'R2' },
    { ip: '192.168.9.173', port: 45, name: 'Receiver 3', filePrefix: 'R3' },
    { ip: '192.168.9.61', port: 45, name: 'Receiver 4', filePrefix: 'R4' },
    { ip: '192.168.9.53', port: 45, name: 'Receiver 5', filePrefix: 'R5' },
    { ip: '192.168.9.140', port: 45, name: 'Receiver 6', filePrefix: 'R6' },
    { ip: '192.168.9.235', port: 45, name: 'Receiver 7', filePrefix: 'R7' },
    { ip: '192.168.9.244', port: 45, name: 'Receiver 8', filePrefix: 'R8' }
];

let deviceStates = {};

function updateState(device, newState) {
    const deviceKey = device.filePrefix;
    if (!deviceStates[deviceKey]) {
        deviceStates[deviceKey] = {
            channel1: {},
            channel2: {}
        };
    }

    const state = deviceStates[deviceKey];

    // Update channel 1 (TX1)
    if (newState.rx1 || (newState.mates && newState.mates.tx1)) {
        if (newState.rx1 && newState.rx1.name) {
            state.channel1.name = newState.rx1.name;
            console.log(`Updated name for ${device.name} Channel 1: ${state.channel1.name}`);
        } else if (newState.device && newState.device.name) {
            state.channel1.name = newState.device.name;
            console.log(`Updated name for ${device.name} Channel 1 (from device-level): ${state.channel1.name}`);
        } else if (!state.channel1.name) {
            state.channel1.name = "N/A";  // Set to "N/A" if not available yet
        }

        if (newState.mates && newState.mates.tx1 && newState.mates.tx1.mute !== undefined) {
            state.channel1.mute = newState.mates.tx1.mute ? "Muted" : "Unmuted";
            console.log(`Received mute state for ${device.name} TX1: ${state.channel1.mute}`);
        } else {
            state.channel1.mute = state.channel1.mute || "N/A";
            console.log(`Mute state for ${device.name} TX1 not available`);
        }

        state.channel1.frequency = newState.rx1 ? newState.rx1.frequency || state.channel1.frequency || "N/A" : state.channel1.frequency;
        state.channel1.gain = newState.rx1 && newState.rx1.gain !== undefined ? newState.rx1.gain : state.channel1.gain || "N/A";

        if (newState.mates && newState.mates.tx1 && newState.mates.tx1.battery && newState.mates.tx1.battery.lifetime !== undefined) {
            state.channel1.battery = newState.mates.tx1.battery.lifetime + ' minutes';
            console.log(`Battery lifetime for ${device.name} TX1: ${state.channel1.battery}`);
        } else {
            state.channel1.battery = state.channel1.battery || "N/A";
            console.log(`Battery lifetime for ${device.name} TX1 not available`);
        }

        if (newState.rx1 && newState.rx1.warnings) {
            state.channel1.warnings = newState.rx1.warnings.join(', ');
            console.log(`Warnings for ${device.name} Channel 1: ${state.channel1.warnings}`);
        } else {
            state.channel1.warnings = state.channel1.warnings || "N/A";
        }

        if (newState.rx1 && newState.rx1.mates) {
            state.channel1.mates = newState.rx1.mates.join(', ');
            console.log(`Mates for ${device.name} Channel 1: ${state.channel1.mates}`);
        } else {
            state.channel1.mates = state.channel1.mates || "N/A";
        }

        console.log(`Updated state for ${device.name} Channel 1:`, state.channel1);
    }

    // Update channel 2 (TX2)
    if (newState.rx2 || (newState.mates && newState.mates.tx2)) {
        if (newState.rx2 && newState.rx2.name) {
            state.channel2.name = newState.rx2.name;
            console.log(`Updated name for ${device.name} Channel 2: ${state.channel2.name}`);
        } else if (newState.device && newState.device.name) {
            state.channel2.name = newState.device.name;
            console.log(`Updated name for ${device.name} Channel 2 (from device-level): ${state.channel2.name}`);
        } else if (!state.channel2.name) {
            state.channel2.name = "N/A";  // Set to "N/A" if not available yet
        }

        if (newState.mates && newState.mates.tx2 && newState.mates.tx2.mute !== undefined) {
            state.channel2.mute = newState.mates.tx2.mute ? "Muted" : "Unmuted";
            console.log(`Received mute state for ${device.name} TX2: ${state.channel2.mute}`);
        } else {
            state.channel2.mute = state.channel2.mute || "N/A";
            console.log(`Mute state for ${device.name} TX2 not available`);
        }

        state.channel2.frequency = newState.rx2 ? newState.rx2.frequency || state.channel2.frequency || "N/A" : state.channel2.frequency;
        state.channel2.gain = newState.rx2 && newState.rx2.gain !== undefined ? newState.rx2.gain : state.channel2.gain || "N/A";

        if (newState.mates && newState.mates.tx2 && newState.mates.tx2.battery && newState.mates.tx2.battery.lifetime !== undefined) {
            state.channel2.battery = newState.mates.tx2.battery.lifetime + ' minutes';
            console.log(`Battery lifetime for ${device.name} TX2: ${state.channel2.battery}`);
        } else {
            state.channel2.battery = state.channel2.battery || "N/A";
            console.log(`Battery lifetime for ${device.name} TX2 not available`);
        }

        if (newState.rx2 && newState.rx2.warnings) {
            state.channel2.warnings = newState.rx2.warnings.join(', ');
            console.log(`Warnings for ${device.name} Channel 2: ${state.channel2.warnings}`);
        } else {
            state.channel2.warnings = state.channel2.warnings || "N/A";
        }

        if (newState.rx2 && newState.rx2.mates) {
            state.channel2.mates = newState.rx2.mates.join(', ');
            console.log(`Mates for ${device.name} Channel 2: ${state.channel2.mates}`);
        } else {
            state.channel2.mates = state.channel2.mates || "N/A";
        }

        console.log(`Updated state for ${device.name} Channel 2:`, state.channel2);
    }

    // Notify all WebSocket clients of the updated state
    broadcastUpdate();
}

function broadcastUpdate() {
    const message = JSON.stringify(deviceStates);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

client.on('message', (msg, rinfo) => {
    try {
        const response = JSON.parse(msg);
        const device = devices.find(d => d.ip === rinfo.address);

        if (device) {
            console.log(`Received message from ${device.name}:`, JSON.stringify(response, null, 2)); // Log entire message to inspect structure
            updateState(device, response);
        } else {
            console.log(`Received message from unknown device: ${rinfo.address}`);
        }
    } catch (error) {
        console.error('Error parsing incoming message:', error);
    }
});

function subscribeToDevice(device) {
    const subscriptionMessage = {
        "osc": {
            "state": {
                "subscribe": [
                    { "mates": { "tx1": { "battery": { "lifetime": null } } } },  // Query battery lifetime for TX1
                    { "mates": { "tx2": { "battery": { "lifetime": null } } } },  // Query battery lifetime for TX2
                    { "mates": { "tx1": { "mute": null } } },  // Query mute state for TX1
                    { "mates": { "tx2": { "mute": null } } },  // Query mute state for TX2
                    { "device": { "name": null } },            // Query device name
                    { "rx1": { "frequency": null, "gain": null, "mute": null, "name": null, "warnings": null, "mates": null } },  // Query channel 1 attributes
                    { "rx2": { "frequency": null, "gain": null, "mute": null, "name": null, "warnings": null, "mates": null } }   // Query channel 2 attributes
                ],
                "min": 1000,  // Minimum notification period (e.g., 1 second)
                "max": 0      // No maximum period, only send on change
            }
        }
    };
    sendMessage(device, subscriptionMessage);
}

function sendMessage(device, message, callback) {
    const messageBuffer = Buffer.from(JSON.stringify(message));
    client.send(messageBuffer, device.port, device.ip, (err) => {
        if (err) {
            console.error(`Error sending message to ${device.name}:`, err);
        } else {
            console.log(`Message sent to ${device.name}:`, message);
            if (callback) callback();
        }
    });
}

function renewSubscription(device) {
    console.log(`Renewing subscription for ${device.name}...`);
    subscribeToDevice(device);
}

client.bind(45, () => {
    console.log('UDP client is running and listening for messages...');

    // Subscribe to all devices once
    devices.forEach(device => {
        subscribeToDevice(device);

        // Set up a periodic renewal of subscription every 50 seconds
        setInterval(() => {
            renewSubscription(device);
        }, 50 * 1000); // 50 seconds in milliseconds
    });
});

// Start Express server to serve device states
app.get('/deviceStates', (req, res) => {
    res.json(deviceStates);
  });
  
  // Add a route to get a specific device's state
  app.get('/deviceStates/:deviceKey', (req, res) => {
    const deviceKey = req.params.deviceKey;
    if (deviceStates[deviceKey]) {
      res.json(deviceStates[deviceKey]);
    } else {
      res.status(404).send('Device not found');
    }
  });
  
  // Add routes to get specific attributes for channel 1 or channel 2
  app.get('/deviceStates/:deviceKey/channel1/:attribute', (req, res) => {
    const deviceKey = req.params.deviceKey;
    const attribute = req.params.attribute;
    if (deviceStates[deviceKey] && deviceStates[deviceKey].channel1[attribute]) {
      res.json({ [attribute]: deviceStates[deviceKey].channel1[attribute] });
    } else {
      res.status(404).send('Attribute not found');
    }
  });
  
  app.get('/deviceStates/:deviceKey/channel2/:attribute', (req, res) => {
    const deviceKey = req.params.deviceKey;
    const attribute = req.params.attribute;
    if (deviceStates[deviceKey] && deviceStates[deviceKey].channel2[attribute]) {
      res.json({ [attribute]: deviceStates[deviceKey].channel2[attribute] });
    } else {
      res.status(404).send('Attribute not found');
    }
  });
  
  // Add routes for most important data
  app.get('/deviceStates/:deviceKey/channel1', (req, res) => {
    const deviceKey = req.params.deviceKey;
    if (deviceStates[deviceKey] && deviceStates[deviceKey].channel1) {
      res.json(deviceStates[deviceKey].channel1);
    } else {
      res.status(404).send('Channel 1 not found');
    }
  });
  
  app.get('/deviceStates/:deviceKey/channel2', (req, res) => {
    const deviceKey = req.params.deviceKey;
    if (deviceStates[deviceKey] && deviceStates[deviceKey].channel2) {
      res.json(deviceStates[deviceKey].channel2);
    } else {
      res.status(404).send('Channel 2 not found');
    }
  });
  
  // Add a route to get all important data for all devices
  app.get('/deviceStates/all', (req, res) => {
    res.json(deviceStates);
  });
  
  // WebSocket connection handling
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');
  
    // Send the initial state to the newly connected client
    ws.send(JSON.stringify(deviceStates));
  
    // Handle incoming messages from clients if needed
    ws.on('message', (message) => {
      console.log('Received message from client:', message);
    });
  
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });
  
  server.listen(port, () => {
    console.log(`REST API and WebSocket server running at http://localhost:${port}`);
  });
  
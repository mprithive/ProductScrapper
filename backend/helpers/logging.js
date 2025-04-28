const WebSocket = require('ws');

function log(wsClient, logData) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        console.log("Sending log")
        wsClient.send(JSON.stringify({
            type: "LOGS",
            data: logData
        }));
    }
}



module.exports = log
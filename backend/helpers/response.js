const WebSocket = require('ws');

function response (wsClient, data) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        console.log("Sending Response")
        wsClient.send(JSON.stringify({
            type: "RESPONSE",
            data: data
        }));
    }
}

module.exports = response;
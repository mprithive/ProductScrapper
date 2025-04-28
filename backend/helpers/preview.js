const WebSocket = require('ws');

function preview (wsClient, base64Screenshot) {
    if (wsClient && wsClient.readyState === WebSocket.OPEN) {
        console.log("Sending frame")
        wsClient.send(JSON.stringify({
            type: "FRAME",
            data: base64Screenshot
        }));
    }
}

module.exports = preview;
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
let userConnection= new Set()
module.exports = { wss,userConnection };
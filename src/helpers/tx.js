const WebSocket = require('ws');
const httpProxy = require('http-proxy');
const tx = () => {
    const url = 'wss://api1.apiwyn88.net/gameconnector'; // Địa chỉ WebSocket
    const headers = {
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'Upgrade',
        'Host': 'api1.apiwyn88.net',
        'Origin': 'https://play.wyn88.fun',
        'Pragma': 'no-cache',
        'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
        'Sec-WebSocket-Key': '8ADzCPfoyOkX0iZJtJXBMw==',
        'Sec-WebSocket-Version': '13',
        'Upgrade': 'websocket',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.5672.93 Safari/537.36'
    };

    const ws = new WebSocket(url, { headers });

    ws.on('open', () => {
        console.log('WebSocket connected');
    });

    ws.on('message', (data) => {
        console.log(`Received data: ${data}`);
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket disconnected with code: ${code} and reason: ${reason}`);
    });

    ws.on('error', (error) => {
        console.error(`WebSocket error: ${error}`);
    });
}
export default tx;



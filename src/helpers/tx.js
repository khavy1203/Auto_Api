const WebSocket = require('ws');
const httpProxy = require('http-proxy');
const tx = () => {
    const url = 'wss://api2.apiwyn88.net/gameconnector?9a8d7aadb739258e5dcbbb69e781dee1';
    const options = {
        headers: {
            'Connection': 'Upgrade',
            'Pragma': 'no-cache',
            'Cache-Control': 'no-cache',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
            'Upgrade': 'websocket',
            'Origin': 'https://play.wyn88.fun',
            'Sec-WebSocket-Version': '13',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'vi,en;q=0.9',
            'Sec-WebSocket-Key': 'GUbmkvym2NfTa5wvnP5/Kg==',
            'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits'
        }
    };

    const ws = new WebSocket(url, options);

    // Thiết lập sự kiện onopen khi kết nối được mở
    ws.onopen = function () {
        console.log('WebSocket connected');

        // Gửi message đến server sau khi kết nối được mở
        const authData = { "authentication": { "username": "khavy1245", password: "123456", captcha: "CLR", platform: "web" } };
        const taixiuData1 = { "taixiu": { "view": true, "getLogs": true } };
        const taixiuData2 = {"taixiumd5":{"view":true,"getLogs":true}};

        ws.send(JSON.stringify(authData));
        ws.send(JSON.stringify(taixiuData1));
        ws.send(JSON.stringify(taixiuData2));

    };

    // Thiết lập sự kiện onmessage khi nhận được dữ liệu từ server
    ws.onmessage = function (event) {
        console.log(`Received data: ${event.data}`);
    };

    // Thiết lập sự kiện onclose khi kết nối bị đóng
    ws.onclose = function (event) {
        console.log(`WebSocket disconnected with code: ${event.code} and reason: ${event.reason}`);
    };

    // Thiết lập sự kiện onerror khi xảy ra lỗi trong quá trình kết nối
    ws.onerror = function (error) {
        console.error(`WebSocket error: ${error}`);
    };
}
export default tx;



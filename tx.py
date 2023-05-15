import websocket

websocket.enableTrace(True)

url = 'wss://api2.apiwyn88.net/gameconnector?9a8d7aadb739258e5dcbbb69e781dee1'

headers = {
    'Host': 'api2.apiwyn88.net',
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

def on_open(ws):
    print('Connection established')

def on_message(ws, message):
    print(f'Received message: {message}')

def on_close(ws,a,b):
    print('Connection closed',a)

ws = websocket.WebSocketApp(url, header=headers, on_open=on_open, on_message=on_message, on_close=on_close)
ws.run_forever()
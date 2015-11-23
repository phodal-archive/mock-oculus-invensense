//var SerialPort = require("serialport").SerialPort
var express = require("express"),
    http = require("http").createServer(),
    WebSocketServer = require('ws').Server;

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

// Instantiate express server
var app = express();
app.set('port', process.env.PORT || 3000);


var serialPort = new SerialPort("/dev/tty.usbmodem1411", {
    parser: serialport.parsers.readline("\n"),
    baudrate: 115200
}, false); // this is the openImmediately flag [default is true]

// Attach socket.io listener to the server
var wss = new WebSocketServer({server: http});
var id = 1;

wss.on('open', function open() {
    console.log('connected');
});

serialPort.open(function (error) {
    if (error) {
        console.log('failed to open: ' + error);
    } else {

// On socket connection set up event emitters to automatically push the HMD orientation data
        wss.on("connection", function (ws) {
            //function emitOrientation() {

            //}

            //var orientation = setInterval(emitOrientation, 1000);

            ws.on("message", function (data) {
                //clearInterval(orientation);
                //orientation = setInterval(emitOrientation, data);
                serialPort.on('data', function (data) {
                    id = id + 1;
                    console.log(data);
                    if (data.indexOf("position") > -1) {
                        try {
                            var originData = JSON.parse(data);
                            originData.id = id;

                            //setTimeout(function(){
                                ws.send(JSON.stringify(originData), function (error) {
                                    //it's a bug of websocket, see in https://github.com/websockets/ws/issues/337
                                });
                            //}, 200);
                        } catch (e) {

                        }
                    }
                });
            });


            ws.on("close", function () {
                setTimeout(null, 500);
                //clearInterval(orientation);
                console.log("disconnect");
            });

        });
    }
});

// Launch express server
http.on('request', app);
http.listen(3000, function () {
    console.log("Express server listening on port 3000");
});

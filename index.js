//var SerialPort = require("serialport").SerialPort
var express = require("express"),
    http = require("http").createServer(),
    WebSocketServer = require('ws').Server;

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

// Instantiate express server
var app = express();
app.set('port', process.env.PORT || 3000);


var serialPort = new SerialPort("/dev/tty.usbmodem1421", {
    parser: serialport.parsers.readline("\n"),
    baudrate: 115200
}, false); // this is the openImmediately flag [default is true]

// Attach socket.io listener to the server
var wss = new WebSocketServer({server: http});
var id = 1;

wss.on('open', function open() {
    console.log('connected');
});

// On socket connection set up event emitters to automatically push the HMD orientation data
wss.on("connection", function (ws) {
    function emitOrientation(cb) {
        serialPort.open(function (error) {
            if (!error) {
                serialPort.on('data', function (data) {
                    id = id + 1;
                    console.log(data);
                    if (data.indexOf("position") > -1) {
                        try {
                            var data = JSON.parse(data);
                            data.id = id;
                        } catch (e) {

                        }
                    }
                    serialPort.on('close', cb);
                    cb(data);
                });
            }
        });
    }

    var cb = function (originData) {
        ws.send(JSON.stringify(originData), function (error) {
            console.log(error);
        });
    };
    var orientation = setInterval(emitOrientation(cb), 1000);

    ws.on("message", function (data) {
        clearInterval(orientation);
        orientation = setInterval(emitOrientation(cb), 1000);
    });


    ws.on("close", function () {
        setTimeout(null, 500);
        clearInterval(orientation);
        console.log("disconnect");
    });
});

// Launch express server
http.on('request', app);
http.listen(3000, function () {
    console.log("Express server listening on port 3000");
});

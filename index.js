//var SerialPort = require("serialport").SerialPort

var serialport = require("serialport");
var SerialPort = serialport.SerialPort; // localize object constructor

var serialPort = new SerialPort("/dev/tty.usbmodem1411", {
  parser: serialport.parsers.readline("\n"),
  baudrate: 115200
}, false); // this is the openImmediately flag [default is true]

serialPort.open(function (error) {
  if ( error ) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    serialPort.on('data', function(data) {
      console.log(data);
    });
    serialPort.write("ls\n", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
  }
});
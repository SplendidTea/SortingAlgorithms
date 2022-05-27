var sha1 = require("sha1");
let net = require("net");
let Buffers = require("./CreateBuffer");
const path = require("path");
//Timer Generation
const generateTimer = () => {
  return Math.floor(Math.random() * (999 - 1) + 1);
  t;
};

let timer; //timer
const ogTimer = generateTimer();
timer = ogTimer;
setInterval(function () {
  if (timer == 4294967294) {
    timer = ogTimer;
  } else {
    timer++;
  }
}, 10);

//HOST IP and General Declarations
const HOST = "127.0.0.1";
let args = process.argv.slice(2);
let Port;
const DHT = []; //DHT dec

//Appends DHT
function pushBucket(DHT, data) {
  DHT.push(data);
  return;
}

//Refreshes DHT and Appends new DHT info
function refreshBucket(DHT, recivedDHT) {
  console.log("Refresh k-Bucket operation is performed");

  if (recivedDHT != undefined) {
    for (let i = 0; i < recivedDHT.length; i++) {
      let strarr = recivedDHT[i];
      let str = strarr[0];
      str = str.replace("[", "");
      const splitstr = str.split(":");
      DHT.push({ host: splitstr[0], port: splitstr[1] });
    }
  }
  //prints out all dht
  console.log("MY DHT: ");
  for (let x = 0; x < DHT.length; x++) {
    console.log(
      "[" +
        DHT[x].host +
        ":" +
        DHT[x].port +
        " , " +
        sha1(DHT[x].host + ":" + DHT[x].port) +
        "]"
    );
  }
  console.log("Hello Packet has Been Sent");
}

//If there are any arguments it will choose to act as a server or client
if (args.length > 0) {
  if (args[1] == "-h") {
    //displays help if -h
    console.log("Usage: node KADpeer.js [ -p ipaddress:port ] ");
    console.log("-p: set the port of the peer");
  } else if (args[1] == "-p") {
    //if -p it acts like a client and creates a socket, uses a random port
    const address = args[2];
    //split address at :
    const splitAddress = address.split(":");
    let client = net.Socket();
    client.connect({ port: splitAddress[1], host: splitAddress[0] }, () => {
      console.log("connected to peer " + address + " at timestamp: " + timer);
      const ID = sha1(HOST + ":" + client.address().port);
      console.log(
        "this peer address is " +
          HOST +
          ":" +
          client.address().port +
          " located at: " +
          path.basename(path.resolve(process.cwd())) +
          " [" +
          ID +
          "]"
      );
      DHT.push({ host: HOST, port: client.address().port });
    });
    client.on("data", (data) => {
      const dht = Buffers.client(data);
      refreshBucket(DHT, dht);
    });
  }
} else if (args.length == 0) {
  //creates a server on a random port if there are no arguments
  let srv = net.createServer();
  srv.listen(0, HOST, function () {
    const ID = sha1(HOST + ":" + srv.address().port);
    console.log(
      "this peer address is " +
        HOST +
        ":" +
        srv.address().port +
        " located at: " +
        path.basename(path.resolve(process.cwd())) +
        " [" +
        ID +
        "]"
    );
    Port = srv.address().port;
  });
  srv.on("connection", function (sock) {
    //sends clients a list of all the dht
    console.log(
      "connection from peer " + sock.remoteAddress + ":" + sock.remotePort
    );
    const data = { host: sock.remoteAddress, port: sock.remotePort };
    //push data to DHT
    const paths = path.basename(path.resolve(process.cwd()));
    const buffy = Buffers.server(DHT, paths);
    pushBucket(DHT, data);
    sock.write(buffy);
  });
} //if all else lets user know of some error
else {
  console.log("An Error has Occured");
}

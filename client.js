const net = require("net"); // protocollo TCP/IP
const client = new net.Socket();
// const crypto = require('crypto')
// const sha256 = crypto.createHash('sha256')
// var readline = require('readline');
const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");
const dns = require("node:dns");
const os = require("node:os");
const options = { family: 4 };

const port = 41234;
const address = "255.255.255.255";
let partecipanti = new Set();
let ip_address=''
listen_server.on("listening", () => {
  dns.lookup(os.hostname(), options, (err, addr) => {
    if (err) {
      console.error(err);
    } else {
      listen_server.setBroadcast(true);
      // console.log(`IPv4 address: ${addr}`);
      listen_server.send(Buffer.from(addr), port, address);
    }
  });
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {

  if (!ip_address.includes(rinfo.address)) {
    ip_address += rinfo.address
    server_peer(ip_address)
    console.log(ip_address);
    listen_server.send(Buffer.from(ip_address),port,address)
  }
});
listen_server.bind(port);

// COLLEGAMENTO CLIENT
function server_peer(IP_address) {
  // ip computer
  client.connect(3000, IP_address, () => {
    console.log("client connesso");
    client.write("collegamento");
  });
  // data ottenuti
  client.on("data", (data) => {
    const text = data.toString("utf-8");
    console.log(text);
  });
  // errori
  client.on("error", (err) => {
    console.error(err.message);
  });
  // chiusura server
  client.on("end", () => {
      console.log("CONNESSIONE CHIUSA");
      process.exit(0)
  });
  // chiusura client forzata
  process.on("SIGINT", () => {
    console.log("connessione chiusa");
    client.end(() => {
      // dato tempo a client di chiudere la connessione
      setTimeout(() => {
        process.exit(0);
      }, 100);
    });
  });
}
const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");
const net = require("net"); // protocollo TCP/IP 
const client = new net.Socket(); 


const message = Buffer.from("sei collegato"); // string to ascii

const port = 41234;
const address = "255.255.255.255";

listen_server.on("listening", () => {
  listen_server.setBroadcast(true); // broadcasting messaggio in rete 
  listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {
    console.log(`messaggio ${msg} da ${rinfo.address} porta ${rinfo.port}`);
    server_peer(rinfo.address) // collegamento al computer in rete
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

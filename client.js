const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_client = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");
const net = require("net");
const client = new net.Socket(); // bisogno di creare una istanza perche il client si deve collegare al server

const message = Buffer.from("Some bytes");
const port = 41234;
const address = "255.255.255.255";

listen_client.on("listening", () => {
  listen_client.setBroadcast(true);
  listen_client.send(message, port, address, (err) => {
      console.log("messaggio inviato");
  });
});

listen_client.on("error", (err) => {
  console.error(err.message);
});

listen_client.on("message", (msg, rinfo) => {
    console.log(`messaggio ${msg} da ${rinfo.address} porta ${rinfo.port}`);
    server_peer(rinfo.address)
});
listen_client.bind(port);
//192.168.0.255

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
    console.log("connessione chiusa dal server");
  });
  // chiusura client forzata
  process.on("SIGINT", () => {
    console.log("connessione chiusa");
    client.end(() => {
      // dato tempo a client di chiudere la connessione settimeout
      setTimeout(() => {
        process.exit(0);
      }, 100);
    });
  });
}

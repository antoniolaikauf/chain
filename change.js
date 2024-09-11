const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = "255.255.255.255";
let participanti= []
listen_server.on("listening", () => {
  const message = Buffer.from('collegato'); // string to ascii
  listen_server.setBroadcast(true); // broadcasting messaggio in rete
  listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {
    participanti.push({ 'address': rinfo.address })
    console.log(participanti);
    
    console.log(`${msg} da ${rinfo.address} porta ${rinfo.port}`);
    // server_peer(rinfo.address) // collegamento al computer in rete
});
listen_server.bind(port);
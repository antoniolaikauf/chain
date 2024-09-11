const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '255.255.255.255';
let partecipanti= new Set()
listen_server.on("listening", () => {      
    const message = Buffer.from('collegato'); // string to ascii
    listen_server.setBroadcast(true); // broadcasting messaggio in rete
    listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {   
    listen_server.setBroadcast(true); 
    if (!partecipanti.has(rinfo.address)) {
        partecipanti.add(rinfo.address)
        listen_server.send(Buffer.from(Array.from(partecipanti)), port, address)
        console.log(`Nuovo peer scoperto: ${rinfo.address}`);
        console.log(`Lista peer attuale: ${partecipanti}`);
    }   
});
listen_server.bind(port);
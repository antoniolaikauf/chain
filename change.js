const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '239.255.255.250';
let partecipanti= []
listen_server.on("listening", () => {
    listen_server.addMembership(address);
    const message = Buffer.from('collegato'); // string to ascii
    listen_server.setBroadcast(true); // broadcasting messaggio in rete
    
    listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {
    
    if (!partecipanti.includes(rinfo.address)) {
        partecipanti.push(rinfo.address)
        listen_server.send(Buffer.from(partecipanti),port,address)
    }   
    console.log(partecipanti);
    
    console.log(`${msg} da ${rinfo.address} porta ${rinfo.port}`);
    // server_peer(rinfo.address) // collegamento al computer in rete
});
listen_server.bind(port);
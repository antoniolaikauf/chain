const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '255.255.255.255';
let partecipanti = []
let count= 0
listen_server.on("listening", () => {      
    // const message = Buffer.from(partecipanti); // string to ascii
    listen_server.setBroadcast(true); // broadcasting messaggio in rete
    // listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => { 
    const nuoviPartecipanti = JSON.parse(msg.toString());

    // Check if the address of the sender is already in the list
    if (!partecipanti.includes(rinfo.address)) {
        partecipanti.push(rinfo.address); // Add the new peer to the list
        console.log(`Nuovo peer scoperto: ${rinfo.address}`);
        console.log(`Lista peer attuale: ${partecipanti}`);
    }

    // Convert the updated participants list to a JSON string and then to a Buffer
    const message = Buffer.from(JSON.stringify(partecipanti));
    
    // Send the updated list to the entire network (excluding itself)
    if (rinfo.address !== listen_server.address().address) {
        listen_server.send(message, port, address); // Broadcast the updated list
    }
});
listen_server.bind(port);
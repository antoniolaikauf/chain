const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '255.255.255.255';
let partecipanti = [];

listen_server.on("listening", () => {  
    // console.log(`Server in ascolto su ${listen_server.address().address}:${port}`);
    
    const message = Buffer.from('collegato'); // string to ascii
    listen_server.setBroadcast(true); // broadcasting messaggio in rete
    listen_server.send(message, port, address); // invio messaggio
});

listen_server.on("error", (err) => {
    console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {   
    listen_server.setBroadcast(true); 

    // Aggiungi il mittente alla lista dei partecipanti se non è già presente
    if (!partecipanti.includes(rinfo.address)) {
        partecipanti.push(rinfo.address);
        console.log(`Nuovo peer scoperto: ${rinfo.address}`);
            // Invia la lista aggiornata a tutti i partecipanti
    const partecipantiMessage = Buffer.from(partecipanti.join(',')); // Converti la lista in stringa
    listen_server.send(partecipantiMessage, port, address);
    }

    // Stampa la lista attuale dei partecipanti
    console.log(`Lista peer attuale: ${partecipanti}`);
});

// Avvia il server sulla porta specificata
listen_server.bind(port);
// const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
// const listen_server = new dgram.createSocket("udp4");
// const { Buffer } = require("buffer");

// const port = 41234;
// const address = '255.255.255.255';
// let partecipanti = []
// listen_server.on("listening", () => {
//     const message = Buffer.from(partecipanti); // string to ascii
//     listen_server.setBroadcast(true); // broadcasting messaggio in rete
//     listen_server.send(message, port, address); // invio mesaggio
// });

// listen_server.on("error", (err) => {
//   console.error(err.message);
// });

// listen_server.on("message", (msg, rinfo) => {
//     listen_server.setBroadcast(true);
//     let data = Array.from(msg)
// console.log(data);

//     // Aggiungi il mittente alla lista dei partecipanti se non è già presente
//     if (data.includes(rinfo.address)) {
//         console.log('è inviatoi');
//     }
//     else {
//         // data.push(rinfo.address)
//         console.log(data);
//         listen_server.send(Buffer.from(data), port, address);
//     }
    
// });
// listen_server.bind(port);


// // TODO MIGLIORARE PERCHè SAREBBE PIù CORRETTTO SE LI FACESSE SUL MSG
//     // const peers = Array.from(msg);
//     // let words =''
//     //     peers.forEach(element => {
//     //         // console.log(element.toString('utf-8'));
//     //        words+= String.fromCharCode(element)
//     //     });
//     // console.log(words, typeof words);

const dgram = require("dgram"); 
const listen_server = dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '255.255.255.255';
let partecipanti = new Set(); // Utilizziamo un Set per evitare duplicati

listen_server.on("listening", () => {  
    
    const message = Buffer.from('collegato'); 
    listen_server.setBroadcast(true); 
    listen_server.send(message, port, address); 
});

listen_server.on("error", (err) => {
    console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => {   
    listen_server.setBroadcast(true); 

    // Aggiungi il mittente alla lista dei partecipanti se non è già presente
    if (!partecipanti.has(rinfo.address)) {
        partecipanti.add(rinfo.address);
        console.log(`Nuovo peer scoperto: ${rinfo.address}`);

        // Invia la lista aggiornata a tutti i partecipanti
        const partecipantiMessage = Buffer.from(Array.from(partecipanti).join(',')); 
        listen_server.send(partecipantiMessage, port, address);
    }

    // Stampa la lista attuale dei partecipanti
    console.log(`Lista peer attuale: ${Array.from(partecipanti)}`);
});

// Avvia il server sulla porta specificata
listen_server.bind(port);
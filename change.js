const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = new dgram.createSocket("udp4");
const { Buffer } = require("buffer");

const port = 41234;
const address = '255.255.255.255';
let partecipanti = []
let count= 0
listen_server.on("listening", () => {      
    const message = Buffer.from(partecipanti); // string to ascii
    listen_server.setBroadcast(true); // broadcasting messaggio in rete
    listen_server.send(message, port, address); // invio mesaggio
});

listen_server.on("error", (err) => {
  console.error(err.message);
});

listen_server.on("message", (msg, rinfo) => { 
    // bisogna farlo sul mesaggio
    listen_server.setBroadcast(true); 
    data = Array.from(msg)
    console.log(data);
    let messgae = Buffer.from(data)
    if (!data[0] == '0') {
        data.push(rinfo.address)
        listen_server.send(Buffer.from(messgae), port, address);   
    }   
});
listen_server.bind(port);


// TODO MIGLIORARE PERCHè SAREBBE PIù CORRETTTO SE LI FACESSE SUL MSG
    // const peers = Array.from(msg);
    // let words =''
    //     peers.forEach(element => {
    //         // console.log(element.toString('utf-8'));
    //        words+= String.fromCharCode(element)  
    //     });
    // console.log(words, typeof words);
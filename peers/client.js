/*
  collegarsi sempre a se stessi per primi cosi che il mempool viene inviato solo a noi e non ad altri nodi 
*/
const net = require("net"); // protocollo TCP/IP
const dgram = require("dgram"); // UDP è un protocollo di rete che consente l'invio di pacchetti di dati tra host in una rete senza stabilire una connessione formale
const listen_server = dgram.createSocket("udp4");
const { Buffer } = require("buffer");
const dns = require("dns");
const os = require("os");
const options = { family: 4 };
const { verifica } = require("../verify_transection/verifica.js");
let { mempool } = require("../Mempool/Mempool.js");

const port = 41234;
const address = "255.255.255.255";
let list_ip_address = new Set(); //vedere come mai mi dice connessione quando metto dentro '127.0.0.1' nel set anche se dopo nel server si connette solo uno

listen_server.on("listening", () => {
  // ottieni ip macchina
  dns.lookup(os.hostname(), options, (err, addr) => {
    if (err) {
      console.error(err);
    } else {
      listen_server.setBroadcast(true);
      let data = JSON.stringify({ ip: addr });
      listen_server.send(Buffer.from(data), port, address);
    }
  });
});

listen_server.on("error", (err) => {
  console.error(err.message);
});
// rinf è IP da cui si sta inviando i dati
listen_server.on("message", (msg, rinfo) => {
  let data = JSON.parse(msg);

  if (!list_ip_address.has(rinfo.address)) {
    list_ip_address.add(rinfo.address);
    server_peer(rinfo.address);
    console.log(list_ip_address);
    console.log(`Messaggio ricevuto: ${msg} da ${rinfo.address}`);
    /* ogni volta che un nuovo ip si colleghi bisogna mandare un messaggio sulla 
    rete cosi che tutti possano riceve gli IP e collegarsi 
    */
    let addr = JSON.stringify({ ip: rinfo.address });
    listen_server.send(Buffer.from(addr), port, address);
  } else if ("TXid" in data) {
    // controllo transazione ricevuta da server
    if (verifica.controllo_hash(data.TXid) && verifica.signature(data.TXid.nonce.nonce_transection, data.TXid.public_key, data.TXid.signature)) {
      mempool.add_transection(data.TXid);
      let mempool_sorted = Array.from(mempool.sort_Mempool(mempool.Mempool));
      invio_mempool(mempool_sorted, list_ip_address); // invio transazione 
      console.log("transazione corretta");
    } else console.log("transazione sbagliata");
  }
});
listen_server.bind(port);

// COLLEGAMENTO CLIENT
function server_peer(IP_address) {
  const client = new net.Socket();

  client.connect(5000, IP_address, () => {
    console.log("client connesso");
    const peer = { peer: IP_address };
    client.write(JSON.stringify(peer));
  });
  // data ottenuti
  client.on("data", (data) => {
    const text = data.toString("utf-8");
    console.log(text);
  });
  // errori
  client.on("error", (err) => {
    console.log("errore");
    console.error(err.message);
  });
  // chiusura server
  client.on("end", () => {
    console.log("CONNESSIONE CHIUSA");
    process.exit(0);
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

// invio mempool a tutti i peers collegati
function invio_mempool(mempool, peers) {
  let dati = { Mempool: mempool };
  const client = net.Socket();
  /*
  inviare la mempool solo a se stessi 
  */
  client.connect(5000, peers[0], () => {
    // ritardare invio se no da problemi al server CLIENT_CONNECTION
    setTimeout(() => {
      client.write(JSON.stringify(dati), () => {
        client.end();
      });
    }, 100);
  });
}

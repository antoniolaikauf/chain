// // nesuna instanza socket con il server perchè il node crea un collegamento socket con il client collegato
const net = require("net"); // modulo per rete peer to peer
const dgram = require("dgram");
const sender = dgram.createSocket("udp4");
const { verifica } = require("../verify_transection/verifica.js");
let { nonce } = require("../wallet/account.js");
// sistemare meglio questo deciso di lasciare sempre aperto ed è la rete per le transazioni

const port = 41234;
const address = "255.255.255.255";
let CLIENT_CONNECTION = false;

sender.bind(() => {
  sender.setBroadcast(true);
});

let clients = [];
const server = net.createServer((socket) => {
  // data dal client
  socket.on("data", (data) => {
    const content = JSON.parse(data.toString());
    // console.log(content);

    if ("TXid" in content) {
      if (verifica.controllo_hash(content) && verifica.signature(content.nonce.nonce_transection, content.public_key, content.signature)) {
        CLIENT_CONNECTION = true;
        //inviare transazione sulla rete
        nonce++;
        sender.send(Buffer.from(JSON.stringify(content)), port, address);
        socket.write(JSON.stringify(content));
        console.log("transazione corretta");
      } // qua va il nonce dell'account
      else console.log("transazione sbagliata");
    } else {
      CLIENT_CONNECTION = false;
      const client = { IP: socket.remoteAddress, data: socket, transection: false };
      clients.push(client);
      console.log(`client collegati : ${clients.length}`);
      clients.forEach((element, i) => {
        console.log(`client ${element.IP} connesso`);
      });
    }
  });

  /*
  GESTIONE CHIUSURA CLIENT 
  se client si connette allora per comunicare con server si imposta CLIENT_CONNECTION = false 
  cosi se si chiudesse si intende il client che interagisce con server e si collega ad altri server.
  quando si invia una nuova transazione con il client (che è lo stesso IP) viene impostata in true 
  cosi che alla sua chiusura legge transazione e dopo si rimposta a false cosi che quando le transazioni
  sono finite si legge il client che interagisce con altri nodi
 */

  socket.on("end", function () {
    if (CLIENT_CONNECTION) {
      console.log("transaione");
      CLIENT_CONNECTION = false;
    } else {
      if (!clients.includes(socket.remoteAddress)) {
        clients = clients.filter((element) => element.IP != socket.remoteAddress);
        console.log(`client: ${socket.remoteAddress} scollegato\nclients collegati ${clients.length}`);
      }
    }
  });

  // errori
  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});
// porta 5000 indirizzi di ascolto tutti 0.0.0.0
server.listen(5000, "0.0.0.0", () => {
  console.log(`server dati: ${JSON.stringify(server.address())}`);
});

process.on("SIGINT", () => {
  console.log("server chiuso");
  clients.forEach((client, i) => {
    // chiudi connessione con client
    client.data.destroy();
    clients.splice(i, 1);
  });

  if (clients.length === 0) process.exit(0);
});

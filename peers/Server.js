// // nesuna instanza socket con il server perchè il node crea un collegamento socket con il client collegato
const net = require("net"); // modulo per rete peer to peer
const crypto = require("crypto");
const dgram = require("dgram");
const sender = dgram.createSocket("udp4");
const {verifica} = require("../verify_transection/verifica.js");

let clients = [];
const server = net.createServer((socket) => {
  const client = { IP: socket.remoteAddress, data: socket };
  clients.push(client);

  // data dal client
  socket.on("data", (data) => {
    const content = JSON.parse(data.toString());
    if ("TXid" in content) {
      if (
        verifica.controllo_nonce(content.nonce.nonce_transection, content.nonce.nonce_account) &&
        verifica.controllo_hash(content) &&
        verifica.signature(content.nonce.nonce_transection, content.public_key, content.signature)
      ) {
        //inviare transazione sulla rete
        const port = 41234;
        const address = "255.255.255.255";
        sender.bind(() => {
          sender.setBroadcast(true);
          sender.send(Buffer.from(JSON.stringify(content)), port, address);
          setTimeout(() => {
            sender.close();
          }, 100);
        });
        socket.write(JSON.stringify(content));
        console.log("transazione corretta");
      } // qua va il nonce dell'account
      else console.log("transazione sbagliata");
    } else {
      console.log(`client collegati : ${clients.length}`);
      clients.forEach((element, i) => {
        console.log(`client ${element.IP} connesso`);
      });
      socket.write(`Benvenuto ${socket.remoteAddress}`);
    }
  });
  // client disconnessione
  socket.on("end", function () {
    clients = clients.filter((element) => element.IP != socket.remoteAddress);
    console.log(`client: ${socket.remoteAddress} scollegato\nclients collegati ${clients.length}`);
  });
  // errori
  socket.on("error", (err) => {
    console.error(`Socket error: ${err.message}`);
  });
});
// porta 3000 indirizzi di ascolto tutti 0.0.0.0
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

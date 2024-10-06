// // nesuna instanza socket con il server perchè il node crea un collegamento socket con il client collegato
const net = require("net"); // modulo per rete peer to peer
const { Socket } = require("socket.io-client");
let blockList = new net.BlockList(); // vedere se mettere regole specifiche tipo se prova a collegarsi più volte da quel ip
const crypto = require("crypto");
// const { account } = require("../wallet/account.js");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // curva secp256k1

let clients = [];
const server = net.createServer((socket) => {
  const client = { IP: socket.remoteAddress, data: socket };
  // controllo e client gia connesso
  if (blockList.check(socket.remoteAddress)) {
    socket.destroy();
  } else {
    blockList.addAddress(socket.remoteAddress);
    clients.push(client);
  }
  // data dal client
  socket.on("data", (data) => {
    console.log(data);

    const content = JSON.parse(data.toString());
    if ("TXid" in content) {
      if (
        controllo_nonce(content.nonce.nonce_transection, content.nonce.nonce_account) &&
        controllo_hash(content) &&
        signature(content.nonce.nonce_transection, content.public_key, content.signature)
      ) {
        socket.write(JSON.stringify(content));
        console.log("transazione corretta");
      } // qua va il nonce dell'account
      else throw Error(`${content.nonce.nonce_transection} non valido`);
    } else {
      console.log(`client collegati : ${clients.length}`);
      clients.forEach((element, i) => {
        console.log(`client ${element.IP} connesso`);
        // element.data.write(`Messaggio da ${socket.remoteAddress}: ${data}`);
      });
      socket.write(`Benvenuto ${socket.remoteAddress}`);
    }
  });
  // client disconnessione
  socket.on("end", function () {
    clients = clients.filter((element) => element.IP != socket.remoteAddress);
    let new_blocklist = new net.BlockList();
    clients.forEach((element) => {
      new_blocklist.addAddress(element);
    });
    blockList = new_blocklist; // blocklist con solo address che hanno il permesso
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

function controllo_nonce(nonce_transection, nonce_account) {
  return nonce_transection === nonce_account;
}
// controllo hash
function controllo_hash(data) {
  const data_hash = `${data.amount},${data.sender},${data.reciver},${data.sender},${data.timestamp}`;
  const hash = crypto.createHash("sha256").update(data_hash, "utf-8").digest("hex");
  return hash === data.TXid;
}

// controllo firma
function signature(nonce, public_key, sign) {
  const nonce_transection = Buffer.from(nonce.toString());
  const is_valid = ec.keyFromPublic(public_key, "hex").verify(nonce_transection, sign);
  return is_valid;
}



// const server = net.createServer((socket) => {

//   socket.on('data', (data) => {
//     console.log(data.toString()); // Stampa il messaggio ricevuto
//   });
// });

// // Ascolta sulla porta 3000 e su tutte le interfacce
// server.listen(5000, '0.0.0.0', () => {
//   console.log('Server in ascolto sulla porta 3000');
// });

const net = require("net"); // modulo per rete peer to peer
const dgram = require("dgram");
const sender = dgram.createSocket("udp4");
const { verifica } = require("../verify_transection/verifica.js");
let { nonce } = require("../wallet/account.js");
const { TXID } = require("../Blockchain/blockChain.js");
const { miner, Block } = require("../mining/mining.js");
let { mempool } = require("../Mempool/Mempool.js");
let transections = new Set();
let blocks = new Set();

// sistemare meglio questo deciso di lasciare sempre aperto ed è la rete per le transazioni
const port = 41234;
const address = "255.255.255.255";
let client_connection = false;

sender.bind(() => {
  sender.setBroadcast(true);
});

let clients = [];
const server = net.createServer((socket) => {
  // data dal client
  socket.on("data", (data) => {
    const content = JSON.parse(data.toString());
    if ("TXid" in content) {
      // controllo transazione ricevuta
      if (
        verifica.controllo_hash(content.TXid) &&
        verifica.signature(content.TXid.nonce.nonce_transection, content.TXid.public_key, content.TXid.signature)
      ) {
        client_connection = true;
        //inviare transazione sulla rete
        nonce++;
        sender.send(Buffer.from(JSON.stringify(content)), port, address); // invia dati a rete udp4
        socket.write(JSON.stringify(content)); // invia dati a client
        console.log("transazione corretta");
      } else console.log("transazione sbagliata");
    } else if ("Mempool" in content) {
      client_connection = true;
      if (miner) {
        const last_transection_in_mempool = content.Mempool[content.Mempool.length - 1];

        const tx = new TXID(
          last_transection_in_mempool.input.amount,
          last_transection_in_mempool.input.sender,
          last_transection_in_mempool.output.reciver,
          last_transection_in_mempool.fee_user
        );
        transections.add(tx);

        // console.log(transections);
        if (transections.size > 0) {
          // let mempool_sorted = Array.from(mempool.sort_Mempool(mempool.Mempool));
          let transections_sort = Array.from(mempool.sort_Mempool(transections)); 
          console.log(transections_sort);
          
          let fee_users = 0;
          transections.forEach((element) => (fee_users += element.fee_miner));
          //   console.log(fee_users);
          if (blocks.size === 0) block_prev_hash = "0000000000000000000000000000000000000000000000000000000000000000";
          else {
            block_prev_hash = [...blocks][blocks.size - 1].hash_block;
            // console.log(block_prev_hash);
          }
          let transections_hash = Array.from(transections_sort).map((element) => element.txid); // hash delle transazioni
          const block = new Block(transections_hash, fee_users, block_prev_hash); // creazione blocco
          // transections = new Set(); // reset
          blocks.add(block);
          // console.log(blocks);
        }
      }
    } else {
      client_connection = false;
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
  se client si connette allora per comunicare con server si imposta client_connection = false 
  cosi se si chiudesse si intende il client che interagisce con server e si collega ad altri server.
  quando si invia una nuova transazione con il client (che è lo stesso IP) viene impostata in true 
  cosi che alla sua chiusura legge transazione e dopo si rimposta a false cosi che quando le transazioni
  sono finite si legge il client che interagisce con altri nodi
 */

  socket.on("end", function () {
    if (client_connection) {
      client_connection = false;
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
    clients.splice(i, 1); // rimuove elemento in array
  });
  if (clients.length === 0) process.exit(0);
});

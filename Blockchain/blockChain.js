const crypto = require("crypto");
let { keyPair, address_wallet, nonce } = require("../wallet/account.js");
const net = require("net");
const dns = require("dns");
const os = require("os");
const options = { family: 4 };
var prompt = require("prompt-sync")();

const AMOUNT = parseInt(prompt("quantità da inviare: "));
// const WALLET_SENDER = prompt('wallet sender: ')

const WALLET_RECIVER_NUMBER = parseInt(prompt("a quanti wallet vuoi inviare?: "));
let wallet = [];
for (let i = 0; i < WALLET_RECIVER_NUMBER; i++) {
  const WALLET_RECIVER = prompt("wallet reciver: ");
  wallet.push(WALLET_RECIVER);
}
const FEES = prompt("fee: ");

/*
  N.B. le variabili con funzioni sempre per ultime perchè se vengono inizializzate prima dellle
  variabili e alcune varibaili servono 
  all'interno della funzione ti darà undefined perchè vengono inizializzate dopo 
*/
class Transection {
  // implementare looktime
  constructor(amount, sender, reciver, fees) {
    // calcolare change se necessario
    this.amount = amount;
    this.sender = sender;
    this.reciver = reciver;
    this.fees = fees;
    this.nonce = nonce;
    this.status = "pending";
    this.fee_price = 0.5;
    this.fee_miner = this.fee_miner(); // reward
    this.timestamp = new Date().toLocaleString();
    this.txid = this.transection_id();
    this.signature = this.signature_check(keyPair);
    /* bisogna per forza incrementarlo anche qua perchè js non lo incrementa globalmente ma localmente 
     nel file l'incremento del nonce c'è anche nel file server   
     */
    nonce++;
  }

  transection_id() {
    /*
      nel secondo ci deve essere il nonce del sender cosi che il nonce di 
      quella transazione venga messa all'interno della transazione 
    */
    let data = `${this.amount},${this.sender},${this.reciver},${this.nonce},${this.timestamp}`;
    const hash = crypto.createHash("sha256").update(data, "utf-8").digest("hex");
    return hash;
  }

  signature_check(keys) {
    //TODO // al posto della firma ci deve essere la transazione_id

    const nonce_transection = Buffer.from(nonce.toString()); // firma su nonce
    /*
      Non è necessario passare la chiave privata come argomento perché 
      l'oggetto KeyPair sa già quale chiave utilizzare internamente.
    */
    const signature = keys.sign(nonce_transection);
    const sign = signature.toDER("hex");
    const verify = keys.verify(nonce_transection, sign);
    console.log(verify);
    return sign;
  }

  fee_miner() {
    /* 1000000000 cyberini fanno 1 cy */
    const fee_fixed = 21.0 * 1000 * 1e-9;
    const total_fee = fee_fixed + (fee_fixed / 2) * (this.reciver.length - 1);
    return total_fee;
  }

  send() {
    let index = 0;
    if (this.signature === true) {
      // al posto di this.sender ci sarà il balance di chi invia i soldi
      if (this.sender < this.amount * this.reciver.length) throw new RangeError("error balance ( not enough balance)");
      else if (this.amount < 0) throw new Error("value amount wrong");
      else if (this.fee_miner > this.fees) {
        throw Error("fee non enough");
      } else {
        /* Se le fee dell'account sono in eccesso vanno ritornate.
           Se si ha solo un address allora si invierà la quantità a quello se se ne
           avranno di più allora si invierà la quantita a tutti gli address devi controllare il balance di ogni account 
        */
        this.sender -= total_fee;
        do {
          this.sender -= this.amount;
          this.reciver[index] += this.amount;
          index++;
        } while (index < this.reciver.length);
        this.status = "done";
      }
    } else throw Error("signature wrong");
  }
  //nonce, gasPrice, gasLimit, to, value, data, chainID, 0, 0.
  transection_data() {
    /* Any remaining amount of bitcoin that isn't used up will be
     claimed by a miner as the transaction fee.in bitcoin
     */
    const data = {
      TXid: this.txid,
      timestamp: this.timestamp,
      input: {},
      output: {},
      fee_need: this.fee_miner, // in cy
      fee_user: this.fees, // in cy
      signature: this.signature,
      nonce: { nonce_transection: this.nonce },
      public_key: keyPair.getPublic("hex"),
    };
    data.input["sender"] = this.sender;
    data.input["amount"] = this.amount;
    data.output["reciver"] = this.reciver;
    return data;
  }
}

class Block {
  constructor(transections, reward_transection, copy, target, hash_prev, uncle) {
    this.altezza = 0;
    this.copy = copy; // balance all account
    this.target = null;
    this.reward = (2 + reward_transection) * 1e9; // cyberini
    this.hash_prev = hash_prev;
    // this.uncle = uncle;
    this.nonce = 0; // pow
    this.tx_root = this.merkel_tree(transections);
    this.timestamp = new Date().toLocaleString();
    this.hash_block = "";
    this.time_value = 3;
  }
  // coinbase_transection
  cb_transection() {
    const reward = Math.round(this.reward).toString(16);
    const TX_input = "C0000000000000000000000000000000000000000000000000000000000000000";
    const TX_output = "address miner";
    return TX_input + reward + TX_output;
  }

  merkel_tree(TXS) {
    let array_layer_hash = [];
    TXS.unshift(this.cb_transection()); // si aggiunge a coinbase transection come prima transazione
    let value = 0;
    //se transazioni sono dispari allora si dublica l'ultimo elemento
    if (TXS.length % 2 === 1) TXS.push(TXS[TXS.length - 1]);
    while (TXS.length > 1) {
      array_layer_hash = TXS.map((element) => this.hash_value(element));
      console.log(TXS);

      TXS = [];
      for (let i = 0; i < array_layer_hash.length; i += 2) {
        value = array_layer_hash[i].concat(array_layer_hash[i + 1]);
        const value_hash = this.hash_value(value);
        TXS.push(value_hash);
      }
    }
    return TXS[0];
  }

  hash_value(value) {
    return crypto.createHash("sha256").update(value, "utf-8").digest("hex");
  }

  block_data(TXS) {
    let dati_block = { header: {}, data: {} };
    dati_block.header["timestamp"] = this.timestamp;
    dati_block.header["nonce"] = this.nonce;
    dati_block.header["altezza"] = this.altezza;
    dati_block.header["hash prev"] = this.hash_prev;
    dati_block.header["target"] = this.target; // messo in bits il numero
    dati_block.data["transazioni"] = TXS;
    return dati_block;
  }

  POW() {
    // pow 111 inizio hash
    this.target = "1".repeat(this.time_value);
    const time_start = performance.now(); // time in millisecond
    let data = `${this.tx_root}${this.timestamp}'precedente blocco'${parseInt(this.target).toString(2)}`;

    while (!this.hash_block.startsWith(this.target)) {
      this.nonce++;
      data += this.nonce.toString();
      this.hash_block = this.hash_value(data);
    }
    const time_end = performance.now(); // time in millisecond
    let time = (time_end - time_start) / 1000; // time in second
    /*
      time se troppo poco deve aumentare se troppo grande deve diminuire 
      cosi da modificare la pow  
    */
    if (0 < time > 1) this.time_value = 4;
    else if (time > 20) this.time_value = 3;
    return this.hash_block;
  }
}

class BlockChain {
  constructor(block) {
    this.block = block;
  }
}

let transections = [
  new Transection(AMOUNT, address_wallet, wallet, FEES),
  new Transection(AMOUNT, address_wallet, ["account rivente"], 15),
  new Transection(AMOUNT, address_wallet, ["account"], 3),
  new Transection(AMOUNT, address_wallet, ["account ricevente"], 32),
  new Transection(AMOUNT, address_wallet, ["account cevente"], 45),
  new Transection(AMOUNT, address_wallet, ["accnt ricente"], 50),
  new Transection(AMOUNT, address_wallet, ["accnt rnte"], 20),
];

// let transection = new Transection(100, account.address, ["account ricevente"], 1);

/*
prima di metterlo della mempool bisogna aspettare che tutti gli altri nodi 
la verifichino e dopo si può mettere nella mempool 
*/

// let block = new Block(transections_hash, transection.fee_miner);
// console.log(block.tx_root);
// console.log(block.cb_transection());
// console.log(transection.transection_data());
/*
la trasmissione deve essere corretta e dopo verra trasmesa sulla rete gli altri nodi la controlleranno e se è valida verra 
messa nella mempool 
*/

// nel blocco ci deve essere header con interno precedente hash blocco, target per pow,
// zii se blocco creato contemporaneamente, altezza, tx_root, nonce, coinbase transection, Timestamp, in blocco tenere solo wallet aggiornato
// non tutta la copia della blockchain
// fuori header tutte le transazioni all'interno del blocco

// transazione, quantità, address, feee, change

/*
POW SI PUò FARE UGUALE A BITCOIN O ANCHE CHE DEVE TROVARE UN HASH DEL BLOCCCO CHE INIZZI CON 0000 USANDO UNO 
SHA CON INPUT IL NONCE CHE è QUELLO CHE DEVE CAMBIARE I DATI E HEADER
*/

/*
UDP è un protocollo di rete che consente l'invio di pacchetti 
di dati tra host in una rete senza stabilire una connessione formale
*/
// ottieni ip macchina

dns.lookup(os.hostname(), options, (err, addr) => {
  if (err) {
    console.error(err);
  } else {
    let index = 0;
    // setInterval(() => {
    const server = new net.Socket();
    // if (index === transections.length) index = 0;
    server.connect(5000, addr, () => {
      server.write(JSON.stringify(transections[index].transection_data()));
      index++;
    });
    server.on("data", (data) => {
      console.log(JSON.parse(data));
    });
    setTimeout(() => {
      server.destroy();
    }, 500);
    // }, 1000);
  }
});

// transazione dopo che è stata verificata dai nodi viene messa dentro alla mempool

/* TODO
 sistemare altezza ma penso che si ameglio provare a sisteare la rete e dopo l'altezza
 altre caratterisiche si possono fare dopo 
 sistemare collegamento rete 
 */

/*
To sign a transaction in Ethereum, the originator must:

Create a transaction data structure, containing nine fields: nonce, gasPrice, gasLimit, to, value, data, chainID, 0, 0.

Produce an RLP-encoded serialized message of the transaction data structure.

Compute the Keccak-256 hash of this serialized message.

Compute the ECDSA signature, signing the hash with the originating EOA’s private key.

Append the ECDSA signature’s computed v, r, and s values to the transaction.
 */

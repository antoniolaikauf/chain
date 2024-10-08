const crypto = require("crypto");
const { account } = require("../wallet/account.js");
const net = require("net");
const server = new net.Socket();
const dns = require("dns");
const os = require("os");
const options = { family: 4 };

/*
  N.B. le variabili con funzioni sempre per ultime perchè se vengono inizializzate prima dellle
  variabili e alcune varibaili servono 
  all'interno della funzione ti darà undefined perchè vengono inizializzate dopo 
*/
class Transection {
  // implementare looktime
  constructor(amount, sender, reciver, fee) {
    // calcolare change se necessario
    this.amount = amount;
    this.sender = sender;
    this.reciver = reciver;
    this.fee = fee;
    this.fee_miner = 0;
    this.nonce = account.nonce;
    this.status = "pending";
    this.fee_price = 0.5;
    this.timestamp = new Date().toLocaleString();
    this.txid = this.transection_id();
    this.signature = this.signature_check(account.keyPair);
    // this.account_balance = account_balance;
  }

  transection_id() {
    /*
      nel secondo ci deve essere il nonce del sender cosi che il nonce di 
      quella transazione venga messa all'interno della transazione 
    */
    this.nonce++;
    account.nonce++;
    let data = `${this.amount},${this.sender},${this.reciver},${this.nonce},${this.timestamp}`;
    const hash = crypto.createHash("sha256").update(data, "utf-8").digest("hex");
    return hash;
  }

  signature_check(keys) {
    const nonce_transection = Buffer.from(account.nonce.toString()); // firma su nonce
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

  send() {
    /* 1000000000 cyberini fanno 1 cy */
    const fee_fixed = 21.0 * 1000 * 1e-9;
    const total_fee = fee_fixed + (fee_fixed / 2) * (this.reciver.length - 1);

    let index = 0;
    this.fee_miner += total_fee;
    if (this.signature === true) {
      // al posto di this.sender ci sarà il balance di chi invia i soldi
      if (this.sender < this.amount * this.reciver.length) throw new RangeError("error balance ( not enough balance)");
      else if (this.amount < 0) throw new Error("value amount wrong");
      else if (total_fee > this.fee) {
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

  transection_data() {
    /* Any remaining amount of bitcoin that isn't used up will be
     claimed by a miner as the transaction fee.in bitcoin
     */
    const data = {
      TXid: transection.txid,
      timestamp: transection.timestamp,
      input: {},
      output: {},
      fee_need: this.fee_miner + " cy",
      fee_user: this.fee + " cy",
      signature: transection.signature,
      nonce: { nonce_transection: transection.nonce, nonce_account: account.nonce },
      public_key: account.keyPair.getPublic("hex"),
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

  cb_transection() {
    const reward = Math.round(this.reward).toString(16);
    const TX_input = "C0000000000000000000000000000000000000000000000000000000000000000";
    const TX_output = "address miner";
    return TX_input + reward + TX_output;
  }

  merkel_tree(TXS) {
    let array_layer_hash = [];
    TXS.unshift(this.cb_transection());
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
    const time_start = performance.now();
    let data = `${this.tx_root}${this.timestamp}'precedente blocco'${parseInt(this.target).toString(2)}`;

    while (!this.hash_block.startsWith(this.target)) {
      this.nonce++;
      data += this.nonce.toString();
      this.hash_block = this.hash_value(data);
    }
    const time_end = performance.now();
    let time = (time_end - time_start) / 1000;
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

class Mempool {
  constructor() {
    this.transections = new Set();
  }

  transection_add(TX) {
    this.transections.add(TX);
  }

  get_transection(TX) {
    for (const element of this.transections) {
      if (element.txid === TX) return element;
      else console.log("transazione non presente");
    }
  }
}

let transections = [
  new Transection(100, account.address, ["account ricevente"], 1, null),
  new Transection(100, account.address, ["account rivente"], 1, null),
  new Transection(100, account.address, ["account"], 1, null),
  new Transection(100, account.address, ["account ricevente"], 1, null),
  new Transection(100, account.address, ["account cevente"], 1, null),
  new Transection(100, account.address, ["accnt ricente"], 1, null),
  new Transection(100, account.address, ["accnt rnte"], 1, null),
];

// console.log(transections);

let transection = new Transection(100, account.address, ["account ricevente"], 1, null);

// console.log(transection.signature);
// console.log(transection.transection_data());

// let transection2 = new Transection(100, account.address, ["account"], 1, null);
// let transection3 = new Transection(100, account.address, ["account ricevente"], 1, null);
// let transection4 = new Transection(100, account.address, ["account cevente"], 1, null);
// let transection5 = new Transection(100, account.address, ["accnt ricente"], 1, null);
// let transection2 = new Transection(100, account.address, ["account ricevente", "account ricevente"], 0.00050051000000000000002, null);

/*
prima di metterlo della mempool bisogna aspettare che tutti gli altri nodi 
la verifichino e dopo si può mettere nella mempool 
*/

// const mempool = new Mempool();
// mempool.transection_add(transection);
// mempool.get_transection(transection.txid);

// let transections_hash = transections.map((element) => element.transection_id()); // ottieni l'hash delle transazioni

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
    server.connect(5000, addr, () => {
      server.write(JSON.stringify(transection.transection_data()));
    });
    server.on("data", (data) => {
      console.log(JSON.parse(data));
    });
    setTimeout(() => {
      server.destroy();
    }, 500);
  }
});

/*
TODO VEDERE SE è IL SETTIMEOUT SOPRA IL PROBLEMA PERCHè MI SI DISCONETTE SE LO LASCIO E SE INVIO UN ALTRA TRANSAZIONE
MI DA ERRORE SE LO TOLGO NON MI SI DISCONETTE IL CLIENT 
*/

/* TODO
 sistemare altezza ma penso che si ameglio provare a sisteare la rete e dopo l'altezza
 altre caratterisiche si possono fare dopo 
 sistemare collegamento rete 
 */

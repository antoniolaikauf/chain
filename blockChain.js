const crypto = require("crypto");
const { account } = require("./account.js");
const net = require("net");
const server = new net.Socket();
const dns = require("dns");
const os = require("os");
const options = { family: 4 };

// VEDERE SE USARE IL TIPO DI FEE COME QUELLE DI ETH
/*
  N.B. le variabili con funzioni sempre per ultime perchè se vengono inizializzate prima dellle
  variabili e alcune varibaili servono 
  all'interno della funzione ti darà undefined perchè vengono inizializzate dopo 
*/
class Transection {
  constructor(amount, sender, reciver, fee, looktime) {
    // calcolare change se necessario
    this.amount = amount; // amount in go per fare un ci ci vuole 10000000
    this.sender = sender;
    this.reciver = reciver;
    this.fee = fee;
    this.looktime = looktime;
    this.nonce = 0;
    this.status = "pending";
    this.fee_price = 0.5;
    this.timestamp = new Date().toLocaleString();
    this.txid = this.transection_id();
    this.signature = this.signature_check(account.keyPair, account.private_key);
    // this.account_balance = account_balance;
  }

  transection_id() {
    /*
      nel secondo ci deve essere il nonce del sender cosi che il nonce di 
      quella transazione venga messa all'interno della transazione 
    */
    let data = `${this.amount},${this.sender},${this.reciver},${this.sender},${this.timestamp}`;
    const hash = crypto.createHash("sha256").update(data, "utf-8").digest("hex");
    this.nonce++
    account.nonce++
    return hash;
  }

  signature_check(keys, p_k) {
    const nonce_transection = Buffer.from(account.nonce.toString()); // firma su nonce
    /*
      Non è necessario passare la chiave privata come argomento perché 
      l'oggetto KeyPair sa già quale chiave utilizzare internamente.
    */
    const signature = keys.sign(nonce_transection);
    const sign = signature.toDER("hex");
    // console.log(sign);
    return sign;
    // const isValid = keys.verify(nonce_transection, sign);
    // return isValid
  }

  send(cb_transection) {
    const fee_fixed = 21.0 * 1000 * 0.1e-8;
    const total_fee = fee_fixed + fee_fixed / this.reciver.length;
    let index = 0
    
    // sistemare qua la verifica perche ora signature ha la firma ma non controlla se è corretta o no

    
    if (this.signature === true) {
      if (this.sender < this.amount * this.reciver.length) throw new RangeError("error balance");
      else if (this.amount < 0) throw new Error("value amount wrong");
      else if (total_fee > this.fee) {
        this.error_fee(this.reciver, cb_transection);
      } else {
        /*
           se si ha solo un address allora si invierà la quantità a quello se se ne
           avranno di più allora si invierà la quantita a tutti gli address devi controllare il balance di ogni account 
        */
        do {
          this.sender -= this.amount;
          this.reciver[index] += this.amount;
          index++;
        } while (index < this.reciver.length);
        this.status = "done";
      }
    } else throw Error("signature wrong");
  }

  error_fee(account_user, address_miner) {
    account_user -= this.fee;
    address_miner += this.fee;
    throw Error("fee non enough");
  }
}

class Block {
  constructor(altezza, tx_root, nonce, timestamp, coinbase_transection, copy, target, reward, hash_prev, uncle) {
    this.altezza = altezza;
    this.tx_root = tx_root;
    this.timestamp = timestamp;
    this.coinbase_transection = coinbase_transection;
    this.copy = copy;
    this.target = target;
    this.reward = reward;
    this.hash_prev = hash_prev;
    this.uncle = uncle;
    this.nonce = "nonce";
  }
}

class BlockChain {
  constructor(block) {
    this.block = block;
  }
}

let transection = new Transection(100, account.address, [" account ricevente"], 1, null);
// let transection2 = new Transection(100, account.address, ["account ricevente", "account ricevente"], 0.00050051000000000000002, null);

const verify_transection = {
  TXid: transection.txid,
  sender: transection.sender,
  reciver: transection.reciver,
  timestamp: transection.timestamp,
  amount: transection.amount,
  signature: transection.signature,
  nonce: { nonce_transection: transection.nonce, nonce_account: account.nonce },
  // key: account.keyPair,
};

exports.account = { verify_transection };

// ottieni ip macchina
dns.lookup(os.hostname(), options, (err, addr) => {
  if (err) {
    console.error(err);
  } else {
    server.connect(3000, addr, () => {
      server.write(JSON.stringify(verify_transection));
    });
    setTimeout(() => {
      server.destroy();
    }, 100);
  }
});

// transection.send();

// transection2.send();

let mempool = [];
let block = new Block();

let chain = new BlockChain(block);

/*
la trasmissione deve essere corretta e dopo verra trasmesa sulla rete gli altri nodi la controlleranno e se è valida verra 
messa nella mempool 
*/

// nel blocco ci deve essere header con interno precedente hash blocco, target per pow,
// zii se blocco creato contemporaneamente, altezza, tx_root, nonce, coinbase transection, Timestamp, in blocco tenere solo wallet aggiornato
// non tutta la copia della blockchain
// fuori header tutte le transazioni all'interno del blocco

// transazione, quantità, address, feee, change

// chiave privata e pubblica
// creare wallet

/*
POW SI PUò FARE UGUALE A BITCOIN O ANCHE CHE DEVE TROVARE UN HASH DEL BLOCCCO CHE INIZZI CON 0000 USANDO UNO 
SHA CON INPUT IL NONCE CHE è QUELLO CHE DEVE CAMBIARE I DATI E HEADER
*/

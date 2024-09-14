const crypto = require("crypto");
const { account } = require("./account.js");

// VEDERE SE USARE IL TIPO DI FEE COME QUELLE DI ETH
class Transection {
  constructor(amount, sender, reciver, fee, looktime) {
    // calcolare change se necessario
    this.amount = amount.toString();
    this.sender = sender;
    this.reciver = reciver;
    this.fee = fee;
    this.looktime = looktime;
    this.timestamp = new Date();
    this.txid = this.transection_id();
    this.signature = this.signature_check(account.keyPair, account.private_key);
    this.nonce;
    this.status = "pending";
    this.fee_price = 0.5;
  }

  transection_id() {
    let data = `${this.amount},${this.sender},${this.reciver},${account.nonce},${this.timestamp}`;
    const hash = crypto.createHash("sha256").update(data, "utf-8").digest("hex");
    account.nonce++;

    return hash;
  }

  signature_check(keys, p_k) {
    const signature = keys.sign(p_k); // Firma
    const derSign = signature.toDER("hex"); // firma in formato DER
    // console.log(`firma transazione: ${derSign}`);
    return keys.verify(p_k, derSign); // verifica firma con chiave privata
  }

  send() {
    const total_fee = 21.0 * 100 * 0.1e-8;
    if (this.signature === true) {
      if (account.balance < this.amount || this.amount > account.balance) throw new RangeError("error balance");
      else if (this.amount < 0) throw new Error("value amount wrong");
      else if (total_fee < fee) {
        account.balance -= this.fee;
        this.reciver += this.fee;
        throw Error("fee non enough");
      } else {
        account.balance -= this.amount;
        this.reciver += this.amount;
      }
    } else throw Error("signature wrong");
  }
}

class Block {
  constructor(altezza, tx_root, nonce, timestamp, coinbase_transection, copy, target, reward, hash_prev, uncle) {
    this.altezza = altezza;
    this.tx_root = tx_root;
    this.nonce = nonce;
    this.timestamp = timestamp;
    this.coinbase_transection = coinbase_transection;
    this.copy = copy;
    this.target = target;
    this.reward = reward;
    this.hash_prev = hash_prev;
    this.uncle = uncle;
  }
}

class BlockChain {
  constructor(block) {
    this.block = block;
  }
}

let transection = new Transection(100, account.address, "account ricevente", 1, null);
let transection2 = new Transection(100, account.address, "account ricevente", 1, null);

transection.send();
console.log(transection.txid);

let mempool = [];
let block = new Block();

let chain = new BlockChain(block);

// nel blocco ci deve essere header con interno precedente hash blocco, target per pow,
// zii se blocco creato contemporaneamente, altezza, tx_root, nonce, coinbase transection, Timestamp, in blocco tenere solo wallet aggiornato
// non tutta la copia della blockchain
// fuori header tutte le transazioni all'interno del blocco

// transazione, quantità, address, feee, change

// chiave privata e pubblica
// creare wallet

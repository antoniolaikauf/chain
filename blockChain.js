const crypto = require("crypto");
const { account } = require("./account.js");

// VEDERE SE USARE IL TIPO DI FEE COME QUELLE DI ETH
class Transection {
  constructor(amount, sender, reciver, fee, looktime, account_balance) {
    // calcolare change se necessario
    this.amount = amount; // amount in go per fare un ci ci vuole 10000000
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
    this.account_balance = account_balance;
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

  // TODO QUEST ATRANAZIONE VALIDARE SULLA RETE
  send(cb_transection) {
    const total_fee = 21.0 * 1000 * 0.1e-8 + (21.0 * 1000 * 0.1e-8) / this.reciver.length;
    let index = 0;

    if (this.signature === true) {
      if (this.account_balance < this.amount || this.amount > this.account_balance) throw new RangeError("error balance");
      else if (this.amount < 0) throw new Error("value amount wrong");
      else if (total_fee > this.fee) {
        this.error_fee(this.account_balance, cb_transection);
      } else {
        /*
           se si ha solo un address allora si invierà la quantità a quello se se ne
           avranno di più allora si invierà la quantita a tutti gli address
        */
        do {
          this.account_balance -= this.amount;
          this.reciver[index] = this.amount;
          index++;
        } while (index < this.reciver.length);
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

// let transection = new Transection(100, account.address, [" account ricevente"], 1, null, account.balance);
let transection2 = new Transection(
  100,
  account.address,
  ["account ricevente", "account ricevente"],
  0.00050051000000000000002,
  null,
  account.balance
);

// console.log(transection.txid);
// transection.send();

transection2.send();

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

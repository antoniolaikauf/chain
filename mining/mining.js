const miner = true; // impostato su true allora il nodo fara da miner 

class Block {
  constructor(transections, reward_transection, hash_prev) {
    this.altezza = 0;
    this.copy = null // balance all account
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
    let data = `${this.nonce}${this.hash_prev}${ this.tx_root}${this.timestamp }'precedente blocco'${ parseInt(this.target).toString(2) }`;

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

if (require.main !== module) {
  module.exports = {miner,  Block}
}
class Transection {
    constructor() {
        
    }
}


class Block{
    constructor() {
        
    }
}


class BlockChain {
    constructor(block) {
        this.block = block
    }
}

let Transection = new Transection()
let block = new Block()
let chain = new BlockChain(block)

// nel blocco ci deve essere header con interno precedente hash blocco, target per pow,
// zii se blocco creato contemporaneamente, altezza, tx_root, nonce, coinbase transection, Timestamp, in blocco tenere solo wallet aggiornato
// non tutta la copia della blockchain 
// fuori header tutte le transazioni all'interno del blocco

// transazione, quantità, address, feee, change

// chiave privata e pubblica 
// creare wallet 
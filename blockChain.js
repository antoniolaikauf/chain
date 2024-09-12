//VEDERE SE USARE IL TIPO DI FEE COME QUELLE DI ETH 
class Transection {
    constructor(amount, sender, reciver, fee, looktime) { // calcolare change se necessario
        this.amount = amount
        this.sender = sender
        this.reciver = reciver
        this.fee = fee
        this.looktime = looktime
    }
}


class Block{
    constructor(altezza, tx_root, nonce, timestamp, coinbase_transection,
                copy, target, reward, hash_prev, uncle) {
        this.altezza = altezza
        this.tx_root = tx_root
        this.nonce = nonce
        this.timestamp = timestamp
        this.coinbase_transection = coinbase_transection
        this.copy = copy
        this.target = target
        this.reward = reward
        this.hash_prev = hash_prev
        this.uncle = uncle
    }
}


class BlockChain {
    constructor(block) {
        this.block = block
    }
}

let transection = new Transection()
let mempool = []
let block = new Block()

let chain = new BlockChain(block)

// nel blocco ci deve essere header con interno precedente hash blocco, target per pow,
// zii se blocco creato contemporaneamente, altezza, tx_root, nonce, coinbase transection, Timestamp, in blocco tenere solo wallet aggiornato
// non tutta la copia della blockchain 
// fuori header tutte le transazioni all'interno del blocco

// transazione, quantità, address, feee, change

// chiave privata e pubblica 
// creare wallet 
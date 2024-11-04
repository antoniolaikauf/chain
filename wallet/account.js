const crypto = require("crypto");
const base58 = require("bs58").default;
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // curva secp256k1
var fs = require("fs");
const max_ecdsa = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const path = require("path");

function entropia() {
  return crypto.randomBytes(16); // 128 bits entropia
}

const valid_private_key = (n, b) => {
  const path_bits = path.join(__dirname, "bits.json"); // percorso per bits randomici
  let private_key = null;
  if (fs.existsSync(path_bits)) {
    // file con bit entropia esistente
    const file = require("./bits.json");
    b = Buffer.from(file.bits, "hex");
    private_key = crypto.createHash("sha256").update(b, "utf-8").digest();
  } else {
    private_key = crypto.createHash("sha256").update(b, "utf-8").digest();
    const number_private_key = BigInt("0x" + private_key.toString("hex"));
    // 1n perchè si utilizza numeri troppo grandi per rappresentare numeri in js e se si fa un controllo tra bigint o number esce un errore
    if (1n <= number_private_key && number_private_key <= n) {
      const bits = { bits: b };
      const text = JSON.stringify(bits);
      // crea file con private_key valida per la curva secp256k1
      fs.writeFile("bits.json", text, (err, result) => {
        if (err) console.error("error", err);
      });
    } else valid_private_key(n, entropia());
  }
  const seed = BigInt("0x" + b.toString("hex")); // seed
  let seed_bit = "";
  b.forEach((element) => {
    seed_bit += element.toString(2).padStart(8, "0"); // seed in number
  });
  // console.log(seed_bit + "\n" + seed);
  return private_key;
};

const private_key = valid_private_key(max_ecdsa, entropia());
const keyPair = ec.keyFromPrivate(private_key); // coppia di chiavi
const public_key = keyPair.getPublic("hex");

/*
  la public key con 04 prefisso significa che non è compressa con lunghezza 130 hex i primi
  due sono il prefisso, i succesivi 64 hex sono cordinata x e i rimanenti 64 hex sono y
  se ha 02 o 03 allora è compressa 02 sarebbe il prefisso che indica y è un valore pari 03 è un
  valore dispari 
*/

function process_address(PK) {
  // doppio hash e alla fine in base58 piu il prefisso per riconoscere l'address
  const sha256 = crypto.createHash("sha256");
  sha256.update(PK);
  const digest_sha = sha256.digest().toString("hex");

  const ripemd_160 = crypto.createHash("ripemd160");
  ripemd_160.update(digest_sha);
  const digest_rip = ripemd_160.digest().toString("hex");

  const encoded = base58.encode(Buffer.from(digest_rip));
  return "c" + encoded;
}

let nonce = 0;
let balance = 1000;
const address_account = process_address(public_key);
module.exports = { private_key, keyPair, address_account, nonce, balance, public_key };

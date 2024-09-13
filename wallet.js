const crypto = require("crypto");
const base58 = require("bs58").default;
// const ellipticcurve  = require('starkbank-ecdsa')

const max_ecdsa = parseInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const Elliptic_Curve_secp256k1 = crypto.createECDH("secp256k1");

function entropia() {
  let bits = "";
  for (let i = 0; i < 64; i++) {
    let chunk = crypto.randomInt(0, 4); // 0 a 3
    let bits = chunk.toString(2).padStart(2, 0);
    // ogni lancio genera 2 bit di entropia fino a raggiungere 128 bit di entropia
    // per calcolare entropia Math.log2(4) in 4 sarebbero tutti i possibili esiti da 0 a 3
    bits = bits.concat(bits);
  }
  return bits
}

const valid_private_key = (n, b) => {
  const private_key = crypto.createHash("sha256").update(b, "utf-8").digest();
  const number_private_key = parseInt("0x" + private_key.toString("hex"));
  if (1 <= number_private_key && number_private_key <= n) return private_key;
  else valid_private_key(n, entropia());
};

private_key = valid_private_key(max_ecdsa, entropia());
Elliptic_Curve_secp256k1.setPrivateKey(private_key);
const public_key = Elliptic_Curve_secp256k1.getPublicKey("", "compressed");
// // cordinate solo quando non è compressa perchè se è compressa allora la public_key è la x
// // se non è compressa allora si divide a metà la parte prima è la x e l'altra è la y
// // primo byte è il prefisso se è 3 allora cordinata y è dispari se no è pari
console.log(`private key: ${private_key.toString("hex")}\npubblic key: ${public_key.toString("hex")}`);

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

console.log(`address: ${process_address(public_key)}`);

// firma usare ecdsa key function

// var ecdsa = ellipticcurve.Ecdsa

// var transection = 'ccc'

// var PrivateKey = ellipticcurve.PrivateKey;

// // Generate new Keys
// let privateKey = new PrivateKey();
// let publicKey = privateKey.publicKey();
// var transection='ddd'
// var signature = ecdsa.sign(transection, privateKey)
// console.log(privateKey);

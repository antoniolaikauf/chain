const crypto = require("crypto");
const base58 = require("bs58").default;
const EC = require('elliptic').ec; 
const ec = new EC('secp256k1'); // curva secp256k1

const max_ecdsa = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const Elliptic_Curve_secp256k1 = crypto.createECDH("secp256k1");

function entropia() {
  let bits = "";
  for (let i = 0; i < 64; i++) {
    let chunk = crypto.randomInt(0, 4); // 0 a 3
    bits = chunk.toString(2).padStart(2, 0);
    // ogni lancio genera 2 bit di entropia fino a raggiungere 128 bit di entropia
    // per calcolare entropia Math.log2(4) in 4 sarebbero tutti i possibili esiti da 0 a 3
    bits = bits.concat(bits);
  }
  return bits;
}

const valid_private_key = (n, b) => {
  const private_key = crypto.createHash("sha256").update(b, "utf-8").digest();
  const number_private_key = BigInt("0x" + private_key.toString("hex"));
  if (1 <= number_private_key && number_private_key <= n) return private_key;
  else valid_private_key(n, entropia());
};

const private_key = valid_private_key(max_ecdsa, entropia());
const keyPair = ec.keyFromPrivate(private_key)
const public_key = keyPair.getPublic('hex')
// la public key 
console.log(`private key: ${private_key.toString("hex")}\npubblic key: ${public_key}`);

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

const signature = keyPair.sign(private_key); // Firma 

// Converte la firma in formato DER
const derSign = signature.toDER('hex');
console.log(`firma tranazione: ${derSign}`);
console.log(keyPair.verify(private_key, derSign));

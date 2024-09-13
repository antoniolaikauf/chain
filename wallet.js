const crypto = require("crypto");
const base58 = require("bs58").default;

let numbers = "";
for (let i = 0; i < 64; i++) {
  let chunk = crypto.randomInt(0, 4); // 0 a 3
  let bits = chunk.toString(2).padStart(2, 0);
  // ogni lancio genera 2 bit di entropia fino a raggiungere 128 bit di entropia
  // per calcolare entropia Math.log2(4) in 4 sarebbero tutti i possibili esiti da 0 a 3
  numbers = numbers.concat(bits);
}

const Elliptic_Curve_secp256k1 = crypto.createECDH("secp256k1");
const private_key = crypto.createHash("sha256").update(numbers, "utf-8").digest();
Elliptic_Curve_secp256k1.setPrivateKey(private_key);

const public_key = Elliptic_Curve_secp256k1.getPublicKey("", "compressed");
const x = public_key.toString("hex").slice(0, 34);
const y = public_key.toString("hex").slice(34);
// primo byte è il prefisso se è 3 allora cordinata y è dispari se no è pari
console.log(`private key: ${private_key.toString("hex")}\npubblic key: ${public_key.toString("hex")}\ncordinate x: ${x}\ncordinate y: ${y}`);
// firma usare ecdsa key function

function process_address(PK) {
  const sha256 = crypto.createHash("sha256");
  sha256.update(PK);
  const digest_sha = sha256.digest().toString("hex");

  const ripemd_160 = crypto.createHash("ripemd160");
  ripemd_160.update(digest_sha);
  const digest_rip = ripemd_160.digest().toString("hex");

  const encoded = base58.encode(Buffer.from(digest_rip));
  return 'c' + encoded;
}

console.log(process_address(public_key));

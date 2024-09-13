const crypto = require("crypto");
const base58 = require("bs58").default;
const EC = require('elliptic').ec; 
const ec = new EC('secp256k1'); // curva secp256k1

const max_ecdsa = BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141");
const Elliptic_Curve_secp256k1 = crypto.createECDH("secp256k1");

function entropia() {
  return crypto.randomBytes(32); // 128 bits entropia 
}

const valid_private_key = (n, b) => {
  const private_key = crypto.createHash("sha256").update(b, "utf-8").digest();
  const number_private_key = BigInt("0x" + private_key.toString("hex"));
  if (1n <= number_private_key && number_private_key <= n) return private_key; // 1n perchè si utilizza numeri troppo grandi per rappresentare numeri in js e se si fa un controllo tra bigint o n esce un errore 
  else valid_private_key(n, entropia());
};

const private_key = valid_private_key(max_ecdsa, entropia());
const keyPair = ec.keyFromPrivate(private_key) // coppia di chiavi
const public_key = keyPair.getPublic('hex')

/*
  la public key con 04 prefisso significa che non è compressa con lunghezza 130 hex i primi
  due sono il prefisso, i succesivi 64 hex sono cordinata x e i rimanenti 64 hex sono y
  se ha 02 o 03 allora è compressa 02 sarebbe il prefisso che indica y è un valore pari 03 è un
  valore dispari 
*/

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

//  firma in formato DER
const derSign = signature.toDER('hex');
console.log(`firma tranazione: ${derSign}`);
console.log(keyPair.verify(private_key, derSign)); // verifica firma con chiave privata 

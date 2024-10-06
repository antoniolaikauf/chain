const crypto = require("crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // curva secp256k1

// controllo nonce
function controllo_nonce(nonce_transection, nonce_account) {
  return nonce_transection === nonce_account;
}

// controllo hash
function controllo_hash(data) {
  const data_hash = `${data.input.amount},${data.input.sender},${data.output.reciver},${data.nonce.nonce_transection},${data.timestamp}`;
  const hash = crypto.createHash("sha256").update(data_hash, "utf-8").digest("hex");
  return hash === data.TXid;
}

// controllo firma
function signature(nonce, public_key, sign) {
  const nonce_transection = Buffer.from(nonce.toString());
  const is_valid = ec.keyFromPublic(public_key, "hex").verify(nonce_transection, sign);
  return is_valid;
}

exports.verifica = { signature, controllo_hash, controllo_nonce };

const crypto = require("crypto");

let numbers = "";
for (let i = 0; i < 64; i++) {
  let chunk = crypto.randomInt(0, 4); // 0 a 3
  // ogni lancio genera 2 bit di entropia fino a raggiungere 128 bit di entropia
  // per calcolare entropia Math.log2(4) in 4 sarebbero tutti i possibili esiti da 0 a 3
  numbers = numbers.concat(chunk.toString(2).padStart(2, 0));
}

const hash = crypto.createHash("sha256");
hash.update(numbers);
const private_key = hash.copy().digest("hex");
console.log(private_key);

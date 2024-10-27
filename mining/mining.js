const miner = true; // impostato su true allora il nodo fara da miner 

if (require.main !== module) {
  exports.miner_set_up = miner;
}

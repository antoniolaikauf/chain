let Mempool = new Set();
const add_transection = (transection) => Mempool.add(transection);
exports.mempool = { Mempool, add_transection };

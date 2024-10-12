let Mempool = new Set();
function add_transection(transection) {
  Mempool.add(transection);
}
function sort_Mempool(transactions) {
  if (transactions.size <= 1) return transactions;
  const half = Math.floor(transactions.size / 2);
  const array_left = Array.from(transactions).slice(0, half);
  const array_right = Array.from(transactions).slice(half);
}
exports.mempool = { Mempool, add_transection, sort_Mempool };

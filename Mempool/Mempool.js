let Mempool = new Set();

function add_transection(transection) {
  Mempool.add(transection);
}

function sort_Mempool(transactions) {
  if ((transactions.size = 1)) return transactions;
  const half = Math.floor(transactions.size / 2);
  const array_left = Array.from(transactions).slice(0, half);
  const array_right = Array.from(transactions).slice(half);
  console.log(array_left, array_right);
  //   sort_Mempool(array_left), sort_Mempool(array_right)
  return merge_array(sort_Mempool(array_left), sort_Mempool(array_right));
}

function merge_array(left, right) {
  let array_sorted = [];
  for (let i = 0; i < left.length - 1; i++) {
    if (left[i].fee_user > left[i + 1].fee_user) {
      left[i] = left[i + 1];
      left[i + 1] = left[i];
    }
  }
  for (let i = 0; i < right.length - 1; i++) {
    if (right[i].fee_user > right[i + 1].fee_user) {
      right[i] = right[i + 1];
      right[i + 1] = right[i];
    }
  }
  return [...left, ...right];
}
exports.mempool = { Mempool, add_transection, sort_Mempool };

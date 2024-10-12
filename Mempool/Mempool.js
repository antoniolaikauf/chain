let Mempool = new Set();

function add_transection(transection) {
  Mempool.add(transection);
}

function merge_array(left, right) {
  let array_sorted = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex].fee_user > right[rightIndex].fee_user) {
      array_sorted.push(right[rightIndex]);
      rightIndex++;
    } else {
      array_sorted.push(left[leftIndex]);
      leftIndex++;
    }
  }
  const data = array_sorted.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
  return data;
}

function sort_Mempool(transactions) {
  let TRANSECTIONS = Array.from(transactions);
  if (TRANSECTIONS.length === 1) {
    return transactions;
  }
  const half = Math.floor(TRANSECTIONS.length / 2);
  const array_left = TRANSECTIONS.slice(0, half);
  const array_right = TRANSECTIONS.slice(half);
  return merge_array(sort_Mempool(array_left), sort_Mempool(array_right));
}

exports.mempool = { Mempool, add_transection, sort_Mempool };

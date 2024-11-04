let Mempool = new Set();
// aggiungere transazione a Mempool
function add_transection(transection) {
  Mempool.add(transection);
}
// riorganizzate per miners
function merge_array(left, right) {
  let array_sorted = [];
  let leftIndex = 0;
  let rightIndex = 0;
  while (leftIndex < left.length && rightIndex < right.length) {
    /* se elemento di array di sinistra è maggiore di elemento di array di destra
     elemento di destra va per primo essendo che è più piccolo se no elemento di sinistra va per primo 
    */
    if (left[leftIndex].fees > right[rightIndex].fees) {
      array_sorted.push(right[rightIndex]);
      rightIndex++;
    } else {
      array_sorted.push(left[leftIndex]);
      leftIndex++;
    }
  }
  console.log(array_sorted);
  
  /* 
  concatena il rimanente array  es [38] [27] il ciclo sopra ha aggiunto solo un numero e quindi bisogna aggiungere 
  anche i restanti numeri che avviene con concat
  */
  return array_sorted.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}
// dividi array fino a quando non diventa da un sigolo elemento
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

/*
come funziona algoritmo 
[38, 27, 43] and [3, 9, 82, 10]
[38] [27, 43] and [3, 9] [82, 10]
[38] [27] [43] and [3] [9] [82] [10]
*/

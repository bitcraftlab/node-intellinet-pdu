const pdu = require('../index.js');

function sleep(ms) {
  console.log(`Sleeping ${ms} ms`);
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function rotateRight(arr) {
  arr.unshift(arr.pop());
}

function rotateLeft(arr) {
  arr.push(arr.shift());
}

// walking light: activate only the 1st and 2nd outlet, then 2nd and 3rd etc.
(async () => {
  let a = [true, true, false, false, false, false, false, false];
  for(let i = 0; i < 8; i++) {
    pdu.allSet(a);
    await sleep(3000);
    rotateRight(a);
  }
  pdu.allSet(a);
})();

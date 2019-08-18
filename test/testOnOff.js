const pdu = require('../index.js');

function sleep(ms) {
  console.log(`Sleeping ${ms} ms`);
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}


(async () => {
  // spreading activation: activate the 1st outlet, then the 2nd etc.
  for(let i = 0; i < 8; i++) {
    pdu.on(i);
    await sleep(3000);
  }
  // spreading deactivation: deactivate the 1st outlet, then the 2nd etc.
  for(let i = 0; i < 8; i++) {
    pdu.off(i);
    await sleep(3000);
  }
})();

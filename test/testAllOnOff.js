const pdu = require('../index.js');

function sleep(ms) {
  console.log(`Sleeping ${ms} ms`);
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

// retrieve and print the PDU status
(async () => {
  pdu.allOn();
  await sleep(10000);
  pdu.allOff();
})();

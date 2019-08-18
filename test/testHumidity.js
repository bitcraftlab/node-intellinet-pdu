const pdu = require('../index.js');

// retrieve and print the PDU status
(async () => {
  h =  await pdu.getHumidity();
  console.log(`${h} % RH`);
})();

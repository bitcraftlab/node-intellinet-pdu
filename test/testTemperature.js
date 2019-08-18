const pdu = require('../index.js');

// retrieve and print the PDU status
(async () => {
  t =  await pdu.getTemperature();
  console.log(`${t} °C`);
})();

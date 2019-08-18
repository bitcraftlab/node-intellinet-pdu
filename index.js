// Default ID for the PDU
const pduHost = "192.168.0.100"

// Default Timeout
const timeOut = 250;

// XML parser to read PDU status
const parser = new require('xml2js').Parser({ explicitArray: false });

// Use fetch API to control the PDU via HTTP
const nodeFetch = require('node-fetch');

// Timeout for fetch
const AbortController = require('abort-controller');

// Fetch with timeout and basic error handling
async function fetch(url) {

  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeOut);

  return await nodeFetch(url, { signal: controller.signal }).catch(err => {
    switch (err.type) {
      case 'aborted':
        console.error(`PDU time out.`);
        break;
      case 'system':
        switch (err.errno) {
          case 'EHOSTDOWN':
            console.error(`PDU not available at ${pduHost}.`);
            break;
          case 'ENETUNREACH':
            console.error(`Network not available.`);
            break;
          default:
            console.log(err);
        }
        break;
    };
  });
}

// asynchronous xml2json
async function xml2json(xml) {
  return await new Promise((resolve, reject) => {
    parser.parseString(xml, function(err, result) {
      err ? reject(err) : resolve(result);
    })
  });
}

//const args = process.argv.slice(2);
//console.log("args");

async function on(outlet) {
  set(outlet, true);
}

async function off(outlet) {
  set(outlet, false);
}

// set outlet via HTTP
async function set(outlet, state) {
  console.log(`Turn Outlet ${outlet} ${state ? 'ON' : 'OFF'}`);
  const op = state ? 0 : 1;
  const url = `http://${pduHost}/control_outlet.htm?outlet${outlet}=1&op=${op}`;
  return await fetch(url);
}

async function allOn() {
  allSet(Array(8).fill(true));
}

async function allOff() {
  allSet(Array(8).fill(false));
}

async function allSet(a) {

  // construct query string to turn outlets on or off (based on s)
  async function allSetState(a, s) {
    const select = findIndices(a, s);
    if (select.length) {
      console.log(`Turn ${s ? 'on' : 'off'} ${select.join(', ')}`);
      // select outlets
      const query = select.map(i => `outlet${i}=1`);
      // operator: turn outlets either off or on
      query.push(`op=${s ? '0': '1'}`);
      // construct the query
      const url = `http://${pduHost}/control_outlet.htm?${query.join('&')}`;
      // send it to the PDU
      return await fetch(url);
    }
  }

  // activate outlets which are set to true
  await allSetState(a, true);
  // deactivate outlets which are set to false
  await allSetState(a, false);

}

async function getStatus() {
  // console.log(`Get PDU Status from ${pduHost}`);
  try {
    const url = `http://${pduHost}/status.xml`;
    const result = await fetch(url);
    const xml = await result.text();
    const json = await xml2json(xml);
    return json.response;
  } catch (err) {
    console.log(`Could not receive status from ${pduHost}.`);
  }
}

// get outlet states as boolean array
function getOutletArray(status) {
  const a = [];
  for (let i = 0; i < 8; i++) {
    a.push(status['outletStat' + i] === 'on');
  }
  return a;
}

// find indices of an array where a[i] === value
function findIndices(a, value) {
  return a.map((o, i) => (o === value) ? i : undefined).filter(x => x != undefined);
}

async function printStatus() {
  const status = await getStatus();
  if (status) {

    const {
      tempBan: temperature,
      humBan: humidity
    } = status;

    const a = getOutletArray(status);
    const off = findIndices(a, false).join(', ');
    const on = findIndices(a, true).join(', ');
    const outlets = a.map((o, i) => `${i}: ${o ? 'ON' : 'OFF'}`).join('\n  ');

    console.log(
      `
Temperature: ${temperature} °C
Humidity:    ${humidity} %

Turned On:   ${on || 'none'}.
Turned Off:  ${off || 'none'}.

Outlets:

  ${outlets}
`
    );

  }
}

async function getTemperature() {
  return (await this.getStatus()).tempBan;
}

async function getHumidity() {
  return (await this.getStatus()).humBan;
}

async function setDelay(outlet, onDelay, offDelay) {
  console.log(`Set Switch delay for Outlet ${outlet}`);
}

module.exports = {
  on,
  off,
  set,
  allOn,
  allOff,
  allSet,
  getStatus,
  printStatus,
  getTemperature,
  getHumidity
};

const { handle } = require('D:/Knative/functions/device-mqtt/index.js');
handle({
  method: 'POST',
  body: {
    action: 'insertPermission',
    uuid: '30eda0e187c8',
    data: [{id: '124121', type: 101, code: '12345678', index: '01', time: {type: 0}}]
  } 
}).then(r => console.log('Result:', r)).catch(e => console.error('Error:', e));

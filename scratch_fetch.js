const https = require('https');
https.get('https://appv1.fieldseasy.com/frigate/api/version', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', e => console.error(e));

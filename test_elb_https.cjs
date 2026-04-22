const axios = require('axios');
const https = require('https');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

axios.post('https://a72c1c5573e5e4c6a94a480cb06d4975-cfda4a7390847d92.elb.ap-south-1.amazonaws.com/kn/google-accesseasy', { type: 'google' }, {
  headers: {
    Host: 'privateapp.senzr.in'
  },
  httpsAgent: agent
})
  .then(res => console.log('HTTPS ELB SUCCESS:', res.status))
  .catch(err => {
    console.log('HTTPS ELB ERROR:', err.response?.status, err.response?.statusText);
  });

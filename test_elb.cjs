const axios = require('axios');
const http = require('http');

axios.post('http://a72c1c5573e5e4c6a94a480cb06d4975-cfda4a7390847d92.elb.ap-south-1.amazonaws.com/kn/google-accesseasy', { type: 'google' }, {
  headers: {
    Host: 'privateapp.senzr.in'
  }
})
  .then(res => console.log('SUCCESS directly to ELB:', res.status))
  .catch(err => {
    console.log('ERROR ELB:', err.response?.status, err.response?.statusText);
  });

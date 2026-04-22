const axios = require('axios');
axios.post('https://privateapp.senzr.in/kn/google-authentication', { type: 'google' })
  .then(res => console.log('google-auth SUCCESS:', res.status))
  .catch(err => console.log('google-auth ERROR:', err.response?.status));

axios.post('https://privateapp.senzr.in/kn/send-otp-accesseasy', {})
  .then(res => console.log('send-otp-accesseasy SUCCESS:', res.status))
  .catch(err => console.log('send-otp-accesseasy ERROR:', err.response?.status));

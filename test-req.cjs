const axios = require('axios');
axios.post('https://privateapp.senzr.in/kn/google-accesseasy', { type: 'google' })
  .then(res => console.log('SUCCESS:', res.status, res.data))
  .catch(err => console.log('ERROR:', err.response ? err.response.status : err.message));

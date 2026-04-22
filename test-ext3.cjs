const axios = require('axios');
axios.post('https://privateapp.senzr.in/kn/google-accesseasy', { type: 'google' })
  .then(res => console.log('SUCCESS:', res.status, res.headers))
  .catch(err => {
    if (err.response) {
      console.log('ERROR:', err.response.status, err.response.statusText);
      console.log('HEADERS:', err.response.headers);
      console.log('DATA:', err.response.data);
    } else {
      console.log('ERROR:', err.message);
    }
  });

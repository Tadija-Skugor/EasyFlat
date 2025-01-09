const dotenv = require('dotenv');
dotenv.config(); 

const parseApiKeys = () => {
  const apiKeys = {};

  Object.keys(process.env).forEach((key) => {
    if (key.startsWith('API_KEY')) {
      const apiKey = process.env[key]; // Take the entire value of the key
      apiKeys[apiKey] = {}; // Optional: Add extra metadata if needed
    }
  });

  return apiKeys;
};

const apiKeys = parseApiKeys();

module.exports = apiKeys;

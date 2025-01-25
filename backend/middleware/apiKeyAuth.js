const apiKeys = require('./apiKeys');

const apiKeyAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']; // Get the Authorization header

  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }

  // Split the Authorization header into type and key
  const [type, apiKey] = authHeader.split(' ');

  if (type !== 'ApiKey' || !apiKeys[apiKey]) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Optionally attach key info for downstream middleware or routes
  req.apiKeyInfo = { apiKey };
  next();
};

module.exports = apiKeyAuth;

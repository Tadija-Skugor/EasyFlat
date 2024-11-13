// routes/OAuthAuthorize.js
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const dotenv = require('dotenv');

dotenv.config();

class OAuthAuthorize {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post('/', this.handleAuthorization.bind(this));
  }

  async handleAuthorization(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
    res.header('Referrer-Policy', 'no-referrer-when-downgrade');

    const redirectUrl = 'http://localhost:4000/oauth';

    const oAuth2Client = new OAuth2Client(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      redirectUrl
    );

    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
      prompt: 'consent'
    });

    res.json({ url: authorizeUrl });
  }
}

module.exports = new OAuthAuthorize().router;

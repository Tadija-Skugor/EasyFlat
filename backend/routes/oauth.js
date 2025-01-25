// routes/OAuthRoutes.js
const express = require('express');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const pool = require('../db');
const { runInNewContext } = require('vm');

dotenv.config();

class OAuthRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  async getUserData(accessToken) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
    return response.json();
  }

  async getEmailStatusInDatabase(email) {
    const result = await pool.query('SELECT aktivan FROM korisnik WHERE email = $1', [email]);
    return result.rows.length > 0 ? result.rows[0].aktivan : null;
  }
  async getStanBr(email) {
    const result = await pool.query('SELECT stan_id FROM korisnik WHERE email = $1', [email]);
    return result.rows.length > 0 ? result.rows[0].stan_id  : null;
  }
  async getZgradaBr(email) {
    console.log("Doslo je do OATUH I GLEDA QUERY ZA EMAIL----------------------------------------------", email)
    const result = await pool.query('SELECT zgrada_id FROM korisnik WHERE email = $1', [email]);
    console.log(result)
    return result.rows.length > 0 ? result.rows[0].zgrada_id  : null;
  }
  // OAuth route handler
  async handleOAuth(req, res) {
    const code = req.query.code;
    console.log("Authorization code received: ", code);

    try {
      const redirectUrl = 'https://be30c39fc6db.ngrok.app/oauth';
      const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        redirectUrl
      );

      const tokenResponse = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokenResponse.tokens);
      console.log('Token received:', tokenResponse.tokens);

      const userData = await this.getUserData(tokenResponse.tokens.access_token);
      console.log('User data:', userData);
      // Store user data
      req.session.userId = userData.sub;
      req.session.userName = userData.name;
      req.session.ime = userData.given_name;
      req.session.prezime = userData.family_name;
      req.session.picture = userData.picture;
      req.session.email = userData.email;
      req.session.stanBr= await this.getStanBr(userData.email);
      req.session.zgrada_id= await this.getZgradaBr(userData.email);

      console.log("ovo je u oauth"+ req.session.stanBr);
      const emailStatus = await this.getEmailStatusInDatabase(userData.email);

      if (emailStatus === true) {
        res.redirect('https://easyflat.eu.ngrok.io/main'); 
      } else if (emailStatus === false) {
        req.session.destroy((err) => {
          if (err) {
            console.error("Error destroying session:", err);
          }
          res.status(400).send(`
            <html>
              <head>
                <style>
                  body {
                    background-color: #f4f4f9;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .container {
                    background-color: #ffffff;
                    padding: 30px;
                    border-radius: 10px;
                    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 600px;
                    width: 100%;
                  }
                  h1 {
                    color: #e74c3c;
                    font-size: 24px;
                  }
                  p {
                    color: #555;
                    font-size: 16px;
                    margin-bottom: 20px;
                  }
                  button {
                    background-color: #4CAF50;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                  }
                  button:hover {
                    background-color: #45a049;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>Već ste poslali zahtijev za pristup ovoj email adresi.</h1>
                  <p>Moći ćete pristupiti sustavu kada vas Administrator mreže odbori.</p>
                  <button onclick="window.location.href='https://easyflat.eu.ngrok.io/main'">Go to Home</button>
                </div>
              </body>
            </html>
          `);
          
        });
      } else {
        res.redirect('https://easyflat.eu.ngrok.io/potvrda');
      }
    } catch (err) {
      console.error('Error during token exchange:', err);
      res.redirect('https://easyflat.eu.ngrok.io/error');
    }
  }

  initializeRoutes() {
    this.router.get('/', this.handleOAuth.bind(this));
  }
}

module.exports = new OAuthRoutes().router;

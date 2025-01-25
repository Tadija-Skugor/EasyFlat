// routes/AuthenticationRoutes.js
const express = require('express');
const pool = require('../db'); 

class AuthenticationRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  // Handler za autnetifikaciju emaila
  async checkAuthentication(req, res) {
    console.log("Checking authentication:");
    console.log(req.session.userId);

    if (req.session.userId) {
      // ako postoji provjeri sessiju
      if (!req.session.email) {
        return res.status(401).json({
          isAuthenticated: true,
          isEmailVerified: false,
          message: 'Email not found in session.'
        });
      }

      try {
        // Query ako su uvijeti ispunjeni
        const result = await pool.query(
          'SELECT * FROM korisnik WHERE email = $1 AND aktivan = true',
          [req.session.email]
        );

        if (result.rows.length > 0) {
          return res.json({ isAuthenticated: true, isEmailVerified: true });
        } else {
          return res.json({ isAuthenticated: true, isEmailVerified: false });
        }
      } catch (error) {
        console.error('Database error:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
    } else {
      return res.json({ isAuthenticated: false, isEmailVerified: false });
    }
  }

  initializeRoutes() {
    this.router.get('/', this.checkAuthentication.bind(this));
  }
}

module.exports = new AuthenticationRoutes().router;

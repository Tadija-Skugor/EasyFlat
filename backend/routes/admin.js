// routes/AdminRoutes.js
const express = require('express');
const pool = require('../db');

class AdminRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  async isAdmin(req, res, next) {
    try {
      const result = await pool.query(
        'SELECT * FROM korisnik WHERE email=$1 AND stan_id=0',
        [req.session.email]
      );
      if (result.rowCount > 0) {
        next();
      } else {
        res.status(403).send({ message: 'You do not have the permission to perform this action.' });
      }
    } catch (err) {
      console.error('Database error during admin check:', err);
      res.status(500).send({ message: 'Internal server error' });
    }
  }

  async getInactiveUsers(req, res) {
    try {
      const result = await pool.query(
        'SELECT ime, prezime, email, stan_id FROM korisnik WHERE aktivan=false'
      );
      res.json(result.rows);
    } catch (err) {
      console.error('Error reading data from database:', err);
      res.status(500).send({ message: 'Internal server error.' });
    }
  }

  async activateUser(req, res) {
    try {
      const updateQuery = await pool.query(
        'UPDATE korisnik SET aktivan = TRUE WHERE email=$1 RETURNING *',
        [req.body.email]
      );
      if (updateQuery.rows.length > 0) {
        res.json(updateQuery.rows[0]);
      } else {
        res.status(404).send({ message: 'User not found.' });
      }
    } catch (err) {
      console.error('Error updating database:', err);
      res.status(500).send({ message: 'Internal server error.' });
    }
  }

  initializeRoutes() {
    this.router.get('/inactiveUsers', this.isAdmin.bind(this), this.getInactiveUsers.bind(this));
    this.router.post('/activateUser', this.isAdmin.bind(this), this.activateUser.bind(this));
  }
}

// Export an instance of AdminRoutes
module.exports = new AdminRoutes().router;

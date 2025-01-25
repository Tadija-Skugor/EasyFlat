// routes/UserRoutes.js
const express = require('express');
const pool = require('../db');

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  isAuthenticated(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    return res.status(401).json({ message: 'Unauthorized: You must log in first.' });
  }

  getProtectedData(req, res) {
    res.json({
      message: 'This is protected data',
      user: {
        userId: req.session.userId,
        imeKorisnika: req.session.ime,
        prezimeKorisnika: req.session.prezime,
        userName: req.session.userName,
        email: req.session.email,
        picture: req.session.picture,
        stanBr:req.session.stanBr,
        zgradaId:req.session.zgradaId
      } 
    });
  }

  async additionalSignup(req, res) {
    const { firstName, lastName, email, apartmentNumber, building } = req.body;
  
    try {
  
      if (!firstName || !lastName || !email || !apartmentNumber || !building) {
        return res.status(400).json({ message: 'All fields are required.' });
      }
  
  
      const insertQuery = `
        INSERT INTO korisnik (ime, prezime, lozinka, email, stan_id, aktivan, zgrada_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (email) DO UPDATE SET
            ime = EXCLUDED.ime,
            prezime = EXCLUDED.prezime,
            lozinka = EXCLUDED.lozinka,
            stan_id = EXCLUDED.stan_id,
            aktivan = EXCLUDED.aktivan
        RETURNING *;
      `;
  
      const result = await pool.query(insertQuery, [
        firstName, 
        lastName, 
        'test',       // Placeholder for lozinka
        email, 
        apartmentNumber, 
        false,        // Default aktivan status
        building    // Use the building ID
      ]);
  
      console.log("Insert result:", result.rows[0]);
  
      req.session.ime = firstName;
      req.session.prezime = lastName;
      req.session.email = email;
      req.session.stanBr = apartmentNumber;
      req.session.zgradaId=building;
      res.json({
        message: 'User data successfully stored in the database.',
        user: result.rows[0]
      });
    } catch (error) {
      console.error("Error inserting data into database:", error);
      res.status(500).json({ message: 'Server error' });
    }
  }
  
  
  

  initializeRoutes() {
    this.router.get('/', this.isAuthenticated.bind(this), this.getProtectedData.bind(this));
    this.router.post('/additional-signup', this.additionalSignup.bind(this));
  }
}

module.exports = new UserRoutes().router;

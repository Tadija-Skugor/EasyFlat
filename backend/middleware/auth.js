// middleware/AuthMiddleware.js
const pool = require('../db');

class AuthMiddleware {
  constructor(pool) {
    this.pool = pool;
    this.isVerifiedUser = this.isVerifiedUser.bind(this); 
  }

  isAuthenticated(req, res, next) {
    console.log("Dosnlo je do autnetifikacije:-----------------------------------------");
    console.log(req.session.userId);
    if (req.session.userId) {
      next();
    } else {
      res.status(401).send({ message: 'You are not authenticated' });
    }
  }

  async isVerifiedUser(req, res, next) {
    console.log('Checking verification for email:', req.session.email);
    if (!req.session.email) {
      return res.status(401).send({ message: 'No email found in session' });
    }

    try {
      const result = await this.pool.query(
        'SELECT * FROM korisnik WHERE email = $1 AND aktivan = true',
        [req.session.email]
      );

      console.log('Database result:', result);

      if (result.rows.length > 0) {
        next();
      } else {
        res.status(403).send({ message: 'User is not verified or inactive' });
      }
    } catch (error) {
      console.error('Database error during email verification:', error);
      res.status(500).send({ message: 'Internal server error' });
    }
  }
}


const authMiddleware = new AuthMiddleware(pool); 

module.exports = authMiddleware;

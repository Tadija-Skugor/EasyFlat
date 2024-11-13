// routes/LogoutRoutes.js
const express = require('express');

class LogoutRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }
  handleLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('Nema logouta.');
      }
      // Clear session cookie
      res.clearCookie('connect.sid'); 
      //res.clearCookie('ime za backend ako cemo imati'); 
      res.send('Logged out successfully.'); 
    });
  }

  initializeRoutes() {
    this.router.post('/', this.handleLogout.bind(this));
  }
}

module.exports = new LogoutRoutes().router;

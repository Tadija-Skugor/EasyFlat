// routes/DiscussionRoutes.js
const express = require('express');
const pool = require('../db'); // Import your database connection

class DiscussionRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  // Method to fetch recent discussions
  async fetchAllDiscussions(req, res) {
    try {
      // Get the number of discussions to fetch from the request body or default to 10
      const brojZatrazenihDiskusija = req.body.brojZatrazenihDiskusija || 10;

      // Query to get recent discussions
      const result = await pool.query(
        'SELECT id, naslov, kreator, opis, datum, br_odgovora, id_forme FROM diskusija ORDER BY datum DESC LIMIT $1;',
        [brojZatrazenihDiskusija]
      );

      // Create and populate the discussion list
      const discussionList = await Promise.all(result.rows.map(async (row) => {
        const discussion = {
          id: row.id,
          naslov: row.naslov,
          kreator: row.kreator,
          opis: row.opis,
          datum: row.datum,
          br_odgovora: row.br_odgovora,
        };

        // If the discussion has a form associated with it, fetch form details
        if (row.id_forme !== null) {
          const formResult = await pool.query(
            'SELECT id, naslov, glasova_da, glasova_ne, datum_isteklo FROM glasanje_forma WHERE id = $1',
            [row.id_forme]
          );
          discussion.forma = formResult.rows[0];
        }

        return discussion;
      }));

      // Send the discussion list as a JSON response
      res.json(discussionList);
    } catch (error) {
      console.error("Error in /allDiscussions:", error.message);
      res.status(500).send('Server Error');
    }
  }

  // Initialize routes
  initializeRoutes() {
    this.router.get('/allDiscussions', this.fetchAllDiscussions.bind(this));
  }
}

// Export an instance of DiscussionRoutes
module.exports = new DiscussionRoutes().router;

const express = require('express');
const pool = require('../db'); // Uvezi svoju vezu na bazu podataka

class ArchiveManager {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  async checkforArchiving() {         //funkcija koja se izvrsava jednom na dan i prebacuje stare diskusije u arhivu
    try {
      const result = await pool.query(`DELETE FROM diskusija WHERE zadnji_pristup <= CURRENT_DATE - INTERVAL '30 days' RETURNING *`);

      result.rows.map(async (row) => {
        
        // Ako diskusija ima povezanu formu, dohvatite detalje forme
        if (row.id_forme !== null) {
          const formResult = await pool.query(
            'SELECT * FROM glasanje_forma WHERE id = $1',
            [row.id_forme]
          );
          await pool.query('DELETE from glasanje_forma WHERE glasanje_forma.id = $1', [row.id_forme])
          await pool.query('DELETE from glasanje WHERE glasanje.id_forme = $1', [row.id_forme])
          await pool.query('INSERT INTO arhiva VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', 
          [row.id, row.naslov, row.opis, row.kreator, row.datum_stvorena, row.odgovori,
            formResult.rows[0].naslov, formResult.rows[0].glasovanje_da, formResult.rows[0].glasovanje_ne])
        }
        else{
          await pool.query('INSERT INTO arhiva VALUES ($1, $2, $3, $4, $5, $6)', 
          [row.id, row.naslov, row.opis, row.kreator, row.datum_stvorena, row.odgovori])
        }
      });
      

    } catch (err) {
      console.error('Error executing query for archiving:', err.message);
    }
    
  }

  async getAllArchived(req, res) {
    console.log("iz get /archive")      //funkcija za dohvat svih (ili prvih 10 kako vec) diskusija iz arhive
  }

  async getArchived(req, res){        //funkcija za dohvat svih podataka specificne diskusije iz arhive
    console.log("iz post /archive")
  }

  initializeRoutes() {
    this.router.get('/', this.getAllArchived.bind(this));
    this.router.post('/', this.getArchived.bind(this));
  }
}


module.exports = new ArchiveManager()
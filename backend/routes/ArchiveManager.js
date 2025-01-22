const express = require('express');
const pool = require('../db'); // Uvezi svoju vezu na bazu podataka

class ArchiveManager {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  async checkforArchiving() {         // funkcija koja se izvrsava jednom na dan i prebacuje stare diskusije u arhivu
    try {
      const result = await pool.query(`DELETE FROM diskusija WHERE zadnji_pristup <= CURRENT_TIMESTAMP - INTERVAL '30 days' RETURNING *`);

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

  async getAllArchived(req, res) { // funkcija za dohvat diskusija iz arhive
    console.log("iz get /archive/allArchived")    

    try {
      // broj diskusija za dohvatiti iz arhive ili default 10
      const brojZatrazenihDiskusija = req.query.brojZatrazenihDiskusija || 10;

      const result = await pool.query(
        'SELECT id, naslov, opis, kreator, datum_stvorena, naslov_glasanja, glasovi_da, glasovi_ne FROM arhiva ORDER BY datum_stvorena DESC LIMIT $1;',
        [brojZatrazenihDiskusija]
      );

      // lista svih diskusija iz arhive
      const discussionList = await Promise.all(result.rows.map(async (row) => {
        const kreator = await pool.query('SELECT ime, prezime FROM korisnik where email = $1', [row.kreator]);
        if (kreator.rowCount > 0){
          var user = kreator.rows[0].ime + " " + kreator.rows[0].prezime;
        }
        else{
          var user = row.kreator;
        }
        const discussion = {
          id: row.id,
          naslov: row.naslov,
          opis: row.opis,
          kreator: user,
          datum_stvorena: row.datum_stvorena,
        };

        // samo da diskusije koje imaju povezano glasanje se salju ovi atributi 
        if (row.naslov_glasanja !== null) {
          discussion.naslov_glasanja = row.naslov_glasanja;
          discussion.glasovi_da = row.glasovi_da;
          discussion.glasovi_ne = row.glasovi_ne;
        }

        return discussion;
      }));

      // slanje liste diskusija 
      res.json(discussionList);
    } catch (error) {
      console.error("Greška u /archive/allArchived:", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  async getArchived(req, res){        // funkcija za dohvat odgovora diskusije zadanog id-a iz arhive
    console.log("iz get /archive/archivedResponses")

    try {
      const id_diskusije = req.query.id_diskusije;
      
      const result = await pool.query(
        'SELECT odgovori FROM arhiva WHERE id=$1;', [id_diskusije]
      );

      if (result.rows[0]) {
        const odgovori = result.rows[0].odgovori;
        res.json({odgovori: odgovori});
      } else {
        res.json('Polje odgovora je prazno');
      }
      
    } catch (error) {
      console.error("Greška u /archive/archivedResponses", error.message);
      res.status(500).send('Greška na serveru');
    }
  
  }

  initializeRoutes() {
    this.router.get('/allArchived', this.getAllArchived.bind(this));
    this.router.get('/archivedResponses', this.getArchived.bind(this));
  }
}


module.exports = new ArchiveManager()
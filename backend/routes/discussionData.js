// routes/DiscussionRoutes.js
const express = require('express');
const pool = require('../db'); // Uvezi svoju vezu na bazu podataka
const js2xmlparser = require('js2xmlparser');

class DiscussionRoutes {
  constructor() {
    this.router = express.Router();
    this.initializeRoutes();
  }

  // Metoda za dohvaćanje nedavnih diskusija
  async fetchAllDiscussions(req, res) {
    try {
      // Dobij broj diskusija za dohvatiti iz tijela zahtjeva ili zadano postavi na 10
      const brojZatrazenihDiskusija = req.query.brojZatrazenihDiskusija || 10;

      // Upit za dohvaćanje nedavnih diskusija
      const result = await pool.query(
        'SELECT id, naslov, kreator, opis, datum, br_odgovora, id_forme FROM diskusija ORDER BY datum DESC LIMIT $1;',
        [brojZatrazenihDiskusija]
      );

      // Kreiraj i popuni listu diskusija
      const discussionList = await Promise.all(result.rows.map(async (row) => {
        const discussion = {
          id: row.id,
          naslov: row.naslov,
          kreator: row.kreator,
          opis: row.opis,
          datum: row.datum,
          br_odgovora: row.br_odgovora,
        };

        // Ako diskusija ima povezanu formu, dohvatite detalje forme
        if (row.id_forme !== null) {
          const formResult = await pool.query(
            'SELECT id, naslov, glasova_da, glasova_ne, datum_isteklo FROM glasanje_forma WHERE id = $1',
            [row.id_forme]
          );
          discussion.forma = formResult.rows[0];
        }

        return discussion;
      }));

      // Pošaljite listu diskusija kao JSON odgovor
      res.json(discussionList);
    } catch (error) {
      console.error("Greška u /data/allDiscussions:", error.message);
      res.status(500).send('Greška na serveru');
    }
  }


  // Metoda za dohvacanje svih odgovora neke diskusije
  async fetchDiscussionResponses(req, res) {
    try {
      
    } catch (error) {
      console.error("Greška u /data/discussionResponses:", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  // Metoda za dodavanje odgovora na neku diskusiju
  async sendDiscussionResponse(req, res) {
    try {
      const {id_diskusije, korisnik, tekst} = req.body;

      const jsonData = {
          korisnik,
          tekst
      };

      // JSON u XML format
      const xmlData = js2xmlparser.parse("odgovor", jsonData);

      // spremanje XML u bazu
      const rows = await pool.query(
        'SELECT odgovori FROM diskusija WHERE id = $1', [id_diskusije]
      );

      let updatedOdgovori;
      if (rows[0] && rows[0].odgovori) {
        //console.log(rows[0].odgovori)
        updatedOdgovori = rows[0].odgovori + xmlData;
        //console.log(updatedOdgovori)
      } else {
        updatedOdgovori = xmlData;
      }

      await pool.query(
        'UPDATE diskusija SET odgovori = $1 WHERE id = $2', [updatedOdgovori, id_diskusije]
      );
      
      // možda stavit drugi response
      res.set('Content-Type', 'application/xml');
      res.send(xmlData); 
      
    } catch (error) {
      console.error("Greška u /data/discussionAddResponse:", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  // Inicijaliziraj rute
  initializeRoutes() {
    this.router.get('/allDiscussions', this.fetchAllDiscussions.bind(this));
    this.router.get('/discussionResponses', this.fetchDiscussionResponses.bind(this));
    this.router.get('/discussionAddResponse', this.sendDiscussionResponse.bind(this));
  }
}

// Izvezi instancu DiscussionRoutes
module.exports = new DiscussionRoutes().router;

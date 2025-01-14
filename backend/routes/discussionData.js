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
        'SELECT id, naslov, kreator, opis, datum_stvorena, br_odgovora, id_forme FROM diskusija ORDER BY datum_stvorena DESC LIMIT $1;',
        [brojZatrazenihDiskusija]
      );

      // Kreiraj i popuni listu diskusija
      const discussionList = await Promise.all(result.rows.map(async (row) => {
        const discussion = {
          id: row.id,
          naslov: row.naslov,
          kreator: row.kreator,
          opis: row.opis,
          datum_stvorena: row.datum_stvorena,
          br_odgovora: row.br_odgovora,
        };

        // Ako diskusija ima povezanu formu, dohvatite detalje forme
        if (row.id_forme !== null) {
          const formResult = await pool.query(
            'SELECT id, naslov, glasovanje_da, glasovanje_ne, datum_stvoreno, datum_istece, kreator FROM glasanje_forma WHERE id = $1',
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

  // Metoda za dohvacaje specificnih diskusija (onih koje se poklapaju sa searchom)
  async specificDiscussions(req, res) {
    try {
      console.log("Pokusavam dohvatit rutu specificDiscussions");

      const search_query = req.query.search_query;
      let keyWords = [];
      if (search_query) {
        keyWords = search_query.split("%20");
      }

      console.log("Split keywords:\n", keyWords);
      // Dynamically build the WHERE clause
      const whereClauses = keyWords.map(keyword => `naslov ILIKE '%${keyword}%'`).join(' OR ');
      console.log(whereClauses);

      const query = `
        SELECT id, naslov, kreator, opis, datum_stvorena, br_odgovora, id_forme
        FROM diskusija
        WHERE ${whereClauses}
        ORDER BY datum_stvorena DESC
        LIMIT 10;`;

      // Upit za dohvaćanje nedavnih diskusija
      const result = await pool.query(query);

      // Kreiraj i popuni listu diskusija
      const discussionList = await Promise.all(result.rows.map(async (row) => {
        const discussion = {
          id: row.id,
          naslov: row.naslov,
          kreator: row.kreator,
          opis: row.opis,
          datum_stvorena: row.datum_stvorena,
          br_odgovora: row.br_odgovora,
        };

        // Ako diskusija ima povezanu formu, dohvatite detalje forme
        if (row.id_forme !== null) {
          const formResult = await pool.query(
            'SELECT id, naslov, glasovanje_da, glasovanje_ne, datum_stvoreno, datum_istece, kreator FROM glasanje_forma WHERE id = $1',
            [row.id_forme]
          );
          discussion.forma = formResult.rows[0];
        }

        return discussion;
      }));
      
      res.status(200).json(discussionList);

    } catch (error) {
      console.error("Greška u /data/specificDiscussions", error.message);
      res.status(500).send('Greška na serveru');

    } 
  }

  // Metoda za dohvacanje svih odgovora neke diskusije
  async fetchDiscussionResponses(req, res) {
    try {
      const id_diskusije = req.query.id_diskusije;
      
      const result = await pool.query(
        'SELECT odgovori FROM diskusija WHERE id=$1;', [id_diskusije]
      );

      if (result.rows[0]) {
        const odgovori = result.rows[0].odgovori;
        res.json(odgovori);
      } else {
        res.json('Polje odgovora je prazno');
      }
      
    } catch (error) {
      console.error("Greška u /data/discussionResponses", error.message);
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
      const xmlData = js2xmlparser.parse("odgovor", jsonData, { declaration: { include: false } });

      // spremanje XML u bazu
      const result = await pool.query(
        'SELECT odgovori FROM diskusija WHERE id = $1', [id_diskusije]
      );

      let rows = result.rows;

      let updatedOdgovori;
      if (rows[0] && rows[0].odgovori) {
        updatedOdgovori = rows[0].odgovori + xmlData;
      } else {
        updatedOdgovori = xmlData;
      }

      const currentDate = new Date().toISOString().split('T')[0];

      await pool.query(
        'UPDATE diskusija SET odgovori = $1, zadnji_pristup = $3 WHERE id = $2', [updatedOdgovori, id_diskusije, currentDate]
      );
      
      // možda stavit drugi response
      res.set('Content-Type', 'application/xml');
      res.send(xmlData); 

    } catch (error) {
      console.error("Greška u /data/discussionAddResponse", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  // Metoda za dodavanje diskusije
  async addNewDiscussion(req, res) {
    try{
      // Dohvati podatke.
      let {naslov,  opis, br_odgovora, id_forme} = req.body;
      const KreatorEmail = req.session.email;
      const datum_stvorena = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS
     
      // Verificiraj podatke.
      if (!naslov) { //ostali mogu biti null
        console.log("Greska pri verifikaciji podataka");
        return res.status(400).json({ message: 'All fields are required.' });
      }

      console.log("Primljen zahtjev za dodavanje diskusije");
      console.log("    naslov: ", naslov);
      console.log("    opis: ", opis);
      console.log("    br_odgovora: ", br_odgovora);
      console.log("    id_forme: ", id_forme);
      console.log("    datum_stvorena: ", datum_stvorena);
      console.log("    zadnji_pristup: ", datum_stvorena);
      console.log("    kreator: ", KreatorEmail);


      // Upisi novu diskusiju u bazu.
      const query = `
        INSERT INTO diskusija (naslov, opis, kreator, datum_stvorena, zadnji_pristup, br_odgovora, odgovori, id_forme)
        VALUES ($1, $2, $3, $4, $5, $6, NULL, $7)
        RETURNING id
      `;

      const result = await pool.query(query, [naslov, opis, KreatorEmail, datum_stvorena, datum_stvorena, br_odgovora, id_forme]);
      const id = result.rows[0].id;

      // Posalji response.
      res.status(201).json({
        success: true,
        newDiscussion : {
            id: id,
            naslov: naslov,
            opis: opis,
            kreator: KreatorEmail,
            br_odgovora: br_odgovora,
            id_forme: id_forme,
            datum_stvorena: datum_stvorena,
            zadnji_pristup: datum_stvorena,
        }
      });
    } catch (error) {

      console.error("Greška u /data/addNewDiscussion", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  // Metoda za dodavanje glasanja diskusiji.
  async bindNewForm(req, res) {
    try {
      // Dohvati podatke za glasanje.
      let { naslov, opis, datum_istece, id_diskusije } = req.body;  
      const KreatorEmail = req.session.email;  
      const result = await pool.query(
        'SELECT ime FROM korisnik WHERE email = $1', [KreatorEmail]
      );
      const Kreator = result.rows[0].ime;

      console.log("primljen zahtjev za dodavanje glasabha diskuciji sa parametrima:");
      console.log("    naslov: ", naslov);
      console.log("    opis: ", opis);              // Ovo bi mogao biti nepotreban podatak posto trenutno ne spremamo takvo nesto u bazu.
      console.log("    datum_istece: ", datum_istece);
      console.log("    id_diskusije: ", id_diskusije);
      console.log("    Kreator: ", Kreator);

      // Verificiraj dohvacene podatke.
      if (!naslov || !opis || !datum_istece || !Kreator || !id_diskusije) {
        console.log("Greska pri verifikaciji podataka");
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const datumStvoreno = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS
      
      // Dodaj glasanje u bazu.
      const query = `
        INSERT INTO glasanje_forma (datum_stvoreno, datum_istece, glasovanje_da, glasovanje_ne, naslov, kreator)
        VALUES ($1, $2, 0, 0, $3, $4)
        RETURNING id
      `;

      const result2 = await pool.query(query, [datumStvoreno, datum_istece, naslov, Kreator]);
      const idGlasanja = result2.rows[0].id;

      console.log("Glasanje inserted successfully; id = ", idGlasanja);

      // Zapisi id glasanja u diskusiju.
      await pool.query('UPDATE diskusija SET id_forme = $1 WHERE id = $2', [idGlasanja, id_diskusije]);
      
      console.log("Diskusija i glasanje povezani");
      res.status(201).json({
        success: true,
        newGlasanje: {
            id: idGlasanja,  
            naslov: naslov,
            opis: opis,
            datum_istece: datum_istece,
            kreator: Kreator,
        },
    });
    } catch (error) {

      console.error("Greška u /data/bindNewForm", error.message);
      res.status(500).send('Greška na serveru');
    }
  }

  // Inicijaliziraj rute
  initializeRoutes() {
    this.router.get('/allDiscussions', this.fetchAllDiscussions.bind(this));
    this.router.get('/specificDiscussions', this.specificDiscussions.bind(this));
    this.router.get('/discussionResponses', this.fetchDiscussionResponses.bind(this));
    this.router.post('/discussionAddResponse', this.sendDiscussionResponse.bind(this));
    this.router.post('/bindNewForm', this.bindNewForm.bind(this));
    this.router.post('/addNewDiscussion', this.addNewDiscussion.bind(this));
  }
}



// Izvezi instancu DiscussionRoutes
module.exports = new DiscussionRoutes().router;

// routes/ucitavanjePoruka.js
const express = require('express');
const pool = require('../db'); 

class SlanjePoruka {
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getUserData.bind(this)); 
        this.router.get('/provjera', this.checkStatus.bind(this)); 
        this.router.post('/obrisiRazgovor', this.obrisiRazgovor.bind(this));

    }



    async obrisiRazgovor(req, res) {
        try {
            const { naslov, tekst } = req.body;
    
            const result = await pool.query(
                'UPDATE upit SET rjeseno = true WHERE emailosobe = $1 AND tekst=$2  RETURNING *',
                [naslov, tekst]
            );
    
            res.status(200).json({ message: "delrtd", deletedMessage: result.rows[0] });
    
        } catch (error) {
            console.error('Error deleting poruka:', error);
            res.status(500).json({ message: 'Server se kuha.' });
        }
    }
    

    async getUserData(req, res) {
        try {
            const result = await pool.query(
                'SELECT emailosobe, tekst FROM upit WHERE rjeseno = false AND zgrada_id=$1',[req.session.zgrada_id]
            );
            console.log("nesto se vrti");

            console.log('Unresolved messages:', result.rows);

            const messages = result.rows.map((row) => ({
                senderEmail: row.emailosobe,
                messageText: row.tekst,
            }));

            res.status(200).json(messages);
        } catch (error) {
            console.error('Error fetching message data from database:', error);
            res.status(500).json({ error: 'Failed to fetch messages from the database' });
        }
    }

    checkStatus(req, res) {
        console.log("Provjera route hit");
        res.status(200).send('This is the response from the /poruke/provjera route!');
    }
}

module.exports = new SlanjePoruka().router;  
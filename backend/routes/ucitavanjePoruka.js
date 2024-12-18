// routes/ucitavanjePoruka.js
const express = require('express');
const pool = require('../db'); 

class SlanjePoruka {
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.getUserData.bind(this)); 
        this.router.get('/provjera', this.checkStatus.bind(this)); 
    }

    async getUserData(req, res) {
        try {
            const result = await pool.query(
                'SELECT emailosobe, tekst FROM upit WHERE rjeseno = false'
            );
            console.log("nesto se vrti");

            if (result.rows.length === 0) {
                console.log('No unresolved messages found in the database.');
                return res.status(200).json([]); 
            }

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
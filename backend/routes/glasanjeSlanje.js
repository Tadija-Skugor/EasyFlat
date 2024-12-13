const express = require('express');
const pool = require('../db'); // Koristiš pool za spajanje na bazu podataka
const router = express.Router();

// Ruta za dobivanje e-maila korisnika iz sesije
router.get('/userEmail', (req, res) => {
    if (req.session && req.session.email) {
        res.json({ email: req.session.email });
    } else {
        res.status(400).json({ message: 'User is not authenticated' });
    }
});

// Ruta za dohvaćanje svih diskusija
router.get('/discussions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glasanje_forma');
        res.json(result.rows);  // Vraćanje svih diskusija
    } catch (error) {
        console.error('Error fetching discussions:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta za provjeru je li korisnik već glasao
router.get('/userVote', async (req, res) => {
    const { email, discussionId } = req.query;

    if (!email || !discussionId) {
        return res.status(400).json({ message: 'Email and discussionId are required' });
    }

    try {
        const result = await pool.query(
            'SELECT odgovor FROM glasanje WHERE mail_glasaca = $1 AND id_forme = $2',
            [email, discussionId]
        );
        
        if (result.rows.length > 0) {
            res.json({ voted: true, vote: result.rows[0].odgovor });
        } else {
            res.json({ voted: false });
        }
    } catch (error) {
        console.error('Error checking user vote:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', async (req, res) => {
    let { userId, discussionId, vote } = req.body; // Use 'let' instead of 'const' to allow reassignment
    console.log("Vrijednost vota je: " + vote);

    if (vote === "da") {
        vote = "yes";
    } else {
        vote = "no";
    }
    console.log("Vrijednost vota je: " + vote);

    if (!userId || !discussionId || !vote) {
        return res.status(400).send('Svi podaci (userId, discussionId, vote) moraju biti prisutni');
    }

    try {
        const result = await pool.query(
            'SELECT * FROM glasanje WHERE mail_glasaca = $1 AND id_forme = $2',
            [userId, discussionId]
        );

        if (result.rows.length > 0) {
            return res.status(400).send('Već ste glasovali za ovu diskusiju');
        }

        await pool.query(
            'INSERT INTO glasanje (id_forme, mail_glasaca, odgovor) VALUES ($1, $2, $3)',
            [discussionId, userId, vote]
        );

        if (vote === 'yes') {
            await pool.query(
                'UPDATE glasanje_forma SET glasovanje_da = glasovanje_da + 1 WHERE id = $1',
                [discussionId]
            );
        } else if (vote === 'no') {
            await pool.query(
                'UPDATE glasanje_forma SET glasovanje_ne = glasovanje_ne + 1 WHERE id = $1',
                [discussionId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).send('Server error');
    }
});


module.exports = router;

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

router.get('/Glasanjes', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM glasanje_forma gf 
             WHERE NOT EXISTS (SELECT 1 FROM diskusija d WHERE d.id_forme = gf.id)
             AND CURRENT_DATE <= gf.datum_istece 
             AND gf.zgrada_id = $1;`,
            [req.session.zgrada_id]  // Parameterized input
          );
          
        res.json(result.rows);  // Vraćanje svih diskusija
    } catch (error) {
        console.error('Error fetching Glasanjes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Ruta za provjeru je li korisnik već glasao
router.get('/userVote', async (req, res) => {
    const { email, GlasanjeId } = req.query;

    if (!email || !GlasanjeId) {
        return res.status(400).json({ message: 'Email and GlasanjeId are required' });
    }

    try {
        const result = await pool.query(
            'SELECT odgovor FROM glasanje WHERE mail_glasaca = $1 AND id_forme = $2',
            [email, GlasanjeId]
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







module.exports = router;

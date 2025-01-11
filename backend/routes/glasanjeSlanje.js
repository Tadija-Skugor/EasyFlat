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
router.get('/Glasanjes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM glasanje_forma');
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

router.post('/', async (req, res) => {
    let { userId, GlasanjeId, vote } = req.body; // Use 'let' instead of 'const' to allow reassignment
    console.log("Vrijednost vota je: " + vote);

    if (vote === "da") {
        vote = true;
    } 
    else if (vote === "ne") {
        vote = false;
    }
    console.log("Vrijednost vota je: " + vote);

    if (!userId || !GlasanjeId) {
        return res.status(400).send('Svi podaci (userId, GlasanjeId, vote) moraju biti prisutni');
    }

    try {
        const result = await pool.query(
            'SELECT * FROM glasanje WHERE mail_glasaca = $1 AND id_forme = $2',
            [userId, GlasanjeId]
        );

        if (result.rows.length > 0) {
            return res.status(400).send('Već ste glasovali za ovu diskusiju');
        }

        await pool.query(
            'INSERT INTO glasanje (id_forme, mail_glasaca, odgovor) VALUES ($1, $2, $3)',
            [GlasanjeId, userId, vote]
        );

        if (vote === true) {
            await pool.query(
                'UPDATE glasanje_forma SET glasovanje_da = glasovanje_da + 1 WHERE id = $1',
                [GlasanjeId]
            );
        } else if (vote === false) {
            await pool.query(
                'UPDATE glasanje_forma SET glasovanje_ne = glasovanje_ne + 1 WHERE id = $1',
                [GlasanjeId]
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).send('Server error');
    }
});


router.post('/dodavanjeGlasovanja', async (req, res) => {
    console.log("Backend se vrti kad prima ");
    
    let { naslov, opis, datum_istece } = req.body;  
    const KreatorEmail = req.session.email;  
    let result = await pool.query(
        'SELECT ime FROM korisnik WHERE email = $1', [KreatorEmail]
    );
    const Kreator = result.rows[0].ime;

    console.log(req.body);
    console.log(naslov);
    console.log(opis);
    console.log(datum_istece);

    if (!naslov || !opis || !datum_istece || !Kreator) {
        console.log("Greska pri verifikaciji podataka");
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const datumStvoreno = new Date().toISOString().slice(0, 19).replace('T', ' '); // Format as YYYY-MM-DD HH:MM:SS

    const query = `
        INSERT INTO glasanje_forma (datum_stvoreno, datum_istece, glasovanje_da, glasovanje_ne, naslov, kreator)
        VALUES ($1, $2, 0, 0, $3, $4)
        RETURNING id
    `;

    // Execute the query using the pool
    try {
        const result = await pool.query(query, [datumStvoreno, datum_istece, naslov, Kreator]);

        console.log("Glasanje inserted successfully; id = ", result.rows[0].id);

        res.status(201).json({
            success: true,
            newGlasanje: {
                id: result.rows[0].id,  
                naslov: naslov,
                opis: opis,
                datum_istece: datum_istece,
                kreator: Kreator,
            },
        });
    } catch (err) {
        console.error('Error inserting new Glasanje:', err);
        return res.status(500).json({ message: 'Error inserting data into the database.' });
    }
});


module.exports = router;

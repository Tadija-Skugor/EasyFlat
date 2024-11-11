const express = require('express');

class UserController {
    constructor(pool) {
        console.log("Is pool defined? ", pool !== undefined);
        this.pool = pool;
        this.router = express.Router();
        this.router.post('/', this.fetchUserData.bind(this));   // Route to fetch user data
        this.router.post('/update', this.updateUserData.bind(this));    // Route for updating user data
    }

    getUserData(session) {
        console.log("Njegov stanID je: ", session.stanBr);  // Log to check the session's stanBr
        return {  // Format data to be sent for the user profile
            slika: session.picture,
            ime: session.ime,
            prezime: session.prezime,
            status: session.status || 'Suvlasnik',
            email: session.email,
            stanBr: session.stanBr  // Ensure stanBr is included in the response
        };
    }

    fetchUserData(req, res) {
        console.log("Fetching user data...");
        try {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const userData = this.getUserData(req.session);
            res.json(userData);
        } catch (error) {
            console.error('Error fetching user info: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async updateUserData(req, res) {
        try {
            const { ime, prezime } = req.body; // Only get ime and prezime from the request body
            const stanBr = req.session.stanBr; // Get stanBr from the session (this should never change)
    
            if (!stanBr) {
                return res.status(400).json({ message: 'Missing apartment number (stanBr)' });
            }
    
            console.log("Updating user data for email:", req.session.email);
            console.log("New data:", { ime, prezime, stanBr });
    
            // Update the user data in the database, preserving stan_id (stanBr)
            const korisnikUpdate = await this.pool.query(
                'UPDATE korisnik SET ime = $1, prezime = $2 WHERE email = $3 RETURNING *',
                [ime, prezime, req.session.email]
            );
    
            if (korisnikUpdate.rows.length > 0) {
                // Update the session with new ime and prezime
                req.session.ime = ime;
                req.session.prezime = prezime;

                // Send back the full user data including the unchanged fields
                const updatedUserData = {
                    slika: req.session.picture,
                    ime: req.session.ime,
                    prezime: req.session.prezime,
                    status: req.session.status || 'Suvlasnik',
                    email: req.session.email,
                    stanBr: req.session.stanBr
                };

                res.json(updatedUserData);
            } else {
                res.status(404).send({ message: 'User not found.' });
            }
        } catch (err) {
            console.error('Error updating database:', err);
            res.status(500).send({ message: 'Internal server error.' });
        }
    }
}

module.exports = (pool) => new UserController(pool).router;

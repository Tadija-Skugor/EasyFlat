const express = require('express');

class UserController {
    constructor(pool) {
        console.log("Is pool defined? ", pool !== undefined);
        this.pool = pool; 
        this.router = express.Router();
        this.router.post('/', this.fetchUserData.bind(this));   
        this.router.post('/update', this.updateUserData.bind(this));   
        this.router.get('/inactive-users', this.fetchInactiveUsers.bind(this));
        this.router.get('/active-users', this.fetchActiveUsers.bind(this));
        this.router.post('/activate-user', this.activateUser.bind(this));
        this.router.post('/deactivate-user', this.deactivateUser.bind(this));
        this.router.post('/setSuvlasnik-user', this.setSuvlasnik.bind(this));
        this.router.post('/removeSuvlasnik-user', this.removeSuvlasnik.bind(this));
        this.router.get('/nerjesen_upit', this.fetchNerjeseniUpiti.bind(this));
        this.router.get('/buildings', this.fetchBuildingNames.bind(this));
        this.router.get('/active-suvlasnici', this.fetchActiveSuvlasnik.bind(this));

    }

    async activateUser(req, res) {
        try {
            const { email } = req.body;
    
            if (!email) {
                return res.status(400).json({ message: 'Missing email.' });
            }
    
            console.log(`Activating user with email: ${email}`);
    
            const result = await this.pool.query(
                'UPDATE korisnik SET aktivan = true WHERE email = $1 RETURNING *',
                [email]
            );
    
            if (result.rowCount > 0) {
                res.json({ message: 'User activated successfully.', user: result.rows[0] });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error activating user:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async setSuvlasnik(req, res) {
        try {
            const { email } = req.body;
    
            if (!email) {
                return res.status(400).json({ message: 'Missing email.' });
            }
    
            console.log(`Setting as Suvlasnik user with email: ${email}`);
            const buildingResult = await this.pool.query(
                'SELECT zgrada_id FROM korisnik WHERE email = $1',
                [email]
            );
    
            if (buildingResult.rowCount === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
    
            const zgrada_id = buildingResult.rows[0].zgrada_id;
            const existingSuvlasnik = await this.pool.query(
                'SELECT * FROM korisnik WHERE zgrada_id = $1 AND suvlasnik = true',
                [zgrada_id]
            );
    
            if (existingSuvlasnik.rowCount > 0) {
                return res.status(400).json({
                    message: 'A Suvlasnik already exists for this building.',
                    existingSuvlasnik: existingSuvlasnik.rows[0],
                });
            }
            const result = await this.pool.query(
                'UPDATE korisnik SET suvlasnik = true WHERE email = $1 RETURNING *',
                [email]
            );
    
            if (result.rowCount > 0) {
                res.json({ message: 'User set as Suvlasnik successfully.', user: result.rows[0] });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error setting Suvlasnik:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }
    

    async removeSuvlasnik(req, res) {
        try {
            const { email } = req.body;
    
            if (!email) {
                return res.status(400).json({ message: 'Missing email.' });
            }
    
            console.log(`Removing as Suvlasnik user with email: ${email}`);
    
            const result = await this.pool.query(
                'UPDATE korisnik SET suvlasnik = false WHERE email = $1 RETURNING *',
                [email]
            );
    
            if (result.rowCount > 0) {
                res.json({ message: 'User removed as suvlansik successfully.', user: result.rows[0] });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error activating user:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async deactivateUser(req, res) {
        try {
            const { email } = req.body;
    
            if (!email) {
                return res.status(400).json({ message: 'Missing email.' });
            }
    
            console.log(`Deactivating user with email: ${email}`);
    
            const result = await this.pool.query(
                'UPDATE korisnik SET aktivan = false, suvlasnik = false WHERE email = $1 RETURNING *',
                [email]
            );
    
            if (result.rowCount > 0) {
                res.json({ message: 'User deactivated successfully.', user: result.rows[0] });
            } else {
                res.status(404).json({ message: 'User not found.' });
            }
        } catch (error) {
            console.error('Error deactivating user:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async fetchInactiveUsers(req, res) {
        try {
            const result = await this.pool.query(
                'SELECT ime, prezime, email, stan_id, zgrada_id, suvlasnik FROM korisnik WHERE aktivan = false'
            );
    
            if (result.rows.length > 0) {
                res.json(result.rows); 
            } else {
                res.json([]); 
            }
        } catch (error) {
            console.error('Error fetching inactive users:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async fetchActiveUsers(req, res) {
        try {
            const result = await this.pool.query(
                'SELECT ime, prezime, email, stan_id, suvlasnik, zgrada_id FROM korisnik WHERE aktivan = true'
            );
    
            if (result.rows.length > 0) {
                res.json(result.rows); 
            } else {
                res.json([]); 
            }
        } catch (error) {
            console.error('Error fetching active users:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async fetchNerjeseniUpiti(req, res) {
        try {
            const result = await this.pool.query(
                'SELECT emailosobe,tekst FROM upit WHERE rjeseno = false'
            );
    
            if (result.rows.length > 0) {
                res.json(result.rows); 
            } else {
                res.json([]); 
            }
        } catch (error) {
            console.error('Error fetching inactive users:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
    async fetchBuildingNames(req, res) {
        try {
            const result = await this.pool.query('SELECT id, naziv_zgrade FROM zgrade');
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching building names:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }

    async fetchActiveSuvlasnik(req, res) {
        try {
            const result = await this.pool.query(
                `SELECT zgrada_id, naziv_zgrade, 
                        json_build_object('ime', ime, 'prezime', prezime, 'email', email, 'stan_id', stan_id) AS suvlasnik
                 FROM korisnik
                 JOIN zgrade ON korisnik.zgrada_id = zgrade.id
                 WHERE suvlasnik = true AND email != 'easyflatprogi@gmail.com'
                 ORDER BY zgrada_id`
            );            
            res.json(result.rows);
            console.log("get suvlasnike", JSON.stringify(result.rows, null, 2));
        } catch (error) {
            console.error('Error fetching co-owners:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    }


    async getUserData(session) {
        console.log("Fetching data for user with stanID:", session.stanBr);

        try {
            const result = await this.pool.query(
                'SELECT ime, prezime, email, stan_id, aktivan, zgrada_id, suvlasnik FROM korisnik WHERE email = $1',
                [session.email]
            );

            if (result.rows.length === 0) {
                throw new Error('User not found in database');
            }

            const user = result.rows[0];

            return {
                slika: session.picture,  // Slika is fetched from the session
                ime: user.ime,
                prezime: user.prezime,
                status: session.status || 'Suvlasnik',
                email: user.email,
                stanBr: user.stan_id,
                zgrada_id: user.zgrada_id,
                suvlasnik: user.suvlasnik  
            };
        } catch (error) {
            console.error('Error fetching user data from database:', error);
            throw new Error('Failed to fetch user data from database');
        }
    }

    // fetch
    async fetchUserData(req, res) {
        console.log(req.session);

        console.log("Fetching user data...");
        try {
            const userId = req.session.userId;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        
            const userData = await this.getUserData(req.session);
            res.json(userData);
        } catch (error) {
            console.error('Error fetching user info: ', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    // azuriranje u db
    async updateUserData(req, res) {
        try {
            const { ime, prezime } = req.body; 
            const stanBr = req.session.stanBr; 
    
            if (!stanBr) {
                return res.status(400).json({ message: 'Missing apartment number (stanBr)' });
            }
    
            console.log("Updating user data for email:", req.session.email);
            console.log("New data:", { ime, prezime, stanBr });
    
            const korisnikUpdate = await this.pool.query(
                'UPDATE korisnik SET ime = $1, prezime = $2 WHERE email = $3 RETURNING *',
                [ime, prezime, req.session.email]
            );
    
            if (korisnikUpdate.rows.length > 0) {
                req.session.ime = ime;
                req.session.prezime = prezime;

                const updatedUserData = {
                    slika: req.session.picture,  
                    ime: req.session.ime,
                    prezime: req.session.prezime,
                    status: req.session.status || 'Suvlasnik',
                    email: req.session.email,
                    stanBr: req.session.stanBr,
                    suvlasnik: req.session.suvlasnik,
                    zgrada_id: req.session.zgrada_id
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

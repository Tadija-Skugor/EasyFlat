const express = require('express');

class UserController {
    constructor() {
        this.router = express.Router();
        this.router.get('/', this.fetchUserData.bind(this));   //ruta za dohvat svih relevantnih podataka korisnika za display na stranici sa podacima
        this.router.post('/update', this.updateUserData.bind(this));    //ruta na koju se šalju novo ime i prezime korisnika
    }

    getUserData(session) {
        console.log("Njegov stanID je: ", session.stanBr);
        return {                                            //podaci za display se šalju u ovakvom formatu
            slika: session.picture,
            ime: `${session.ime} ${session.prezime}`,
            status: session.status || 'Suvlasnik',
            email: session.email,
            stanBr: session.stanBr
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
            console.error('Error fetching user info:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async updateUserData(req,res) {

    }
}

module.exports = new UserController().router;

const express = require('express');
const router = express.Router();

const getUserData = (session) => {
    console.log("Njegov stanID je: ", session.stanBr);
    return {
        slika: session.picture,  
        ime: session.ime + ' ' + session.prezime,
        status: session.status || 'Suvlasnik',  
        email: session.email,
        stanBr: session.stanBr
    };
};
//s
router.post('/', (req, res) => {
    console.log("Fetching user data...");
    try {
        const userId = req.session.userId;  
        if (!userId) return res.status(401).json({ message: 'Unauthorized' });

        const userData = getUserData(req.session);
        res.json(userData);
    } catch (error) {
        console.error('Error fetching user info:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

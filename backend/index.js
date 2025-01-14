// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const authRouter = require('./routes/oauth');
const requestRouter = require('./routes/request');
const checkAuth = require('./routes/checkAuth');
const podatciKorisnikaSignup = require('./routes/authentifikacija');
const logout = require('./routes/logout');
const adminRouter = require('./routes/admin');
const glasanjeSlanje = require('./routes/glasanjeSlanje');
const ucitavanjePoruka = require('./routes/ucitavanjePoruka');
const archive = require('./routes/ArchiveManager')
const archiveRouter = archive.router
const pool = require('./db');
const userDataRouter = require('./routes/userData')(pool);
const dataRouter = require('./routes/discussionData');

const authMiddleware = require('./middleware/auth');
const session = require('express-session');





const apiKeyAuth = require('./middleware/apiKeyAuth');

class Server {
  constructor(port) {
    this.app = express();
    this.port = port;
    this.configureMiddleware();
    this.setupRoutes();
  }

  configureMiddleware() {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(express.json());
    
    const corsOptions = {
      origin: 'http://localhost:5000',
      credentials: true,
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));

    this.app.use(session({
      secret: 'your_secret_key', 
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
      }
    }));
  }

  setupRoutes() {
    //OVO POSLATI U TERMINAL
    
    //curl -H "Authorization: ApiKey key" -H "custom-header-1: Primjer" -H "custom-header-2: Primjer" http://localhost:4000/slanjeRazgovoraPrekoApi

    this.app.use('/slanjeRazgovoraPrekoApi', apiKeyAuth, async (req, res) => {
      const { apiKeyInfo } = req;
    
      // definiraj custom headere
      const customHeader1 = req.headers['custom-header-1'];
      const customHeader2 = req.headers['custom-header-2'];
    
      // provjeri headere
      if (!customHeader1 || !customHeader2) {
        return res.status(400).send({
          error: 'Nedostaje jedan ili oba custom headera!',
          missingHeaders: {
            customHeader1: !customHeader1 ? 'Nije predan' : undefined,
            customHeader2: !customHeader2 ? 'Nije predan' : undefined,
          },
        });
      }
    
      try {
        console.log(`Predano je ${customHeader1} ${customHeader2}`);
        const result = await pool.query(`SELECT ime FROM korisnik LIMIT 1`);
        const userName = result.rows[0] ? result.rows[0].ime : 'Fali sadrzaj u bazi'; // tekst neki
        
        res.send({
          message: 'Pristup dan preko api kljuca!',
          apiKeyInfo,
          receivedHeaders: {
            customHeader1,
            customHeader2,
          },
          firstUserName: userName,
        });
      } catch (err) {
        console.error('Error u db:', err);
        res.status(500).send({
          error: 'Database query propo',
          message: err.message,
        });
      }
    });
    
    this.app.use('/logout', logout);
    this.app.use('/signupAuth', podatciKorisnikaSignup);
    this.app.use('/glasanje', glasanjeSlanje);
    this.app.use('/userInfo', userDataRouter);
    this.app.use('/data', (req, res, next) => {
      console.log('Session Data:', req.session); // Check if session is available here
      next();
    }, dataRouter);
    
    
    this.app.use('/check-auth',  checkAuth);
    this.app.use('/oauth', authRouter);
    this.app.use('/poruke', ucitavanjePoruka);
    this.app.use('/request', requestRouter);

    this.app.use('/admin', authMiddleware.isAuthenticated, adminRouter);
    this.app.use('/archive', archiveRouter);

    this.app.use('/protected', authMiddleware.isAuthenticated, authMiddleware.isVerifiedUser,  (req, res) => {
      res.send({ 
        message: 'You are authenticated and verified!',
        apiKeyInfo: req.apiKeyInfo
      });
    });


    

    this.app.use('/', authMiddleware.isAuthenticated, router);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server se pokreće na: http://localhost:${this.port}`);
    });
    
    archive.checkforArchiving()

    schedule.scheduleJob('0 0 * * *', () => {
      archive.checkforArchiving()
    });
  }
}

const server = new Server(4000);
server.start();

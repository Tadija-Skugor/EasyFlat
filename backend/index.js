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
const zgradeInfoRouter = require('./routes/zgradeInfo');

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
    this.app.set('trust proxy', 1);

    const corsOptions = {
      origin: 'https://easyflat.eu.ngrok.io',
      credentials: true,
      optionsSuccessStatus: 200,
    };

    this.app.use(cors(corsOptions));
    this.app.use(session({
      secret: 'your_secret_key', // tajna shhh
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,      // Koristite true za HTTPS, false za HTTP (ili testiranje na localhostu)
        sameSite: 'none',  // Potrebno za CORS s credentials i različite domene
        maxAge: 1000 * 60 * 60 * 24 // 1 day 
      }
    }));
    
  }

  setupRoutes() {
    //OVO POSLATI U TERMINAL
    
    //curl -H "Authorization: ApiKey key" -H "Naslov-diskusije: Primjer" -H "ID-zgrade:1" https://be30c39fc6db.ngrok.app/slanjeRazgovoraPrekoApi

    this.app.use('/slanjeRazgovoraPrekoApi', apiKeyAuth, async (req, res) => {
      const { apiKeyInfo } = req;
    console.log(req.headers)
      // Define custom header
      const Naslov = req.headers['naslov-diskusije'];
      const zgrada_id = req.headers['id-zgrade'];
console.log(zgrada_id)
      // Check if the header is provided
      if (!Naslov||!zgrada_id) {
          return res.status(400).send({
              error: 'Nedostaje jedan ili oba headera!',
          });
      }
    
      try {
          console.log(`Predano je ${Naslov}`);
  
          const result = await pool.query(`SELECT naslov, odgovori FROM diskusija WHERE zgrada_id=${zgrada_id} AND naslov LIKE '%${Naslov}%'`);
          
          if (result.rows.length === 0) {
              return res.status(404).send({
                  message: 'No discussions found matching the title.',
              });
          }
  
          const foundNaslovi = result.rows.map(row => row.naslov);
  
          const firstDiscussion = result.rows[0];
          const odgovori = firstDiscussion.odgovori || 'Nema odgovora'; // Default message if no odgovori found
  
          const encodedNaslov = encodeURIComponent(Naslov);

          // Construct the site link with the encoded Naslov
          const siteLink = `https://easyflat.eu.ngrok.io/main?search_query=${encodedNaslov}`;
      
          res.send({
            message: 'Pristup dan preko api kljuca!',
            apiKeyInfo,
            receivedHeaders: {
              Naslov
            },
            foundNaslovi,
            prviOdgovori: odgovori,
            siteLink,  // Add the link to the response
          });
      
        } catch (err) {
          console.error('Error u db:', err);
          res.status(500).send({
            error: 'Database query failed',
            message: err.message,
          });
        }
      });
  
    
    this.app.use('/logout', logout);
    this.app.use('/signupAuth', podatciKorisnikaSignup);
    this.app.use('/glasanje', glasanjeSlanje);
    this.app.use('/userInfo', userDataRouter);
    this.app.use('/zgradeInfo', zgradeInfoRouter);
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

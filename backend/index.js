// index.js
const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const authRouter = require('./routes/oauth');
const requestRouter = require('./routes/request');
const checkAuth = require('./routes/checkAuth');
const podatciKorisnikaSignup = require('./routes/authentifikacija');
const logout = require('./routes/logout');
const adminRouter = require('./routes/admin');
const dataRouter = require('./routes/discussionData');
const glasanjeSlanje = require('./routes/glasanjeSlanje');
const ucitavanjePoruka = require('./routes/ucitavanjePoruka'); // No need to pass pool anymore
const archive = require('./routes/ArchiveManager')
const archiveRouter = archive.router

// Database connection
const pool = require('./db');

// User data routes
const userDataRouter = require('./routes/userData')(pool);

const authMiddleware = require('./middleware/auth');
const session = require('express-session');

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
    this.app.use('/logout', logout);
    this.app.use('/signupAuth', podatciKorisnikaSignup);
    this.app.use('/glasanje', glasanjeSlanje);
    this.app.use('/userInfo', userDataRouter);
    this.app.use('/check-auth', checkAuth);
    this.app.use('/oauth', authRouter);
    this.app.use('/poruke', ucitavanjePoruka);  // No need for passing pool here
    this.app.use('/request', requestRouter);
    this.app.use('/admin', authMiddleware.isAuthenticated, adminRouter);
    this.app.use('/archive', archiveRouter);
    this.app.use('/data', dataRouter);
    this.app.use('/protected', authMiddleware.isAuthenticated, authMiddleware.isVerifiedUser, (req, res) => {
      res.send({ message: 'You are authenticated and verified!' });
    });
    this.app.use('/', authMiddleware.isAuthenticated, router);
  }

  async checkforArchiving() {
    try {
      const result = await pool.query('SELECT * FROM diskusija LIMIT 1');
      console.log(result.rows);
    } catch (err) {
      console.error('Error executing query for archiving:', err.message);
    }
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

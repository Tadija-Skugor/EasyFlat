const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const authRouter = require('./routes/oauth');
const requestRouter = require('./routes/request');
const checkAuth = require('./routes/checkAuth');
const podatciKorisnikaSignup = require('./routes/authentifikacija');
const logout = require('./routes/logout');
const adminRouter = require('./routes/admin');
const dataRouter = require('./routes/discussionData');
//const userDataRouter = require('./routes/userData');
const pool = require('./db');
const userDataRouter = require('./routes/userData')(pool);


const authMiddleware= require('./middleware/auth');
const session = require('express-session');
//const pool = require('./db');





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

    const corsOptions = {
      origin: 'http://localhost:5000', 
      credentials: true,
      optionsSuccessStatus: 200
  };

    this.app.use(cors(corsOptions));

        this.app.use(session({
          secret: 'your_secret_key', // tajna shhh
          resave: false,
          saveUninitialized: false,
          cookie: {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 // 1 day 
          }
        }));
      }
  

  setupRoutes() {
    this.app.use('/logout',logout);

    this.app.use('/signupAuth',podatciKorisnikaSignup);
    this.app.use('/userInfo',userDataRouter);
    this.app.use('/check-auth', checkAuth);
    this.app.use('/oauth', authRouter);
    this.app.use('/request', requestRouter);
    this.app.use('/admin',authMiddleware.isAuthenticated,adminRouter);
    this.app.use('/data', dataRouter);
    this.app.use('/protected', authMiddleware.isAuthenticated, authMiddleware.isVerifiedUser, (req, res) => {
      res.send({ message: 'You are authenticated and verified!' });
    });
    


    
    this.app.use('/', authMiddleware.isAuthenticated,router);

  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server se pokreće na: http://localhost:${this.port}`);
    });
  }
}

const server = new Server(4000);
server.start();

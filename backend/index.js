const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./routes/router');
const authRouter = require('./routes/oauth');
const requestRouter = require('./routes/request');
const isAuthenticated = require('./middleware/auth'); // Import the middleware
const session = require('express-session');


const authentifikacija = require('./routes/authentifikacija');



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
    this.app.use('/oauth', authRouter);
    this.app.use('/request', requestRouter);
    this.app.use('/protected', isAuthenticated, authentifikacija);
    this.app.use('/', isAuthenticated,router);

  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server se pokreće na: http://localhost:${this.port}`);
    });
  }
}

const server = new Server(4000);
server.start();

/* PACKAGES IMPORTS */

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const logger = require('morgan');
const socketIO = require('socket.io');
const http = require('http');
const passport = require('passport');

/* LOCAL IMPORTS */


var {
  mongoose
} = require('./db/mongoose');
var {
  User
} = require('./models/user');
const {
  secret
} = require('./config/config');

/* LOCAL IMPORTS - ROUTES */

var userRoutes = require('./routes/user');
var requestsRoute = require('./routes/requests')
var imageRoutes = require('./routes/userImage');
var keyRoutes = require('./routes/key');
var faqRoutes = require('./routes/faq');
const port = process.env.PORT || 3000;

/* SERVER SETUP */

var app = express();
var server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

/* SOCKET.IO SETUP */

var io = socketIO(server);

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.on('broadcastThisMessage', (message) => {
    console.log('Message to be broadcasted: ', message);

    socket.broadcast.emit('newMessage', message);
  });
});

/* APP CONFIGS */

app.use((req, res, next) => {
  // console.log(req);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-auth"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());

/* Express session midleware */

app.use(session({
  secret,
  resave: true,
  saveUninitialized: true
}));

/* PASSPORT MIDDLEWARE */

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (user, cb) {
  console.log(user)
  cb(null, user);
  // User.findById(user.id, function(err, user) {
  // cb(err, user);
  // });
});

require('./passport/local');
require('./passport/facebook');
require('./passport/google');

/* VUE RENDERER */

const { createBundleRenderer } = require('vue-server-renderer');

const template = require('fs').readFileSync(
  path.join(__dirname, './templates/index.html'),
  'utf-8',
);

const serverBundle = require('../dist/vue-ssr-server-bundle.json');
const clientManifest = require('../dist/vue-ssr-client-manifest.json');

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template,
  clientManifest,
  inject: false,
});

app.use('/dist', express.static(path.join(__dirname, '../dist')));

/* VIEWS - JADE */

app.set("view engine","jade")
app.set('views', path.join(__dirname, '/views'));

/* SEND STATIC IMAGES */

/* the one below also works file */
/* try: localhost:3000/file/a.jpg */

// console.log(__dirname)
app.use('/files', express.static(path.join(__dirname + '/uploads')))

/* ROUTES */

/* ROUTES - TEST */

app.get('/testing', (req, res) => res.send('Hello Moto...!'));

/* ROUTES - STATIC FILIES */

app.get('/file/:file', function (req, res) {
  // var file = req.params.file;
  console.log(req.params.file);
  if (req.params.file=='register')
  {
    res.sendFile('register.html', {
          root: __dirname
        }) 
  }
  else if (req.params.file=='login')
  {
    res.sendFile('login.html', {
          root: __dirname
        });
  }
  else if (req.params.file=='broadcast'){
    res.sendFile('websocket.html', {
          root: __dirname
        }); 
  }
  else{
    res.sendFile('/uploads/' + req.params.file, {
          root: path.join(__dirname)
        }); 
  }
});

/* ROUTES - FRONTEND TEST */

app.get('/test/test', (req, res) => {
  console.log('worked')
  res.send({
    msg: 'ALL IS WELL'
  })
})

/* ROUTES - BACKEND ROUTES */

app.use('/request',requestsRoute)
app.use('/user', userRoutes);
app.use('/image', imageRoutes);
app.use('/key', keyRoutes);
app.use('/faq', faqRoutes);

/* ROUTES - SERVING FRONTEND */

app.get('*', (req, res) => {
  const context = { url: req.url };

  renderer.renderToString(context, (err, html) => {
    if (err) {
      if (+err.message === 404) {
        res.status(404).end('Page not found');
      } else {
        console.log(err);
        res.status(500).end('Internal Server Error');
      }
    }

    res.end(html);
  });
});

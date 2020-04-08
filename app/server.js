const path = require('path');

const express = require('express');

const { createBundleRenderer } = require('vue-server-renderer');

const template = require('fs').readFileSync(
  path.join(__dirname, './templates/index.html'),
  'utf-8',
);

const serverBundle = require('../dist/vue-ssr-server-bundle.json');
const clientManifest = require('../dist/vue-ssr-client-manifest.json');

const server = express();

const renderer = createBundleRenderer(serverBundle, {
  runInNewContext: false,
  template,
  clientManifest,
  inject: false,
});

server.use('/dist', express.static(path.join(__dirname, '../dist')));

server.set("view engine","jade")
server.set('views', path.join(__dirname, '/views'));
/* PASSPORT MIDDLEWARE */

const passport = require('passport');

server.use(passport.initialize());
server.use(passport.session());

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

var {
  mongoose
} = require('./db/mongoose');
var {
  User
} = require('./models/user');
const {
  secret
} = require('./config/config');
var userRoutes = require('./routes/user');
server.get('/test/test', (req, res) => {
  console.log('worked')
  // res.send({
  //   msg: 'good'
  // })
  res.send(`<script>console.log('good')</script>`) 
})
require('./passport/facebook');

/* ROUTES */

var userRoutes = require('./routes/user');

server.use('/user', userRoutes);

server.get('*', (req, res) => {
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


server.listen(process.env.PORT || 3000);

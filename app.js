const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const tty = require('tty');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');
const pty = require('pty.js');
const http = require('http');
const pmx = require('pmx');
const probe = pmx.probe();

mongoose.connect(config.database);
let db = mongoose.connection;

// Check Connection
db.once('open', function(){
  console.log('Connected to MongoDB');
});

// Check For db Errors
db.on('error', function(err){
  console.log('err');
});

// Init App
const app = express();

// Bring The models
let Article = require('./models/article');

// Load Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser MiddleWare
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.')
    , root    = namespace.shift()
    , formParam = root;

  while(namespace.length) {
    formParam += '[' + namespace.shift() + ']';
  }
  return {
    param : formParam,
    msg   : msg,
    value : value
  };
  }
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Home Route
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
    } else {
   res.render('index', {
     title:'Articles',
     articles: articles
});
}
});
});

// Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

// Start App
app.listen(3000, function(){
   console.log('Server Started on port 3000...');
 });

//const tty = tty.createServer({
//  shell: 'bash',
//  users: {
//    String: 'password'
//  },
//  port: 8080
//});
//
//app.get('/foo', function(req, res, next) {
//  res.send('bar');
//});

//process.stdin.resume();
////tty.setRawMode(true);
//process.stdin.on('keypress', function(char, key) {
//  if (key && key.ctrl && key.name == 'c') {
//    console.log('graceful exit');
//    process.exit()
//  }
//});

//const term = pty.spawn('bash', [], {
//  name: 'xterm-color',
//  cols: 80,
//  rows: 30,
//  cwd: process.env.HOME,
//  env: process.env
//});
//
//term.on('data', function(data) {
//  console.log(data);
//});
//
//term.write('ls\r');
//term.resize(100, 40);
//term.write('ls /\r');
//
//console.log(term.process);

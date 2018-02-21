// Require express
const express = require('express');
const path = require('path')
const exphbs  = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport')
const mongoose = require('mongoose');

const app = express();


require('./models/Idea');
const Idea = mongoose.model('ideas')

// Load routers
const ideas = require('./routes/ideas');
const users = require('./routes/users');

// Passport Config
require('./config/passport')(passport);



// Map global promise - get rid of warning
mongoose.Promise = global.Promise

// Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', { })
.then(() =>{
  console.log('Mongodb connected');
})
.catch((err) => {
  console.log(err)
});

// Handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse application/json

// Static folder
app.use(express.static(path.join(__dirname, 'public'))) //юзаем имг и стили

// Method override middleware
app.use(methodOverride('_method')); // override with POST having ?_method=DELETE

// Express session middleware
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));

// Passport middleware
app.use(passport.initialize());
  app.use(passport.session());

// 
app.use(flash())

// Global variables
app.use(function(req, res, next){
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

// Index route
app.get('/', (req, res)=>{
    res.render('index') 
})

// About Route
app.get('/about', (req, res) => {
  res.render('about')
})

// Posts Route
app.get('/posts', (req, res) => {
  Idea.find()
  .sort({date: 'desc'})
  .then(ideas => {
    res.render('posts', {
      ideas: ideas
    })
  })
})


// Use routes
app.use('/ideas', ideas) // это озночает что с файла ideas.js все пути будут начинатся так locallhost/ideas/и шо там оно напишет
app.use('/users', users)

const port = 5000;

app.listen(port,() =>{
  console.log(`Server started on port ${port}`);
});

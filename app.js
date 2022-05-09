const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const express_handlebars = require('express-handlebars');
const methodOverride = require('method-override')
const path = require('path');
const session = require('express-session');
const passport = require('passport');




//load config variable
dotenv.config({ path: './config/config.env' });


// calling the function in app for connecting it to the database
connectDB();

// passport config
require('./config/passport')(passport);


const app = express();

//body parser for post request and input body content
app.use(express.urlencoded({ extended: false }))
app.use(express.json());

// method override 
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method
      delete req.body._method
      return method
    }
  }))

//logging 
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
//handlebars helpers for fotmating the date and time of story
const { formatDate, stripTags, truncate ,editIcon,select} = require('./helpers/hbs')

//view engine and layout
app.engine('.hbs', express_handlebars.engine({
    helpers: {
        formatDate, stripTags, truncate,editIcon,select,
    },
    defaultLayout: 'main', extname: '.hbs'
}));
app.set('view engine', '.hbs');
app.set('views', './views');


// static folder
app.use(express.static(path.join(__dirname, 'public')));


// session for create cookie for login
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } this not work without http
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

//set global var
app.use(function(req,res,next){
    res.locals.user =req.user ||null
    next()
})


//redirecting to the routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3040;

app.listen(PORT, function (err) {
    if (err) {
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running ${process.env.NODE_ENV} on port: ${PORT}`);
});

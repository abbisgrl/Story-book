const express =require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const morgan = require('morgan');
const ejs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const session = require('express-session');



//load config variable
dotenv.config({path: './config/config.env'});

// passport config
require('./config/passport')(passport);

connectDB(); // calling the function in app for connecting it to the database


const app = express();


//logging 
if(process.env.NODE_ENV==='development'){
    app.use(morgan('dev'))
}


//view engine and layout
app.engine('.hbs', ejs.engine({defaultLayout: 'main',extname: '.hbs'}));
app.set('view engine', '.hbs');
app.set('views', './views');


// static folder
app.use(express.static(path.join(__dirname,'public')));


// session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true } this not work without http
  }))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());


//redirecting to the routes
app.use('/',require('./routes/index'));
app.use('/auth',require('./routes/auth'))


const PORT = process.env.PORT || 3040;

app.listen(PORT, function(err){
    if (err){
        console.log(`Error in running the server: ${err}`);
    }

    console.log(`Server is running ${process.env.NODE_ENV} on port: ${PORT}`);
});

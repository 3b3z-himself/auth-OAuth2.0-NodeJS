require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "My mystery secret bla bla bla",
    resave: false,
    saveUninitialized: false,

}))

app.use(passport.initialize());
app.use(passport.session());
const User = require('./models/userSchema');

mongoose.connect(process.env.DB_URI)
    .then((result) => app.listen(3000))
    .catch(err => console.log('Error connecting', err));


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/secrets', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    }else{
        res.redirect('/login')
    }
})


app.post('/register', async (req, res) => {
    
    User.register(new User({ username: req.body.username }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        } else {
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets');
            });
        }
    });
});




    
app.post('/login', function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err, res){
        if(err){
            console.log(err)
        } else{
            passport.authenticate('local')(req, res, function () {
                res.redirect('/secrets');
            });
        }
    })
});


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/')
});
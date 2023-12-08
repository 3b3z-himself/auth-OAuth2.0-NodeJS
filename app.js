require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GitHubStrategy = require('passport-github2').Strategy;
const app = express();

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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

app.get('/auth/github',
    passport.authenticate('github', { scope: [ 'user:email' ] }));
  
app.get('/auth/github/callback', 
    passport.authenticate('github', { failureRedirect: '/login' }),
    function(req, res) {
      res.redirect('/secrets');
    });

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/github/callback"
    },
    async (accessToken, refreshToken, profile, cb) => {
        const user = await User.findOne({
            accountID: profile.id,
            provider: 'github'
        });
        if (!user){
            console.log('Adding new github user to DB..');
            const user = new User({
                accountID: profile.id,
                username: profile.username,
                provider: profile.provider
            });
            await user.save();
            return cb(null, profile);
        }
        else{
            console.log('Github user already exists in database');
            return cb(null, profile);
        }
    }
));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/secrets', async (req, res) =>  {
    if (req.isAuthenticated()) {
        console.log(req.user)
        const secrets = await User.find({}, { msg: 1 });
        const secretValues = secrets.map(secret => secret.msg);
        console.log(secretValues)
        res.render('secrets', {secrets: secretValues});
    }else{
        res.redirect('/login')
    }
})

app.get('/submit', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('submit');
    }else{
        res.redirect('/login')
    }
})

app.post('/submit', (req, res) => {
    submittedMSG = req.body.secret
    console.log(req.user)
    if (req.user.provider === 'local'){
        User.findById(req.user.id).then(user => {
            if (!user) {
                // Handle user not found error
            } else {
                // Update user's message
                user.msg = submittedMSG;
        
                // Save updated user
                user.save().then(() => {
                    res.redirect('/secrets');
                }).catch(err => {
                    console.error(err);
                });
            }
        }).catch(err => {
            console.error(err);
        });
    } 
    else{
        User.findByUsername(req.user.username).then(user => {
            if (!user) {
                // Handle user not found error
            } else {
                // Update user's message
                user.msg = submittedMSG;
        
                // Save updated user
                user.save().then(() => {
                    res.redirect('/secrets');
                }).catch(err => {
                    console.error(err);
                });
            }
        }).catch(err => {
            console.error(err);
        });
    }
    
});

app.post('/register', async (req, res) => {
    
    User.register(new User({ username: req.body.username, provider: "local" }), req.body.password, function (err, user) {
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
    req.login(user, function(err, res2){
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
    req.logout(function(err) {
        if (err) {
            console.log(err)
        }
        res.redirect('/');
    });
});

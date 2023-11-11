require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const md5 = require('md5');
const User = require('./models/userSchema');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();

app.use(express.static('public'));


mongoose.connect(process.env.DB_URI)
    .then((result) => app.listen(3000))
    .catch(err => console.log('Error connecting', err));


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    try {
        bcrypt.hash(req.body.password, saltRounds, async function (err, hashed) {
            if (err) {
                console.log(err);
            }else{
        const newUser = new User({
            email: req.body.username,
            password: hashed
        });
        await newUser.save();
        res.render('secrets');}});
    } catch (err) {
        console.log(err);
    }
});

    
app.post('/login', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username })
        .then(user => {
            if (user) {
                bcrypt.compare(password, user.password, function (err, result) {
                    if(result === true){
                        res.render('secrets');
                    }
                })
                
            }
        })
        .catch(err => {
            console.log(err);
        });
});

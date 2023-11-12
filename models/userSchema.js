const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    username: String,
    password: String

}, { timestamps: true});



UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('users', UserSchema);
// passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
module.exports = User;

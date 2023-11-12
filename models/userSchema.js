const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    accountID: String,
    username: String,
    password: String,
    provider: String,
    msg: String
}, { timestamps: true});



UserSchema.plugin(passportLocalMongoose);
const User = mongoose.model('users', UserSchema);
// passport.use(User.createStrategy())
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
module.exports = User;

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

passport.serializeUser(function (user, done) {
    console.log("User from serialize: ", user);
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URI,
}, (accessToken, request, refreshToken, profile, done) => {
    console.log("Request -> ", request);
    console.log("Access Token -> ", accessToken);
    console.log("Refresh Token -> ", refreshToken);
    console.log("Profile -> ", profile);

    done(null, { accessToken, refreshToken, profile });
}));
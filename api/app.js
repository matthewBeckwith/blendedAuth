const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const cookieSession = require('cookie-session');
require('./utilities/passport_setup');
require('dotenv').config();

const indexRouter = require('./routes/index');
const firebaseRouter = require('./routes/firebaseRoutes');
const googleRouter = require('./routes/gcloudRoutes');

const app = express();

const isLoggedIn = require('./middleware/isLoggedIn');
const isRegistered = require('./middleware/isRegistered');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIE_KEY_1, process.env.COOKIE_KEY_1]
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/dashboard', isLoggedIn, isRegistered, firebaseRouter);
app.use('/google', isLoggedIn, googleRouter);

app.get('/google-auth',
  passport.authenticate('google', {
    scope: [
      process.env.GOOGLE_SCOPE_GMAIL,
      process.env.GOOGLE_SCOPE_DRIVE,
      process.env.GOOGLE_SCOPE_DOCUMENTS,
      process.env.GOOGLE_SCOPE_CONTACTS,
      process.env.GOOGLE_SCOPE_CALENDAR,
      process.env.GOOGLE_SCOPE_SHEETS,
      process.env.GOOGLE_SCOPE_GPLUS
    ]
  }));
app.get('/google-auth/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/failed', (req, res) => {
  res.send("Auth Failed");
});

app.get('/logout', isLoggedIn, (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
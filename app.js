const path = require('node:path');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const pool = new Pool({
    user: 'leo',
    host: 'localhost',
    database: 'auth_project',
    password: '09272011',
    port: 5432,
    max: 20,
    idleTimeoutMillis: 30000
});

const app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'cats', resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.render('index', { user: req.user }));
app.get('/sign-up', (req, res) => res.render('sign-up-form'));

app.get('/log-out', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    })
});

app.post('/sign-up', async (req, res, next) => {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);  
      await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
          req.body.username,
          hashedPassword,
      ]);
        res.redirect('/');
    } catch(err) {
      console.log(error);
        return next(err);
    };
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    const user = rows[0];

    done(null, user);
  } catch(err) {
    done(err);
  }
});

app.post(
  "/log-in",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/",
    failureMessage: true,
  })
);

app.listen(3000, (error) => {
    if(error) {
        throw error;
    };
    console.log('app is up and running on localhost:3000');
});
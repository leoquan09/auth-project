const path = require('node:path');
const { Pool } = require('pg');
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

app.get('/', (req, res) => res.render('index'));
app.get('/sign-up', (req, res) => res.render('sign-up-form'));

app.post('/sign-up', async (req, res, next) => {
    try {
        await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [
            req.body.username,
            req.body.password,
        ]);
        res.redirect('/');
    } catch(err) {
        return next(err);
    };
});

app.listen(3000, (error) => {
    if(error) {
        throw error;
    };
    console.log('app is up and running on localhost:3000');
});
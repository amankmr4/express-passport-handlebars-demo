// Requiring our models and passport as we've configured it
const express = require('express');
const db = require('../models');
const passport = require('../config/passport');
const router = express.Router();
// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the members page.
// Otherwise the user will be sent an error
router.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.json(req.user);
});

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Sequelize User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error
router.post('/api/signup', (req, res) => {
    db.User.create({
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
    })
        .then((userData) => {
            req.login(userData, () => {
                res.status(201).json(userData);
            });
            // res.redirect(307, '/api/login');
        })
        .catch((err) => {
            res.status(400).json(err);
        });
});

// Route for logging user out
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Route for getting some data about our user to be used client side
router.get('/api/user_data', (req, res) => {
    if (!req.user) {
        // The user is not logged in, send back an empty object
        res.json({});
    } else {
        // Otherwise send back the user's email and id
        // Sending back a password, even a hashed password, isn't a good idea
        res.json({
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            createdAt: req.user.createdAt,
        });
    }
});

module.exports = router;

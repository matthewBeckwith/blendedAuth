const express = require('express');
const router = express.Router();

const firebase = require('../utilities/firebase_setup');
const database = firebase.database();

const checkUser = require('../middleware/checkUser');

router.use(checkUser);

/* GET - ALL Users from DB. */
router.get('/', (req, res) => {
    database.ref('users').once('value').then((snapshot) => {
        let allUsers = [];

        snapshot.forEach(child => {
            allUsers.push({
                ...child.val()
            });
        });
        res.send(allUsers);
    });
});

/* GET - A Single User from DB */
router.get('/:id', (req, res) => {
    database.ref('users').child(req.params.id).once('value', (snapshot) => {
        const user = snapshot.val();
        res.send(user);
    });
});

/* POST - Update User in DB. */
router.post('/updateUser', (req, res) => {
    const data = req.body;
    database.ref(`users/${req.user.profile.id}`).push({
        data
    }, (error) => {
        if (error) {
            res.status(error.status || 500);
            res.render('error');
        } else {
            res.redirect('/dashboard');
        }
    })
});

/* POST - Remove a User from DB. */
router.post('/removeFirebaseUser/:id', (req, res) => {
    database.ref(`users/${req.params.id}`).remove();
    res.redirect('/dashboard');
});

module.exports = router;
const express = require('express');
const router = express.Router();

const firebase = require("../utilities/firebase_setup");
const database = firebase.database();

function checkUser(req, res, next) {
    // database.ref('users').once('value', (snapshot) => {
    //     snapshot.hasChild(req.user.profile.id) ? next() : res.sendStatus(401);
    // });
    const googleUser = req.user.refreshToken.id_token;

    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(googleUser);

            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential).then(() => next()).catch((error) => {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                // The email of the user's account used.
                var email = error.email;
                // The firebase.auth.AuthCredential type that was used.
                var credential = error.credential;
                // ...
                console.error(error);
            });
        } else {
            next();
        }
    });
}

function isUserEqual(googleUser, firebaseUser) {
    if (firebaseUser) {
        var providerData = firebaseUser.providerData;
        for (var i = 0; i < providerData.length; i++) {
            if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
                providerData[i].uid === googleUser) {
                // We don't need to reauth the Firebase connection.
                return true;
            }
        }
    }
    return false;
}

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

/* POST - Add a User to DB. */
router.post('/addUser', (req, res) => {
    const {
        given_name,
        family_name,
        name,
        picture,
        email
    } = req.body;

    database.ref('users').push({
        given_name,
        family_name,
        name,
        picture,
        email
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
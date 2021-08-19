const firebase = require("../utilities/firebase_setup");
const database = firebase.database();

// Check if the Signed-in user is in the Db already.
// - if so, proceed
// - if NOT create a place for the user in the Db
module.exports = (req, res, next) => {
    database.ref('users').once('value', (snapshot) => {
        if (!snapshot.hasChild(req.user.profile.id)) {
            const { displayName, name, photos } = req.user.profile;
            database.ref(`users/${req.user.profile.id}`).set(
                {
                    displayName,
                    name,
                    photos
                }
            )
        }
        next();
    });
}
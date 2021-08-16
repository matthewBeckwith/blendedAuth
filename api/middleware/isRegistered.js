const firebase = require("../utilities/firebase_setup");
const database = firebase.database();

// Check if the Signed-in user is in the Db already.
// - if so, proceed
// - if NOT create a place for the user in the Db
function checkUser(req, res, next) {
    database.ref('users').once('value', (snapshot) => {
        if (!snapshot.hasChild(req.user.profile.id)) {
            const { given_name, family_name, name, picture, email } = req.user._json;
            database.ref(`users/${req.user.profile.id}`).set(
                {
                    given_name,
                    family_name,
                    name,
                    picture,
                    email
                }
            )
        }
        next();
    });
}

module.exports = checkUser;
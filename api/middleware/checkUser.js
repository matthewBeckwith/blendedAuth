
const firebase = require('../utilities/firebase_setup');
const database = firebase.database();

// Check if already authorized to use Firebase,
// if so sign in
// otherwise authorize and then sign in
module.exports = (req, res, next) => {
    const googleUser = req.user.refreshToken.id_token;

    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!isUserEqual(googleUser, firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            var credential = firebase.auth.GoogleAuthProvider.credential(googleUser);

            // Sign in with credential from the Google user.
            firebase.auth().signInWithCredential(credential).then(() => next()).catch((error) => {
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
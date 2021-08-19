const express = require('express');
const router = express.Router();
const { google } = require('googleapis');

/* GET - ALL Drive Files from Google User. */
router.get('/drive', (req, res) => {
    const auth = req.user.profile;
    const drive = google.drive({ version: 'v3', auth });
    drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    }, (err, res) => {
        if (err) return console.log('The API returned an error: ' + err);
        const files = res.data.files;
        if (files.length) {
            console.log('Files:');
            files.map((file) => {
                console.log(`${file.name} (${file.id})`);
            });
        } else {
            console.log('No files found.');
        }
    });
});

module.exports = router;
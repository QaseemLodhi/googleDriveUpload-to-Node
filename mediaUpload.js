'use strict';

const { google } = require('googleapis');
var fs = require('fs');
const drive = google.drive('v2');
const googleAuthentication = require('./googleAuthentication');

function runSamples() {
    drive.files.insert({
        resource: {
            name: 'testimage.jpg',
            mimeType: 'image/jpg'
        },
        media: {
            mimeType: 'image/jpg',
            body: fs.createReadStream('./awsome.jpg')
        },
        auth: googleAuthentication.oAuth2Client
    }, (err, res) => {
        if (err) {
            throw err;
        }
    });
}

const scopes = [
    'https://www.googleapis.com/auth/drive.metadata',
    'https://www.googleapis.com/auth/drive'
];

googleAuthentication.authenticate(scopes, err => {
    if (err) {
        throw err;
    }
    runSamples();
});
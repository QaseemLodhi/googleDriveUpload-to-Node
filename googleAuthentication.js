'use strict';

const {google} = require('googleapis');
const OAuth2Client = google.auth.OAuth2;
const http = require('http');
const url = require('url');
const querystring = require('querystring');
const opn = require('opn');
const nconf = require('nconf');
const path = require('path');
const destroyer = require('server-destroy');

nconf.argv().env()
  .file(path.join(__dirname, 'oauth2.keys.json'));
let keys = nconf.get('web');
if (typeof keys === 'string') {
  keys = JSON.parse(keys);
}

class GoogleAuthentication {
  constructor (options) {
    this._options = options || { scopes: [] };

    this.oAuth2Client = new OAuth2Client(
      keys.client_id,
      keys.client_secret,
      keys.redirect_uris[0]
    );
  }

  authenticate (scopes, callback) {
    this.authorizeUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' ')
    });
    const server = http.createServer((req, res) => {
      if (req.url.indexOf('/oauth2callback') > -1) {
        const qs = querystring.parse(url.parse(req.url).query);
        res.end('Authentication successful! Please return to the console.');
        server.destroy();
        this.oAuth2Client.getToken(qs.code, (err, tokens) => {
          if (err) {
            console.error('Error getting oAuth tokens: ' + err);
            callback(err);
            return;
          }
          this.oAuth2Client.credentials = tokens;
          callback(null, this.oAuth2Client);
        });
      }
    }).listen(3000, () => {
      opn(this.authorizeUrl, {wait: false}).then(cp => cp.unref());
    });
    destroyer(server);
  }
}

module.exports = new GoogleAuthentication();
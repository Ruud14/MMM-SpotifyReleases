'use strict';

const request = require('request-promise-native');
const moment = require('moment');
const XMLHttpRequest = require('xhr2');

const tokenRefreshEndpoint = 'https://accounts.spotify.com/api/token';
const apiEndpoint = "https://api.spotify.com/v1/artists/";
const market = "NL";
const maxAlbumsPerRequest = "5";

module.exports = class SpotifyConnector {

  constructor(payload) {
    this.credentials = payload.credentials;
    this.artists = payload.artists;
    this.tokenExpiresAt = moment();
  }

  retrieveReleases() {
    if (moment().isBefore(this.tokenExpiresAt)) {
      return this.getSpotifyData("1");

    } else {
      return this.refreshAccessToken()
        .then((response) => {
          console.log('Refreshed access token because it has expired. Expired at: %s now is: %s',
            this.tokenExpiresAt.format('HH:mm:ss'), moment().format('HH:mm:ss'));

          this.credentials.accessToken = response.access_token;
          this.tokenExpiresAt = moment().add(response.expires_in, 'seconds');

          return this.getAlbumsOfArtists(this.artists, this.credentials.accessToken)
            .then((response2) =>
            {
              return response2;
            })
        })
        .catch((err) => {
          console.error('Error while refreshing:');
          console.error(err);
        });
    }
  }

  // Get the latest albums from an artist.
  getAlbumsOfArtist(artistID, accessToken) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        var url = apiEndpoint + artistID + "/albums?market=" + market + "&limit=" + maxAlbumsPerRequest; 
        req.overrideMimeType("application/json");
        req.open('GET', url, true);
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "Bearer " + accessToken);
        req.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                var jsonResult = JSON.parse(req.responseText)
                resolve(jsonResult.items);
            } else {
                reject({
                    status: this.status,
                    statusText: req.statusText
                });
            }
        };
        req.onerror = function () {
            reject({
                status: this.status,
                statusText: req.statusText
            });
        };
        req.send();
    });
  }

  // Get the latest albums of multiple artists.
  async getAlbumsOfArtists(artists, accessToken)
  {
    var allAlbums = {};
    for await (const artistID of artists)
    {
        var albums = await this.getAlbumsOfArtist(artistID, accessToken);
        for(const album of albums)
        {
          // Filter duplicate albums. idk why Spotify sometimes returns the same album twice with different IDs...
          var alreadyIn = false;
          for(const duplAlbum of Object.values(allAlbums))
          {
            if((duplAlbum.name === album.name) && (duplAlbum.release_date === album.release_date))
            {
              alreadyIn = true;
            }
          }
          if(alreadyIn === false)
          {
            allAlbums[album.uri] = album;
          }
        }
    }
    return allAlbums;
  }

  // Refresh the spotify access token.
  refreshAccessToken() {
    let client_id = this.credentials.clientID;
    let client_secret = this.credentials.clientSecret;
    let options = {
      url: tokenRefreshEndpoint,
      headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refreshToken
      },
      json: true
    };

    return request.post(options);
  }
};
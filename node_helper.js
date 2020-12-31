/* Magic Mirror
 * Module: MMM-UFO
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');
const SpotifyConnector = require('./SpotifyConnector');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
        this.connector = undefined;
    },


    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
          case 'CONNECT_TO_SPOTIFY':
            this.connector = new SpotifyConnector(payload);
            this.retrieveLatestReleases();
            break;
    
          case 'UPDATE_RELEASES':
            this.retrieveLatestReleases();
            break;
        }
      },
      retrieveLatestReleases: function () {
        this.connector.retrieveReleases()
          .then((response) => {
          if (response) {
              this.sendSocketNotification('RETRIEVED_SONG_DATA', response);
          } else {
              this.sendSocketNotification('RETRIEVED_SONG_DATA', "FAILED!");
          }
          })
          .catch((error) => {
          console.error('Can’t retrieve current song. Reason: ');
          console.error(error);
          });
      },
    
});

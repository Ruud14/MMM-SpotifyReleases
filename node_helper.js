/* Magic Mirror
 * Module: MMM-UFO
 *
 * By Mykle1
 *
 */
const NodeHelper = require('node_helper');
const request = require('request');



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting node_helper for: " + this.name);
    },


    getData: function(payload) {
        var url = payload.url;
        var accessToken = payload.accessToken;
        var artists = payload.artists;
        var allAlbums = [];
        for(const artist_i in artists)
        {
            request({
                url: url,
                method: 'GET',
                headers: {"Accept": "application/json", "Content-Type": "application/json", "Authorization": "Bearer " + accessToken}
            }, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    var result = JSON.parse(body);
                    this.allAlbums.push(...result.items) 
                    this.sendSocketNotification('DATA_RESULT', allAlbums);
                }
                else
                {
                    this.sendSocketNotification('DATA_RESULT', {'error': error, 'response':response});
                }
            });
        }

        //setTimeout(() => { this.sendSocketNotification('DATA_RESULT', allAlbums); }, 1000);

    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === 'GET_DATA') {
            this.getData(payload);
        }
    }
});

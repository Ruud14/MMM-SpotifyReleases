Module.register("MMM-SpotifyReleases", {

    // Module config defaults.
    defaults: {
        useHeader: true, // false if you don't want a header
        header: "New releases from your favorite artists!", // Any text you want
        maxWidth: "500px",
        animationSpeed: 3000, // fade in and out speed
        updateInterval: 60 * 60 * 1000,
        visibleReleasesAmount: 5,
    },

    getStyles: function() {
        return ["MMM-SpotifyReleases.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Get data from config file.
        this.accessToken = this.config.accessToken;
        this.refreshToken = this.config.refreshToken;
        this.client_id = this.config.clientID;
        this.client_secret = this.config.clientSecret;
        this.artists = this.config.artists;
        this.visibleReleasesAmount = this.config.visibleReleasesAmount;

        // List of all albums. 
        // This list is populated after a succesfull spotify api request.
        this.allAlbums = {};

        // put the data in the right format for the socket communation
        this.credentials = {
            clientID: this.client_id,
            clientSecret: this.client_secret,
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
        };


        this.socketSendData = {
            credentials: this.credentials,
            artists: this.artists,
        }
        // Setup the spotify connector.
        this.sendSocketNotification('CONNECT_TO_SPOTIFY', this.socketSendData);

        this.scheduleUpdate();
    },

    getDom: function() {

        // Setup the wrapper.
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        // Show loading text when the spotify api call hasn't been completed yet.
        if (!this.loaded) {
            wrapper.innerHTML = "Loading new releases from your favorite artists...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        // Show the header.
        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var top = document.createElement("div");
        top.classList.add("list-row");
        
        // Sort all albums by releasedate.
        var sortedAlbumList = Object.values(this.allAlbums);
        sortedAlbumList = sortedAlbumList.sort((a, b) => (parseInt(b.release_date.split("-").join("")) - parseInt(a.release_date.split("-").join(""))))
        
        // Show the most recent albums.
        for(const album_i in sortedAlbumList.slice(0, this.visibleReleasesAmount))
        {
            var album = sortedAlbumList[album_i];

            var div = document.createElement("div");
            div.classList.add("xsmall", "bright", "duration", "AlbumCard");

            // Show the release date, title and album/single as a horizontal list.
            var top_list = document.createElement("ul");
            top_list.classList.add("horizontalList");
            // Release date.
            var releaseDate_elem = document.createElement("h10");
            // Calculate the day difference.
            var releaseDate = new Date(album.release_date);
            var today = new Date();
            const diffTime = Math.abs(today - releaseDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            var releaseDateText = "";
            if(diffDays === 0)
                {
                    releaseDateText = "Today";
                }
            else if(diffDays === 1)
                {
                    releaseDateText = "Yesterday";
                }
            else
                {
                    releaseDateText = diffDays.toString() + " days ago.";
                }
            releaseDate_elem.innerText = releaseDateText;
            top_list.appendChild(releaseDate_elem);
            // Album type.
            var albumType_elem = document.createElement("h10");
            albumType_elem.classList.add("AlbumType");
            albumType_elem.innerText = album.album_type;
            top_list.appendChild(albumType_elem);
            // Title.
            var title_elem = document.createElement("h3");
            title_elem.classList.add("AlbumName");
            title_elem.innerText = album.name;
            top_list.appendChild(title_elem);

            div.appendChild(top_list);

            // Show the artists to a horizontal list.
            var artists_elem = document.createElement("ul");
            artists_elem.classList.add("horizontalList");
            for(const artist_i in album.artists)
            {
                var artist = album.artists[artist_i];
                var artist_name = artist.name;
                var artist_elem = document.createElement("li");
                artist_elem.classList.add("Artist");
                artist_elem.innerText = artist_name;
                artists_elem.appendChild(artist_elem);
            }
            div.appendChild(artists_elem);

            wrapper.appendChild(div);
        }
        return wrapper;
		
    },
    
    // Schedules the refreshing of the recent releases.
    scheduleUpdate: function() { 
        setInterval(() => {
            this.sendSocketNotification('UPDATE_RELEASES', this.socketSendData);
        }, this.config.updateInterval);
    	this.sendSocketNotification('UPDATE_RELEASES', this.socketSendData);
        var self = this;
    },

    socketNotificationReceived: function (notification, payload) {
        switch (notification) {
          case 'RETRIEVED_SONG_DATA':
            if(payload !== "FAILED!")
            {
                console.log("Got new data.");
                // Replace the currently showed albums with the new ones.
                this.allAlbums = payload;
                this.updateDom(this.config.animationSpeed);
                this.loaded = true;
            }
        }
      },
});

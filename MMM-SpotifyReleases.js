Module.register("MMM-SpotifyReleases", {

    // Module config defaults.
    defaults: {
		city: "New York",
		state: "NY",
        useHeader: true, // false if you don't want a header
        header: "New releases of your favorite artists!", // Any text you want
        maxWidth: "250px",
        rotateInterval: 30 * 1000,
        animationSpeed: 3000, // fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 60 * 60 * 1000,

    },

    getStyles: function() {
        return ["MMM-SpotifyReleases.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        this.artists = ["7AGSJihqYPhYy5QzMcwcQT", "0caJEGgVuXuSHhhrMCmlkI"];
        this.allAlbums = {};
        this.accessToken = "";
        this.market = "NL";
        this.maxAlbumsPerRequest = "5";
        this.url = "https://api.spotify.com/v1/artists/" + "7AGSJihqYPhYy5QzMcwcQT"+ "/albums?market=" + this.market + "&limit=" + this.maxAlbumsPerRequest;
        this.url_start = "https://api.spotify.com/v1/artists/";
        this.url_end = "/albums?market=" + this.market + "&limit=" + this.maxAlbumsPerRequest;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "Loading new releases of your favorite artists...";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light", "header");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var top = document.createElement("div");
        top.classList.add("list-row");
        
        console.log(this.allAlbums);

        for(var album_uri in this.allAlbums)
        {
            var album = this.allAlbums[album_uri];
            var name = album.name;
            var albumType = album.albumType;
            var releaseDate = album.release_date;
            var totalTracks = album.totalTracks;
            var uri = album.uri;
            var duration = document.createElement("div");
            duration.classList.add("xsmall", "bright", "duration");
            duration.innerHTML = "" + name;
            wrapper.appendChild(duration);
        }
        return wrapper;
		
    },
	
    scheduleUpdate: function() { 
        setInterval(() => {
            this.getRecentAlbums();
        }, this.config.updateInterval);
        this.getRecentAlbums();
        var self = this;
    },

    getAlbumsOfArtist: function(artistID)
    {
        var url = this.url_start + artistID + this.url_end;
        var accessToken = this.accessToken;
        var allAlbums = [];
        var req = new XMLHttpRequest()
        req.overrideMimeType("application/json")
        req.open('GET', url, true)
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "Bearer " + accessToken);
        req.onload  = () => {
            var jsonResult = JSON.parse(req.responseText)
            for(const album_i in jsonResult.items)
            {
                this.allAlbums[jsonResult.items[album_i].uri] = jsonResult.items[album_i];
            }
        }
        req.send();
    },

    getRecentAlbums : function()
    {
        for(const artist_i in this.artists)
        {
            this.getAlbumsOfArtist(this.artists[artist_i]);
        }
        setTimeout(() => {
            this.loaded = true;
            this.updateDom(this.config.animationSpeed);
        }, 1000);
    },

});
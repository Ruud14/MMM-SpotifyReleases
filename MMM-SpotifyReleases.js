Module.register("MMM-SpotifyReleases", {

    // Module config defaults.
    defaults: {
		city: "New York",
		state: "NY",
        useHeader: true, // false if you don't want a header
        header: "New releases of your favorite artists!", // Any text you want
        maxWidth: "400px",
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
        this.accessToken = "BQCKOSgIOKAOqQ33hhdALGagPfb4gWmaa4qWOX1vNK8Zox3rEojZ0iqtyoCINwpNw3V7lKroZV4y0Oh80a10Wc0XiTi9D55o2jtqm0Fwnq82sdLKV72d3qcBn8j6bS8HamAyEZArCO7wy1Q";
        this.market = "NL";
        this.maxAlbumsPerRequest = "5";
        this.visibleReleases = 5;
        this.client_id = "11fb058c676f44e4bce48b554675891a";
        this.client_secret = "0da5127af693432aad40932738590209";
        this.auth_url = "https://accounts.spotify.com/api/token";
        this.url_start = "https://api.spotify.com/v1/artists/";
        this.url_end = "/albums?market=" + this.market + "&limit=" + this.maxAlbumsPerRequest;
        this.scheduleUpdate();
    },

    getDom: function() {

        // Setup the wrapper.
        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        // Show loading text when the spotify api call hasn't been completed yet.
        if (!this.loaded) {
            wrapper.innerHTML = "Loading new releases of your favorite artists...";
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
        for(const album_i in sortedAlbumList.slice(0, this.visibleReleases))
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
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
            releaseDate_elem.innerText = diffDays.toString() + " days ago";
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
            this.getRecentAlbums();
        }, this.config.updateInterval);
        this.authorizeClient();
        this.getRecentAlbums();
        var self = this;
    },

    // Get the most recent albums of the specified artist.
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

    // Get all the recent albums.
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

    getAccessKey: function()
    {
        var url = this.auth_url;
        var req = new XMLHttpRequest()
        req.overrideMimeType("application/json")
        req.open('POST', url, true)
        console.log((this.client_id + ':' + this.client_secret).toString('base64'))

        req.setRequestHeader("Authorization", 'Basic ' + (this.client_id + ':' + this.client_secret).toString('base64'));

        var params = {
            grant_type: "authorization_code",
        };

        req.onload  = () => {
            var jsonResult = req.responseText;
            console.log("RESUULLLTTTT!!");
            console.log(jsonResult);
        }
        req.send(JSON.stringify(data));
    },

    authorizeClient: function()
    {
        var url = "https://accounts.spotify.com/authorize";
        var req = new XMLHttpRequest()
        req.overrideMimeType("application/json")
        req.open('GET', url, true)

        //req.setRequestHeader('Access-Control-Allow-Origin', 'https://accounts.spotify.com/authorize');

        var params = {
            client_id: this.client_id,
            response_type: "code",
            redirect_uri: "http://192.168.178.80:8080",
        }

        req.onload  = () => {
            var jsonResult = req.responseText;
            console.log("AUTHORIZEDDD!!!!!!");
            console.log(jsonResult);
        }

        req.send(JSON.stringify(params));
    }

});
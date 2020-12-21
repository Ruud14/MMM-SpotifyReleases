# MMM-SpotifyReleases

<br>

**A MagicMirror Module that displays recent releases of your favorite Spotify artists.**
<br>


![Image](https://i.ibb.co/7rFQkg3/image.png)

This module depends on the [Spotify API](https://developer.spotify.com/documentation/web-api/). To use this free API we'll be needing a Key. <br>
Don't worry, it isn't difficult to get such a key, the steps below will show you.

**How to install?**

**1.**
In your MagicMirror directory: 

```bash
cd modules
git clone https://github.com/Ruud14/MMM-SpotifyReleases.git
cd MMM-SpotifyReleases
npm install
```
<br>

**2.**
Register this module as an app in the [Spotify developer area](https://developer.spotify.com/dashboard/applications).
Complete the following steps to do so:
- Go to the [Spotify developer area](https://developer.spotify.com/dashboard/applications) 
- login and press the green "Create an app" button in top right corner.
- Fill in the form:
    - App name: MMM-SpotifyReleases
    - Check both checkboxes.
    - Press "Create".
    
The next page that opens shows you your **Client ID** and **Client Secret**. 
We will be needing those later.

- Press the green "Edit Settings" button in top right corner.
- Add the following URL to the 'Redirect URIs': <br> `http://<LOCAL IP OF MIRROR>:8888/callback` where `<LOCAL IP OF MIRROR>` should be replaced with the local IP address of your mirror.

<br>

**3.**
Get your Spotify accessToken and refreshToken. <br>
There are multiple ways of doing this, following the steps below is one of them: <br>
In your MagicMirror directory: 
```bash
cd modules/MMM-SpotifyReleases/Token_Get
node app.js
```
- Now access `http://<LOCAL IP OF MIRROR>:8888`. (where again `<LOCAL IP OF MIRROR>` should be replaced with the local IP address of your mirror.)
- Fill in your client ID and client Secret.
- Press "Generate Access and Refresh token.".
- Log in to Spotify.
- Your **access token** and **refresh token** will be shown after logging in. We will be needing these in the next step.

<br>

**4.**
Get the IDs of your favorite Spotify artists.
- Go to the profile of the artist.
- Click the button with the three dots.
- Click the share button.
- Choose to copy the Spotify-URIs. You'll get something like this: `spotify:artist:246dkjvS1zLTtiykXe5h60`.
- remove 'spotify:artist:' and what is left is the ID of the artist.
<br>

**5.**
Put the following code into MagicMirror/config.js

```javascript
{
    module: 'MMM-SpotifyReleases',
    position: "bottom_left",
    config: {
        header: "New releases of your favorite artists!",
        useHeader: true,
        animationSpeed: 3000,
        updateInterval: 60 * 60 * 1000,
        maxWidth: "500px",
        visibleReleasesAmount: 7,
        accessToken: "<YOUR ACCESSTOKEN>", 
        refreshToken: "<YOUR REFRESHTOKEN>",
        clientID: "<YOUR CLIENT ID>", 
        clientSecret: "<YOUR CLIENT SECRET>",
        artists: [  
            "246dkjvS1zLTtiykXe5h60", // Post Malone
            "6eUKZXaKkcviH0Ku9w2n3V", // Ed Sheeran
        ],
    }
}
```
<br>

| Option  |  Description  |
|---|---|
| `header`  |  Optional `string`<br>The text above the list of releases (See image). |
| `useHeader`  |  Optional `boolean`<br>Whether the header is shown or not. |
| `animationSpeed`  |  Optional `integer`<br>Fade in and out speed. (in ms) |
| `updateInterval`  |  Optional `integer`<br>Time between Spotify API calls. (in ms) |
| `maxWidth`  |  Optional `string`<br> The width of the screen area occupied by the module. |
| `visibleReleasesAmount`  |  Optional `integer`<br> The amount of releases displayed.<br>This is also responsible for the height of the screen area occupied by the module. |
| `accessToken`  |  Required `string`<br>Your access token (From step 3). |
| `refreshToken`  |  Required `string`<br>Your refresh token (From step 3).  |
| `clientID`  |  Required `string`<br>Your client ID (From step 2).  |
| `clientSecret`  |  Required `string`<br>Your client Secret (From step 2).  |
| `artists`  |  Required `list` of `string`s<br>List of all the artist IDs. (From step 4) |

<br>

**Feel free to contact me [here](https://github.com/Ruud14/MMM-SpotifyReleases/issues) if you have any questions, problems, or feature requests.**
<br>

**What I learned:**
- Working with Node.
- Creating a MagicMirror module.






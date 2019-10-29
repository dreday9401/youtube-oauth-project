// Options
const CLIENT_ID = '573613503891-mifofi5cnotl1phjglhgkc87jkeunrme.apps.googleusercontent.com';
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'
];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

// Form submit and change channel
videoForm.addEventListener('submit', e => {
  e.preventDefault();

  const video = videoInput.value;

  getVideo(video);
});

// Load auth2 library
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

// Init API client library and set up sign in listeners
function initClient() {
  gapi.client
    .init({
      discoveryDocs: DISCOVERY_DOCS,
      clientId: CLIENT_ID,
      scope: SCOPES
    })
    .then(() => {
      // Listen for sign in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
      // Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = handleAuthClick;
      signoutButton.onclick = handleSignoutClick;
    });
}

// Update UI sign in state changes
function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    content.style.display = 'block';
    videoContainer.style.display = 'block';
    getVideo(defaultVideo);
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
    content.style.display = 'none';
    videoContainer.style.display = 'none';
  }
}

// Handle login
function handleAuthClick() {
  gapi.auth2.getAuthInstance().signIn();
}

// Handle logout
function handleSignoutClick() {
  gapi.auth2.getAuthInstance().signOut();
}

// Display channel data
function showVideoData(data) {
  const videoData = document.getElementById('video-data');
  videoData.innerHTML = data;
}

// Get channel from API
function getVideo(video) {
  gapi.client.youtube.videos
    .list({
      part: 'snippet,contentDetails,statistics',
      forUsername: video,
      q:'nba games'

    })
    .then(response => {
      console.log(response);
      const video = response.result.items[0];

      const output = `
        <ul class="collection">
          <li class="collection-item">Title: ${video.snippet.title}</li>
          <li class="collection-item">ID: ${video.id}</li>
          <li class="collection-item">Subscribers: ${numberWithCommas(
            video.statistics.subscriberCount
          )}</li>
          <li class="collection-item">Views: ${numberWithCommas(
            video.statistics.viewCount
          )}</li>
          <li class="collection-item">Videos: ${numberWithCommas(
            video.statistics.videoCount
          )}</li>
        </ul>
        <p>${video.snippet.description}</p>
        <hr>
        <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${
          video.snippet.customUrl
        }">Visit Video</a>
      `;
      showVideoData(output);

      const videoId = video.contentDetails.relatedPlaylists.uploads;
      requestVideoPlaylist(videoId);
    })
    .catch(err => alert('No Videos available'));
}

// Add commas to number
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function requestVideoId(VideoId) {
  const requestOptions = {
    videoId: videoId,
    part: 'snippet',
    maxResults: 10
  };

  const request = gapi.client.youtube.playlistItems.list(requestOptions);

  request.execute(response => {
    console.log(response);
    const playListItems = response.result.items;
    if (playListItems) {
      let output = '<br><h4 class="center-align">Latest Videos</h4>';

      // Loop through videos and append output
      playListItems.forEach(item => {
        const videoId = item.snippet.resourceId.videoId;

        output += `
          <div class="col s3">
          <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
          </div>
        `;
      });

      // Output videos
      videoContainer.innerHTML = output;
    } else {
      videoContainer.innerHTML = 'No Uploaded Videos';
    }
  });
}

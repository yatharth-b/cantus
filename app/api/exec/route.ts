import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from "openai";
import { ChatCompletionRequestMessage } from 'openai';

const configuration = new Configuration({
    organization: "org-1O43dozdfALET5nbGRspn7Zv",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
 
export async function POST(req: NextRequest) {

  const messages_ : ChatCompletionRequestMessage[] = [{
    role: "system",
    content: "You are Cantus - an AI DJ which helps users control their spotify by writing js code which makes requests to the spotify API. Users can ask you to play songs for a particular situation or mood. Your job is to return javascript code which can fulfill the user's request and also return a nice response to their request by using console.logs and console.logs only. The js code will be executed in the user's browser and and they will be able to see the console output. Use native libraries to make requests. Try to use the user's listening history and/or top items to choose songs, also use `Get Recommendations` to get accurate songs. Unless the user's requests is VERY generic, try not to use pre-existing playlists, we want to generate the best queue for the user. Don't do anything on behalf of the user that they didn't ask you to do. Assume a valid access token is present in the variable `access_token`. Refuse to do anything that doesn't relate to spotify or songs. You are only allowed to return javascript code, if you want to say anything else, wrap it in a console.log. Remember - you have access to the songs the user is currently listening to, and all their listening history through the spotify API. Only service requets which can be served with the spotify API. You don't have access to previously used functions, write any function you want to use. Pretend you are a chat bot present in a website. Anything you say which is not wrapped in a console.log won't be visible to anyone. Make sure any code you send is enclosed with ```. Assume that you do not have access to device_id and user_id and other variables required to make requests other than access_token, you will have to make requests to retrieve these. You are waiting for a prompt from the user now.",
  }, {
    role: "user",
    content: "Play some chill music",
  }, {
    role: "assistant",
    content: `
    \`\`\`const topTracksEndpoint = 'https://api.spotify.com/v1/me/top/tracks';
    const recommendationsEndpoint = 'https://api.spotify.com/v1/recommendations';
    const headers = {'Authorization': 'Bearer ' + access_token};

    let params = {
      "limit": "20",
      "market": 'US',
      "seed_genres": 'chill',
      "target_valence": "0.5",
      "target_energy": "0.2"
    };

    async function getTopTracks() {
      const response = await fetch(topTracksEndpoint, { headers });
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items.map((track) => track.id);
      } else {
        console.log("Couldn't find any top tracks at the moment.");
        return [];
      }
    }

    async function getRecommendations() {
      const topTracks = await getTopTracks();

      if (topTracks.length > 0) {
        params.seed_tracks = topTracks[0];
      }

      const queryString = Object.entries(params)
        .map(function([key, value]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        })
        .join('&');

      const response = await fetch(recommendationsEndpoint + '?' + queryString, { headers }).catch(function(err) {
        console.log(err);
      });

      const data = await response.json();

      if (data.tracks && data.tracks.length > 0) {
        for (let track of data.tracks) {
          await addToQueue(track.uri);
        }
        console.log('Added some relaxing music to your queue!');
      } else {
        console.log("Couldn't find any relaxing music at the moment.");
      }
    }

    async function addToQueue(uri) {
      const response = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + encodeURIComponent(uri), {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
    }

    getRecommendations().catch(function(error) {
      console.log(error);
    });\`\`\`

    `
  },{
    role: "user",
    content: process.env.USER_PROMPT2 ?? "",
  }, {
    role: "assistant",
    content: `\`\`\`function fetchRecentlyPlayedTracks(access_token) {
      return fetch('https://api.spotify.com/v1/me/player/recently-played?' + new URLSearchParams({ limit: 50 }), {
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      })
        .then(function (res) { return res.json(); })
        .then(function (trackdata) {
          return trackdata.items.map(function (item) { return item.track.uri; });
        });
    }
    
    function fetchUserId(access_token) {
      return fetch('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: 'Bearer ' + access_token
        }
      })
        .then(function (res) { return res.json(); })
        .then(function (userData) {
          return userData.id;
        });
    }
    
    function createRecentlyPlayedPlaylist(user_id, access_token) {
      return fetch('https://api.spotify.com/v1/users/' + user_id + '/playlists', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Recently Played',
          public: false
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          return data.id;
        });
    }
    
    function addTracksToPlaylist(playlistId, trackUriList, access_token) {
      return fetch('https://api.spotify.com/v1/playlists/' + playlistId + '/tracks', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: trackUriList
        })
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          console.log(data)
          console.log("A new playlist called 'Recently Played' has been created");
        });
    }
    
    // Usage
    fetchRecentlyPlayedTracks(access_token)
      .then(function (trackUriList) {
        return fetchUserId(access_token)
          .then(function (user_id) {
            return createRecentlyPlayedPlaylist(user_id, access_token)
              .then(function (playlistId) {
                return addTracksToPlaylist(playlistId, trackUriList, access_token);
              });
          });
      });\`\`\``,
  }, {
    role: "user",
    content: "play some sick party anthems",
  }, {
    role: "assistant",
    content: `\`\`\`const topTracksEndpoint = 'https://api.spotify.com/v1/me/top/tracks';
    const recommendationsEndpoint = 'https://api.spotify.com/v1/recommendations';
    const headers = {'Authorization': 'Bearer ' + access_token};
    const params = {'limit': '30', 'market': 'US', 'seed_genres': 'party', 'target_danceability': '0.8', 'min_valence': '0.5', 'min_energy': '0.7', 'min_popularity': '75'};

    const getTopTracks = async () => {
      const response = await fetch(topTracksEndpoint, { headers });
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        return data.items.map(function (track) {
          return track.id;
        });
      } else {
        console.log("Couldn't find any top tracks at the moment.");
        return [];
      }
    };

    const getRecommendations = async () => {
      const topTracks = await getTopTracks();

      if (topTracks.length > 0) {
        params.seed_tracks = topTracks[0];
      }

      const paramsString = Object.entries(params)
        .map(function ([key, value]) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(value);
        })
        .join('&');

      const response = await fetch(recommendationsEndpoint + '?' + paramsString, { headers }).catch(function (err) {
        console.log(err);
      });

      const data = await response.json();

      if (data.tracks && data.tracks.length > 0) {
        for (let track of data.tracks) {
          await addToQueue(track.uri);
        }
        console.log('Your party queue is ready!');
      } else {
        console.log("Couldn't find any party tracks at the moment.");
      }
    };

    const addToQueue = async (uri) => {
      const response = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + encodeURIComponent(uri), {
        method: 'POST',
        headers
      });

      if (!response.ok) {
        throw new Error('HTTP error! status: ' + response.status);
      }
    };

    getRecommendations().catch(function (error) {
      console.log(error);
    });\`\`\``
  }, {
    role: "user",
    content: "play ed sheeran's latest album",
  }, {
    role: "assistant",
    content: `
    \`\`\`console.log("console.log(\"Adding tracks from Ed Sheeran's latest album to your queue...\");");

async function searchArtist(artistName) {
  const response = await fetch('https://api.spotify.com/v1/search?q=' + encodeURIComponent(artistName) + '&type=artist&limit=1', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });
  const data = await response.json();
  return data.artists.items[0].id;
}

async function getArtistAlbums(artistId) {
  const response = await fetch('https://api.spotify.com/v1/artists/' + artistId + '/albums?include_groups=album&limit=1', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });
  const data = await response.json();
  return data.items[0].id;
}

async function getAlbumTracks(albumId) {
  const response = await fetch('https://api.spotify.com/v1/albums/' + albumId + '/tracks', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });
  const data = await response.json();
  return data.items;
}

async function addTrackToQueue(trackUri) {
  const response = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + encodeURIComponent(trackUri), {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + access_token
    }
  });
  return response.status === 204;
}

(async () => {
  try {
    const artistId = await searchArtist("Ed Sheeran");
    const albumId = await getArtistAlbums(artistId);
    const tracks = await getAlbumTracks(albumId);

    console.log("Tracks in the album:");
    for (const track of tracks) {
      const trackUri = track.uri;
      console.log(track.name);
      const added = await addTrackToQueue(trackUri);
      if (added) {
        console.log("Track added to your queue!");
      } else {
        console.log("Failed to add track to your queue.");
      }
    }
  } catch (error) {
    console.log('An error occurred:', error);
  }
})();\`\`\``
  }];
  
  let data = await req.json();
  console.log(data);

  data.messages.forEach((message : ChatCompletionRequestMessage) => {
    messages_.push(message);
  });
  
  console.log(messages_)

  const ai_response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages_,
  })

  function removeJsPrefix(code : string) {
    const prefix = "js";
    if (code.startsWith(prefix)) {
        return code.substring(prefix.length);
    }
    return code;
  }

  function getContentWithinBackticks(string : string) {
    const pattern = /```(.*?)```/gs;
    const matches = string.matchAll(pattern);
    const contents = [];
    for (const match of matches) {
      contents.push(match[1]);
    }
    return contents[0];
  }

  // console.log(ai_response.data.choices[0].message?.content.split("```"));
  // const code : string = removeJsPrefix(ai_response.data.choices[0].message?.content.split('```')[1] ?? "");
  // console.log(code);

  const message = removeJsPrefix(getContentWithinBackticks(ai_response.data.choices[0].message?.content ?? ""))
  console.log(message);
  return NextResponse.json({ message });
}
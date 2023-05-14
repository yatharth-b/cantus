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
    content: process.env.SYS_PROMPT ?? "",
  }, {
    role: "user",
    content: process.env.USER_PROMPT ?? "",
  }, {
    role: "assistant",
    content: "const topTracksEndpoint = 'https://api.spotify.com/v1/me/top/tracks';const recommendationsEndpoint = 'https://api.spotify.com/v1/recommendations';const headers = {'Authorization': `Bearer ${access_token}`};let params = {\"limit\": \"20\",\"market\": 'US',\"seed_genres\": 'chill',\"target_valence\": \"0.5\",\"target_energy\": \"0.2\"};async function getTopTracks() {const response = await fetch(topTracksEndpoint, { headers });const data = await response.json();if (data.items && data.items.length > 0) {return data.items.map((track) => track.id);} else {console.log(\"Couldn't find any top tracks at the moment.\");return [];}}async function getRecommendations() {const topTracks = await getTopTracks();if (topTracks.length > 0) {params.seed_tracks = topTracks[0];}const response = await fetch(`${recommendationsEndpoint}?${new URLSearchParams(params)}`, { headers }).catch((err) => {console.log(err);});const data = await response.json();if (data.tracks && data.tracks.length > 0) {for (let track of data.tracks) {await addToQueue(track.uri);}console.log('Added some relaxing music to your queue!');} else {console.log(\"Couldn't find any relaxing music at the moment.\");}}async function addToQueue(uri) {const response = await fetch(`https://api.spotify.com/v1/me/player/queue?uri=${uri}`, {method: \"POST\",headers});if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}}getRecommendations().catch(error => console.log(error));",
  }, {
    role: "user",
    content: process.env.USER_PROMPT2 ?? "",
  }, {
    role: "assistant",
    content: "fetch(`https://api.spotify.com/v1/me/player/recently-played?${new URLSearchParams({ limit: 50 })}`, { headers: { Authorization: `Bearer \$\{access_token\}` } }).then(res => res.json()).then(data => fetch(`https://api.spotify.com/v1/users/\$\{user_id\}/playlists`, { method: 'POST', headers: { Authorization: `Bearer \$\{access_token\}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Recently Played', public: false }) })).then(res => res.json()).then(data => fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, { method: 'POST', headers: { Authorization: `Bearer \$\{access_token\}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ uris: data.items.map(item => item.track.uri) }) })).then(res => console.log(`A new playlist called 'Recently Played' has been created with \$\{res.uris.length\} songs.`));",
  }, {
    role: "user",
    content: "play some sick party anthems",
  }, {
    role: "assistant",
    content: "const topTracksEndpoint = 'https://api.spotify.com/v1/me/top/tracks'; const recommendationsEndpoint = 'https://api.spotify.com/v1/recommendations'; const headers = {'Authorization': 'Bearer ' + access_token}; const params = {'limit': '30', 'market': 'US', 'seed_genres': 'party', 'target_danceability': '0.8', 'min_valence': '0.5', 'min_energy': '0.7', 'min_popularity': '75'}; const getTopTracks = async () => { const response = await fetch(topTracksEndpoint, { headers }); const data = await response.json(); if (data.items && data.items.length > 0) { return data.items.map(function (track) { return track.id; }); } else { console.log('Couldn\\'t find any top tracks at the moment.'); return []; } }; const getRecommendations = async () => { const topTracks = await getTopTracks(); if (topTracks.length > 0) { params.seed_tracks = topTracks[0]; } const response = await fetch(recommendationsEndpoint + '?' + new URLSearchParams(params), { headers }).catch(function (err) { console.log(err); }); const data = await response.json(); if (data.tracks && data.tracks.length > 0) { for (let track of data.tracks) { await addToQueue(track.uri); } console.log('Your party queue is ready!'); } else { console.log('Couldn\\'t find any party tracks at the moment.'); } }; const addToQueue = async (uri) => { const response = await fetch('https://api.spotify.com/v1/me/player/queue?uri=' + uri, { method: 'POST', headers }); if (!response.ok) { throw new Error('HTTP error! status: ' + response.status); } }; getRecommendations().catch(function (error) { console.log(error); });"
  }];
  
  // req.json().then((data) => {
  //   console.log(data);
  // });
  
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
  console.log(ai_response.data.choices[0].message?.content)
  // console.log(ai_response.data.choices[0].message?.content.split("```"));
  // const code : string = removeJsPrefix(ai_response.data.choices[0].message?.content.split('```')[1] ?? "");
  // console.log(code);
  return NextResponse.json({ message: ai_response.data.choices[0].message?.content});
}
import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let data = await req.json();

  let resp : any = {}

  const bodyParams = new URLSearchParams();
  bodyParams.append('code', data.code);
  bodyParams.append('redirect_uri', 'https://cantus.fly.dev/callback');
  bodyParams.append('grant_type', 'authorization_code');
  
  const ret = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Authorization" : 'Basic ' + Buffer.from("49fc19d81cdb43dca2e0b0b2f0ee1a0d" + ':' + process.env.SPOTIFY_SECRET).toString('base64')
    },
    body: bodyParams.toString()
  })

  console.log(ret)

  const js = await ret.json()

  console.log(js)

  return NextResponse.json({
    accessToken: js.access_token,
    refreshToken: js.refresh_token
  });
}
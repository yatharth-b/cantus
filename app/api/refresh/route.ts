import { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  let data = await req.json();
  var refresh_token = data.refresh_token;

  const searchParams = new URLSearchParams();
  searchParams.append('grant_type', 'refresh_token');
  searchParams.append('refresh_token', refresh_token);

  const ret = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from('49fc19d81cdb43dca2e0b0b2f0ee1a0d' + ':' + process.env.SPOTIFY_SECRET).toString('base64')
    },
    body: searchParams.toString()
  });

  const js = await ret.json()
  console.log(js)
  return NextResponse.json({
    accessToken: js.access_token,
  });
}
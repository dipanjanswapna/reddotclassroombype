
import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { updateUser } from '@/lib/firebase/firestore';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/calendar.events'
];

async function handleAuth(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: userId, // Pass userId in state to identify user in callback
        prompt: 'consent', // Force consent screen to get refresh token
    });
    return NextResponse.redirect(url);
}

async function handleCallback(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // Retrieve userId from state
    const userId = state;

    if (!code || !userId) {
        return NextResponse.redirect('/student/planner?error=auth_failed');
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);
        
        // Save tokens to the user's document in Firestore
        await updateUser(userId, {
            googleCalendarTokens: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token!,
                expiryDate: tokens.expiry_date!,
            }
        });
        
        return NextResponse.redirect('/student/planner?success=sync_enabled');
    } catch (error) {
        console.error('Error getting tokens:', error);
        return NextResponse.redirect('/student/planner?error=token_failed');
    }
}


export async function GET(
  req: NextRequest,
  { params }: { params: { route: string[] } }
) {
  const route = params.route[0];

  if (route === 'auth') {
    return handleAuth(req);
  } else if (route === 'callback') {
    return handleCallback(req);
  } else {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
}

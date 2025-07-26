

import { getAuth } from 'firebase/auth';
import { getFirebaseApp } from './config';
// A server-side helper to get the current user.
// NOTE: This will only work in server components that are part of a dynamic route.
// For static routes, the user will always be null during build time.
// Using this in a client component will result in an error.

let authInstance: ReturnType<typeof getAuth> | null = null;

export const getAuthInstance = () => {
    const app = getFirebaseApp();
    if (!app) {
        return null;
    }
    if (!authInstance) {
        authInstance = getAuth(app);
    }
    return authInstance;
}

export const getCurrentUser = async () => {
    const auth = getAuthInstance();
    if (!auth) {
        // This might happen during build time or if Firebase is not configured.
        return null;
    }
    // This relies on the server maintaining auth state, which might not be the case
    // in all environments. A more robust solution might involve validating a session cookie.
    return auth.currentUser;
}


import { auth } from './config';
// A server-side helper to get the current user.
// NOTE: This will only work in server components that are part of a dynamic route.
// For static routes, the user will always be null during build time.
// Using this in a client component will result in an error.
export const getCurrentUser = async () => {
    return auth.currentUser;
}

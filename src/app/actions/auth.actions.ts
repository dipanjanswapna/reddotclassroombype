

'use server';

import 'dotenv/config';

import {
    getAuthInstance,
} from '@/lib/firebase/config';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    signInWithPopup,
    FacebookAuthProvider,
} from 'firebase/auth';

export async function signUpWithEmail(email: string, pass: string) {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    return createUserWithEmailAndPassword(auth, email, pass);
}

export async function signInWithEmail(email: string, pass: string) {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    return signInWithEmailAndPassword(auth, email, pass);
}

export async function signInWithGoogle() {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
}

export async function signInWithFacebook() {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    const provider = new FacebookAuthProvider();
    return signInWithPopup(auth, provider);
}

export async function logOut() {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    return signOut(auth);
}

export async function resetPassword(email: string) {
    const auth = getAuthInstance();
    if (!auth) {
        throw new Error('Authentication service is not available.');
    }
    return sendPasswordResetEmail(auth, email);
}


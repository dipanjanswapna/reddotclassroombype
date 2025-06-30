
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { 
    onAuthStateChanged, 
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/config';
import { getUserByUid } from '@/lib/firebase/firestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/lib/types';

interface AuthContextType {
    user: FirebaseUser | null;
    userInfo: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithFacebook: () => Promise<any>;
    signup: (email: string, pass: string, name: string, role: User['role']) => Promise<any>;
    logout: () => void;
    resetPassword: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const roleRedirects: Record<User['role'], string> = {
    Student: '/student/dashboard',
    Teacher: '/teacher/dashboard',
    Guardian: '/guardian/dashboard',
    Admin: '/admin/dashboard',
    Partner: '/partner/dashboard',
    Affiliate: '/affiliate/dashboard',
    Moderator: '/moderator/dashboard',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUser(user);
                const fetchedUserInfo = await getUserByUid(user.uid);
                setUserInfo(fetchedUserInfo);
            } else {
                setUser(null);
                setUserInfo(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (!loading && user && userInfo) {
            router.push(roleRedirects[userInfo.role] || '/');
        }
    }, [userInfo, loading, user, router]);


    const login = (email: string, pass: string) => {
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const existingUserInfo = await getUserByUid(user.uid);
        if (!existingUserInfo) {
            const newUserInfo: Omit<User, 'id'> = {
                uid: user.uid,
                name: user.displayName || 'New User',
                email: user.email!,
                role: 'Student', // Default role for social sign-in
                status: 'Active',
                joined: serverTimestamp(),
            };
            await setDoc(doc(db, "users", user.uid), newUserInfo);
            setUserInfo({ ...newUserInfo, id: user.uid } as User);
        }
    }
    
    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await handleSocialLogin(provider);
    };

    const loginWithFacebook = async () => {
        const provider = new FacebookAuthProvider();
        await handleSocialLogin(provider);
    };
    
    const signup = async (email: string, pass: string, name: string, role: User['role']) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        const newUserInfo: Omit<User, 'id'> = {
            uid: newUser.uid,
            name: name,
            email: email,
            role: role,
            status: 'Active',
            joined: serverTimestamp(),
        };

        await setDoc(doc(db, "users", newUser.uid), newUserInfo);
        return userCredential;
    };

    const logout = () => {
        signOut(auth).then(() => {
            router.push('/login');
        });
    };

    const resetPassword = (email: string) => {
        return sendPasswordResetEmail(auth, email);
    }


    const value = {
        user,
        userInfo,
        loading,
        login,
        loginWithGoogle,
        loginWithFacebook,
        signup,
        logout,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

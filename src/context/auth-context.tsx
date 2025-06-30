
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
    login: (email: string, pass: string, role?: User['role']) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithFacebook: () => Promise<any>;
    signup: (email: string, pass: string, name: string, role: User['role'], status?: User['status']) => Promise<any>;
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
        if (!loading && user && userInfo && userInfo.status === 'Active') {
            router.push(roleRedirects[userInfo.role] || '/');
        }
    }, [userInfo, loading, user, router]);


    const login = async (email: string, pass: string, role?: User['role']) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        
        let fetchedUserInfo = await getUserByUid(userCredential.user.uid);

        if (!fetchedUserInfo && email === 'dipanjanswapnaprangon@gmail.com') {
             const newUserInfo: Omit<User, 'id'> = {
                uid: userCredential.user.uid,
                name: "RDC Admin",
                email: email,
                avatarUrl: `https://placehold.co/100x100.png?text=RA`,
                role: 'Admin',
                status: 'Active',
                joined: serverTimestamp(),
            };
            await setDoc(doc(db, "users", userCredential.user.uid), newUserInfo);
            fetchedUserInfo = { ...newUserInfo, id: userCredential.user.uid } as User;
        }

        if (!fetchedUserInfo) {
            await signOut(auth);
            throw new Error("Your user profile could not be found. Please contact support.");
        }

        if (role && fetchedUserInfo.role !== role) {
            await signOut(auth);
            throw new Error(`Access Denied: This is a '${fetchedUserInfo.role}' account. Please log in with the correct role or tab.`);
        }

        if (fetchedUserInfo.status !== 'Active') {
            await signOut(auth);
            const statusMessage = fetchedUserInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval. You will be notified once it's reviewed."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }
        
        setUserInfo(fetchedUserInfo);
        return userCredential;
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
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=${(user.displayName || 'U').split(' ').map(n=>n[0]).join('')}`,
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
        try {
            await handleSocialLogin(provider);
        } catch (err: any) {
             if (err.code !== 'auth/popup-closed-by-user') {
                throw err;
            }
        }
    };

    const loginWithFacebook = async () => {
        const provider = new FacebookAuthProvider();
        try {
            await handleSocialLogin(provider);
        } catch (err: any) {
             if (err.code !== 'auth/popup-closed-by-user') {
                throw err;
            }
        }
    };
    
    const signup = async (email: string, pass: string, name: string, role: User['role'], status: User['status'] = 'Active') => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        const newUserInfo: Omit<User, 'id'> = {
            uid: newUser.uid,
            name: name,
            email: email,
            avatarUrl: newUser.photoURL || `https://placehold.co/100x100.png?text=${name.split(' ').map(n=>n[0]).join('')}`,
            role: role,
            status: status,
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

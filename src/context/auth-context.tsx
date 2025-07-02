

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
import { getUserByUid, getHomepageConfig, getUserByClassRoll } from '@/lib/firebase/firestore';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { User } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
    user: FirebaseUser | null;
    userInfo: User | null;
    loading: boolean;
    login: (email: string, pass: string, role?: User['role']) => Promise<any>;
    loginWithClassRoll: (classRoll: string, pass: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithFacebook: () => Promise<any>;
    signup: (email: string, pass: string, name: string, role: User['role'], status?: User['status']) => Promise<any>;
    logout: () => void;
    resetPassword: (email: string) => Promise<any>;
    refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function generateRollNumber(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateRegistrationNumber(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    const fetchAndSetUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            const fetchedUserInfo = await getUserByUid(firebaseUser.uid);
            setUserInfo(fetchedUserInfo);
        } else {
            setUser(null);
            setUserInfo(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, fetchAndSetUser);
        return () => unsubscribe();
    }, [fetchAndSetUser]);
    
    const refreshUserInfo = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setLoading(true);
            await fetchAndSetUser(currentUser);
        }
    }, [fetchAndSetUser]);

    const redirectToHome = (title: string, description: string) => {
        toast({ title, description });
        setTimeout(() => router.push('/'), 1500);
    };

    const login = async (email: string, pass: string, role?: User['role']) => {
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
        
        if (role && role !== 'Admin' && !config.platformSettings[role]?.loginEnabled) {
            throw new Error(`Logins for the '${role}' role are temporarily disabled by the administrator.`);
        }

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
        
        // Normalize 'Partner' role to 'Seller' for backward compatibility
        if ((fetchedUserInfo.role as any) === 'Partner') {
            fetchedUserInfo.role = 'Seller';
        }

        if (fetchedUserInfo.role !== 'Admin' && !config.platformSettings[fetchedUserInfo.role]?.loginEnabled) {
            await signOut(auth);
            throw new Error(`Logins for your role ('${fetchedUserInfo.role}') are temporarily disabled.`);
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
        redirectToHome('Login Successful!', `Welcome back, ${fetchedUserInfo.name}. Redirecting...`);
        return userCredential;
    };

    const loginWithClassRoll = async (classRoll: string, pass: string) => {
        const studentInfo = await getUserByClassRoll(classRoll);
        if (!studentInfo) {
            throw new Error("No student found with this class roll.");
        }
        if (studentInfo.role !== 'Student') {
            throw new Error("This login method is for students only.");
        }
    
        // Now use the found email to sign in
        const userCredential = await signInWithEmailAndPassword(auth, studentInfo.email, pass);
    
        // Reuse existing post-login logic
        if (studentInfo.status !== 'Active') {
            await signOut(auth);
            const statusMessage = studentInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }
    
        setUserInfo(studentInfo);
        redirectToHome('Login Successful!', `Welcome back, ${studentInfo.name}. Redirecting...`);
        return userCredential;
    };

    const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
    
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let existingUserInfo = await getUserByUid(user.uid);
        
        if (existingUserInfo) {
            // This is a login
            if (existingUserInfo.role !== 'Admin' && !config.platformSettings[existingUserInfo.role]?.loginEnabled) {
                await signOut(auth);
                throw new Error(`Logins for your role ('${existingUserInfo.role}') are temporarily disabled.`);
            }
             if (existingUserInfo.status !== 'Active') {
                await signOut(auth);
                throw new Error("Your account is not active. Please contact support.");
            }
        } else {
            // This is a signup
            if (!config.platformSettings['Student']?.signupEnabled) {
                await signOut(auth);
                throw new Error("Student registrations are temporarily disabled.");
            }
            const newUserInfo: Omit<User, 'id'> = {
                uid: user.uid,
                name: user.displayName || 'New User',
                email: user.email!,
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=${(user.displayName || 'U').split(' ').map(n=>n[0]).join('')}`,
                role: 'Student', // Default role for social sign-in
                status: 'Active',
                joined: serverTimestamp(),
                classRoll: generateRollNumber(),
                registrationNumber: generateRegistrationNumber(),
            };
            await setDoc(doc(db, "users", user.uid), newUserInfo);
            existingUserInfo = { ...newUserInfo, id: user.uid } as User;
        }

        setUserInfo(existingUserInfo);
        redirectToHome('Login Successful!', `Welcome back, ${existingUserInfo.name}. Redirecting...`);
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
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
        if (role !== 'Admin' && !config.platformSettings[role]?.signupEnabled) {
            throw new Error(`Registrations for the '${role}' role are temporarily disabled.`);
        }

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

        if (role === 'Student') {
            newUserInfo.classRoll = generateRollNumber();
            newUserInfo.registrationNumber = generateRegistrationNumber();
        }

        await setDoc(doc(db, "users", newUser.uid), newUserInfo);

        if (status === 'Active') {
            setUserInfo({ ...newUserInfo, id: newUser.uid } as User);
            redirectToHome('Account Created!', `Welcome, ${name}. Redirecting...`);
        }

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
        loginWithClassRoll,
        loginWithGoogle,
        loginWithFacebook,
        signup,
        logout,
        resetPassword,
        refreshUserInfo,
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

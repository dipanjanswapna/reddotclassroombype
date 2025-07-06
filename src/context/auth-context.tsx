
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
import { getUserByUid, getHomepageConfig, getUserByClassRoll, updateUser } from '@/lib/firebase/firestore';
import { doc, setDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { User } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { generateRollNumber, generateRegistrationNumber } from '@/lib/utils';

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
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            fetchAndSetUser(firebaseUser);
        });

        return () => unsubscribeAuth();
    }, [fetchAndSetUser]);
    
    // Single device login listener
    useEffect(() => {
        if (!userInfo || userInfo.role !== 'Student') {
            return;
        }

        const userDocRef = doc(db, 'users', userInfo.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data() as User;
                const dbSessionId = userData.currentSessionId;
                const clientSessionId = localStorage.getItem('rdc_session_id');

                if (dbSessionId && clientSessionId && dbSessionId !== clientSessionId) {
                    console.warn('New login detected from another device. Logging out this session.');
                    toast({
                        title: 'Logged Out',
                        description: 'You have been logged out because your account was accessed from another device.',
                        variant: 'destructive',
                        duration: 5000,
                    });
                    logout();
                }
            }
        });

        return () => unsubscribeFirestore();
    }, [userInfo]);

    const refreshUserInfo = useCallback(async () => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setLoading(true);
            await fetchAndSetUser(currentUser);
        }
    }, [fetchAndSetUser]);
    
    const getDashboardLink = (role: User['role']) => {
        switch (role) {
            case 'Student': return '/student/dashboard';
            case 'Teacher': return '/teacher/dashboard';
            case 'Guardian': return '/guardian/dashboard';
            case 'Admin': return '/admin/dashboard';
            case 'Seller': return '/seller/dashboard';
            case 'Affiliate': return '/affiliate/dashboard';
            case 'Moderator': return '/moderator/dashboard';
            default: return '/';
        }
    };
    
    const redirectToDashboard = (userInfo: User, title: string) => {
        toast({ title, description: `Welcome back, ${userInfo.name}. Redirecting...` });
        const dashboardUrl = getDashboardLink(userInfo.role);
        router.push(dashboardUrl);
    };

    const handleStudentLoginSession = async (uid: string) => {
        const newSessionId = uuidv4();
        await updateDoc(doc(db, 'users', uid), {
            currentSessionId: newSessionId,
            lastLoginAt: serverTimestamp(),
        });
        localStorage.setItem('rdc_session_id', newSessionId);
    };

    const login = async (email: string, pass: string, role?: User['role']) => {
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
        
        if (role && (role as any) === 'Partner') {
            role = 'Seller';
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
        
        const isInvalidRegNo = fetchedUserInfo.role !== 'Guardian' &&
                               fetchedUserInfo.status === 'Active' &&
                               (!fetchedUserInfo.registrationNumber || !/^\d{8}$/.test(String(fetchedUserInfo.registrationNumber)));

        if (isInvalidRegNo) {
            const newRegNumber = generateRegistrationNumber();
            await updateUser(fetchedUserInfo.id!, { registrationNumber: newRegNumber });
            fetchedUserInfo.registrationNumber = newRegNumber; // Update local object immediately
        }
        
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
        
        if (fetchedUserInfo.role === 'Student') {
            await handleStudentLoginSession(fetchedUserInfo.uid);
        }

        setUserInfo(fetchedUserInfo);
        redirectToDashboard(fetchedUserInfo, 'Login Successful!');
        return userCredential;
    };

    const loginWithClassRoll = async (classRoll: string, pass: string) => {
        let studentInfo = await getUserByClassRoll(classRoll);
        if (!studentInfo) {
            throw new Error("No student found with this class roll.");
        }
        if (studentInfo.role !== 'Student') {
            throw new Error("This login method is for students only.");
        }
    
        const userCredential = await signInWithEmailAndPassword(auth, studentInfo.email, pass);
    
        if (studentInfo.status !== 'Active') {
            await signOut(auth);
            const statusMessage = studentInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }
    
        const isInvalidRegNo = studentInfo.role !== 'Guardian' &&
                               (!studentInfo.registrationNumber || !/^\d{8}$/.test(String(studentInfo.registrationNumber)));

        if (isInvalidRegNo) {
            const newRegNumber = generateRegistrationNumber();
            await updateUser(studentInfo.id!, { registrationNumber: newRegNumber });
            studentInfo.registrationNumber = newRegNumber; // Update local object
        }

        await handleStudentLoginSession(studentInfo.uid);
        setUserInfo(studentInfo);
        redirectToDashboard(studentInfo, 'Login Successful!');
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
            const isInvalidRegNo = existingUserInfo.role !== 'Guardian' &&
                                         existingUserInfo.status === 'Active' &&
                                         (!existingUserInfo.registrationNumber || !/^\d{8}$/.test(String(existingUserInfo.registrationNumber)));

            if (isInvalidRegNo) {
                const newRegNumber = generateRegistrationNumber();
                await updateUser(existingUserInfo.id!, { registrationNumber: newRegNumber });
                existingUserInfo.registrationNumber = newRegNumber; // Update local object
            }

            if (existingUserInfo.role !== 'Admin' && !config.platformSettings[existingUserInfo.role]?.loginEnabled) {
                await signOut(auth);
                throw new Error(`Logins for your role ('${existingUserInfo.role}') are temporarily disabled.`);
            }
             if (existingUserInfo.status !== 'Active') {
                await signOut(auth);
                throw new Error("Your account is not active. Please contact support.");
            }

            if (user.photoURL && (!existingUserInfo.avatarUrl || existingUserInfo.avatarUrl.includes('placehold.co'))) {
                await updateDoc(doc(db, "users", user.uid), { avatarUrl: user.photoURL });
                existingUserInfo.avatarUrl = user.photoURL;
            }
        } else {
            if (!config.platformSettings['Student']?.signupEnabled) {
                await signOut(auth);
                throw new Error("Student registrations are temporarily disabled.");
            }
            
            const searchParams = new URLSearchParams(window.location.search);
            const ref = searchParams.get('ref');
            const newSessionId = uuidv4();
            const roll = generateRollNumber();

            const newUserInfo: Omit<User, 'id'> = {
                uid: user.uid,
                name: user.displayName || 'New User',
                email: user.email!,
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=${(user.displayName || 'U').split(' ').map(n=>n[0]).join('')}`,
                role: 'Student',
                status: 'Active',
                joined: serverTimestamp(),
                classRoll: roll,
                offlineRollNo: roll,
                registrationNumber: generateRegistrationNumber(),
                currentSessionId: newSessionId,
                lastLoginAt: serverTimestamp(),
                ...(ref && { referredBy: ref }),
            };
            await setDoc(doc(db, "users", user.uid), newUserInfo);
            existingUserInfo = { ...newUserInfo, id: user.uid } as User;
            localStorage.setItem('rdc_session_id', newSessionId);
        }

        if (existingUserInfo.role === 'Student') {
            await handleStudentLoginSession(existingUserInfo.uid);
        }

        setUserInfo(existingUserInfo);
        redirectToDashboard(existingUserInfo, 'Login Successful!');
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

        const searchParams = new URLSearchParams(window.location.search);
        const ref = searchParams.get('ref');

        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
        const newUser = userCredential.user;

        const newSessionId = uuidv4();
        const newUserInfo: Omit<User, 'id'> = {
            uid: newUser.uid,
            name: name,
            email: email,
            avatarUrl: newUser.photoURL || `https://placehold.co/100x100.png?text=${name.split(' ').map(n=>n[0]).join('')}`,
            role: role,
            status: status,
            joined: serverTimestamp(),
            ...(ref && { referredBy: ref }),
        };
        
        // Generate reg number for all new non-guardian roles
        if (role !== 'Guardian') {
            newUserInfo.registrationNumber = generateRegistrationNumber();
        }

        if (role === 'Student') {
            const roll = generateRollNumber();
            newUserInfo.classRoll = roll;
            newUserInfo.offlineRollNo = roll;
            newUserInfo.currentSessionId = newSessionId;
            newUserInfo.lastLoginAt = serverTimestamp();
        }

        await setDoc(doc(db, "users", newUser.uid), newUserInfo);

        if (status === 'Active') {
            if (role === 'Student') {
                localStorage.setItem('rdc_session_id', newSessionId);
            }
            const finalUserInfo = { ...newUserInfo, id: newUser.uid } as User;
            setUserInfo(finalUserInfo);
            redirectToDashboard(finalUserInfo, 'Account Created!');
        }

        return userCredential;
    };

    const logout = () => {
        signOut(auth).then(() => {
            localStorage.removeItem('rdc_session_id');
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

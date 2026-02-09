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
import { getAuthInstance, getDbInstance } from '@/lib/firebase/config';
import { getUser, getHomepageConfig, getUserByClassRoll, updateUser, getUserByRegistrationNumber } from '@/lib/firebase/firestore';
import { doc, serverTimestamp, updateDoc, onSnapshot, Timestamp, setDoc } from 'firebase/firestore';
import { User, UserSession } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { generateRollNumber, generateRegistrationNumber, getBrowserInfo, getIpAddress } from '@/lib/utils';

interface AuthContextType {
    user: FirebaseUser | null;
    userInfo: User | null;
    loading: boolean;
    login: (email: string, pass: string, role?: User['role']) => Promise<any>;
    loginWithClassRoll: (classRoll: string, pass: string) => Promise<any>;
    loginWithStaffId: (staffId: string, pass: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithFacebook: () => Promise<any>;
    signup: (email: string, pass: string, name: string, role: User['role'], status?: User['status'], referralCode?: string) => Promise<any>;
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
    const auth = getAuthInstance();
    const db = getDbInstance();

    const logout = useCallback(() => {
        if (!auth) return;
        signOut(auth).then(() => {
            localStorage.removeItem('rdc_session_id');
            router.push('/login');
        });
    }, [auth, router]);

    const fetchAndSetUser = useCallback(async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
            setUser(firebaseUser);
            const fetchedUserInfo = await getUser(firebaseUser.uid);
            setUserInfo(fetchedUserInfo);
        } else {
            setUser(null);
            setUserInfo(null);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }
        const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
            fetchAndSetUser(firebaseUser);
        });

        return () => unsubscribeAuth();
    }, [fetchAndSetUser, auth]);
    
    // Live multi-device session enforcement
    useEffect(() => {
        if (!userInfo || userInfo.role !== 'Student' || !db) {
            return;
        }

        const userDocRef = doc(db, 'users', userInfo.uid);
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const userData = docSnap.data() as User;
                const activeSessions = userData.activeSessions || [];
                const clientSessionId = localStorage.getItem('rdc_session_id');

                // If current client session is not in the active sessions list, logout instantly
                if (clientSessionId && !activeSessions.some(s => s.id === clientSessionId)) {
                    console.warn('Current session removed remotely. Logging out.');
                    toast({
                        title: 'Logged Out',
                        description: 'Your session has ended or been removed from another device.',
                        variant: 'destructive',
                        duration: 5000,
                    });
                    logout();
                }
            }
        });

        return () => unsubscribeFirestore();
    }, [userInfo, db, toast, logout]);

    const refreshUserInfo = useCallback(async () => {
        if (!auth) return;
        const currentUser = auth.currentUser;
        if (currentUser) {
            setLoading(true);
            await fetchAndSetUser(currentUser);
        }
    }, [fetchAndSetUser, auth]);
    
    const getDashboardLink = (role: User['role']) => {
        switch (role) {
            case 'Student': return '/student/dashboard';
            case 'Teacher': return '/teacher/dashboard';
            case 'Guardian': return '/guardian/dashboard';
            case 'Admin': return '/admin/dashboard';
            case 'Seller': return '/seller/dashboard';
            case 'Affiliate': return '/affiliate/dashboard';
            case 'Moderator': return '/moderator/dashboard';
            case 'Doubt Solver': return '/doubt-solver/dashboard';
            default: return '/';
        }
    };
    
    const redirectToDashboard = (userInfo: User, title: string) => {
        toast({ title, description: `Welcome back, ${userInfo.name}. Redirecting...` });
        const dashboardUrl = getDashboardLink(userInfo.role);
        router.push(dashboardUrl);
    };

    const handleStudentLoginSession = async (uid: string, existingUser?: User) => {
        if (!db) return;
        const newSessionId = uuidv4();
        const ipAddress = await getIpAddress();
        const deviceName = getBrowserInfo();
        
        const newSession: UserSession = {
            id: newSessionId,
            deviceName,
            ipAddress,
            lastLoginAt: Timestamp.now(),
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        };

        const currentSessions = existingUser?.activeSessions || [];
        
        // Enforce 2-device limit. If 3rd attempt, remove the oldest session.
        let updatedSessions = [...currentSessions, newSession];
        if (updatedSessions.length > 2) {
            updatedSessions = updatedSessions.slice(-2);
        }

        await updateDoc(doc(db, 'users', uid), {
            activeSessions: updatedSessions,
            lastLoginAt: serverTimestamp(),
        });
        
        localStorage.setItem('rdc_session_id', newSessionId);
    };

    const login = async (email: string, pass: string, role?: User['role']) => {
        if (!auth) throw new Error("Authentication service is not available.");
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
        
        if (role && (role as any) === 'Partner') {
            role = 'Seller';
        }

        if (role && role !== 'Admin' && !config.platformSettings[role]?.loginEnabled) {
            throw new Error(`Logins for the '${role}' role are temporarily disabled.`);
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        let fetchedUserInfo = await getUser(userCredential.user.uid);

        if (!fetchedUserInfo) {
            await signOut(auth);
            throw new Error("Your user profile could not be found.");
        }
        
        if (fetchedUserInfo.status !== 'Active') {
            await signOut(auth);
            const statusMessage = fetchedUserInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }
        
        if (role && fetchedUserInfo.role !== role) {
            await signOut(auth);
            throw new Error(`Access Denied: This is a '${fetchedUserInfo.role}' account.`);
        }
        
        if (fetchedUserInfo.role === 'Student') {
            await handleStudentLoginSession(fetchedUserInfo.uid, fetchedUserInfo);
        }

        setUserInfo(fetchedUserInfo);
        redirectToDashboard(fetchedUserInfo, 'Login Successful!');
        return userCredential;
    };

    const loginWithClassRoll = async (classRoll: string, pass: string) => {
        if (!auth) throw new Error("Authentication service is not available.");
        let studentInfo = await getUserByClassRoll(classRoll);
        if (!studentInfo) {
            throw new Error("No student found with this class roll.");
        }
        if (studentInfo.role !== 'Student') {
            throw new Error("This login method is for students only.");
        }
    
        if (studentInfo.status !== 'Active') {
            await signOut(auth);
            throw new Error("Your account is not active.");
        }

        const userCredential = await signInWithEmailAndPassword(auth, studentInfo.email, pass);
        await handleStudentLoginSession(studentInfo.uid, studentInfo);
        setUserInfo(studentInfo);
        redirectToDashboard(studentInfo, 'Login Successful!');
        return userCredential;
    };
    
    const loginWithStaffId = async (staffId: string, pass: string) => {
        if (!auth) throw new Error("Authentication service is not available.");
        let staffInfo = await getUserByRegistrationNumber(staffId);
        if (!staffInfo) {
            throw new Error("No staff member found with this ID.");
        }

        const userCredential = await signInWithEmailAndPassword(auth, staffInfo.email, pass);
        setUserInfo(staffInfo);
        redirectToDashboard(staffInfo, 'Login Successful!');
        return userCredential;
    };

    const loginWithGoogle = async () => {
        if (!auth || !db) throw new Error("Firebase services are not available.");
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let existingUserInfo = await getUser(user.uid);
        
        if (!existingUserInfo) {
            const roll = generateRollNumber();
            const newUserInfo: Omit<User, 'id'> = {
                uid: user.uid,
                name: user.displayName || 'New User',
                email: user.email!,
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=U`,
                role: 'Student',
                status: 'Active',
                joined: serverTimestamp(),
                classRoll: roll,
                offlineRollNo: roll,
                registrationNumber: generateRegistrationNumber(),
            };
            await setDoc(doc(db, "users", user.uid), newUserInfo);
            existingUserInfo = { ...newUserInfo, id: user.uid } as User;
        }

        if (existingUserInfo.role === 'Student') {
            await handleStudentLoginSession(existingUserInfo.uid, existingUserInfo);
        }

        setUserInfo(existingUserInfo);
        redirectToDashboard(existingUserInfo, 'Login Successful!');
    }

    const loginWithFacebook = async () => {
        if (!auth || !db) throw new Error("Firebase services are not available.");
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let existingUserInfo = await getUser(user.uid);
        
        if (!existingUserInfo) {
            const roll = generateRollNumber();
            const newUserInfo: Omit<User, 'id'> = {
                uid: user.uid,
                name: user.displayName || 'New User',
                email: user.email!,
                avatarUrl: user.photoURL || `https://placehold.co/100x100.png?text=U`,
                role: 'Student',
                status: 'Active',
                joined: serverTimestamp(),
                classRoll: roll,
                offlineRollNo: roll,
                registrationNumber: generateRegistrationNumber(),
            };
            await setDoc(doc(db, "users", user.uid), newUserInfo);
            existingUserInfo = { ...newUserInfo, id: user.uid } as User;
        }

        if (existingUserInfo.role === 'Student') {
            await handleStudentLoginSession(existingUserInfo.uid, existingUserInfo);
        }

        setUserInfo(existingUserInfo);
        redirectToDashboard(existingUserInfo, 'Login Successful!');
    };
    
    const signup = async (email: string, pass: string, name: string, role: User['role'], status: User['status'] = 'Active', referralCode?: string) => {
        if (!auth || !db) throw new Error("Firebase services are not available.");
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
            referredBy: referralCode,
        };
        
        if (role !== 'Guardian') {
            newUserInfo.registrationNumber = generateRegistrationNumber();
        }

        if (role === 'Student') {
            const roll = generateRollNumber();
            newUserInfo.classRoll = roll;
            newUserInfo.offlineRollNo = roll;
        }

        await setDoc(doc(db, "users", newUser.uid), newUserInfo);

        if (status === 'Active') {
            const finalUserInfo = { ...newUserInfo, id: newUser.uid } as User;
            if (role === 'Student') {
                await handleStudentLoginSession(newUser.uid, finalUserInfo);
            }
            setUserInfo(finalUserInfo);
            redirectToDashboard(finalUserInfo, 'Account Created!');
        }

        return userCredential;
    };

    const resetPassword = (email: string) => {
        if (!auth) throw new Error("Authentication service is not available.");
        return sendPasswordResetEmail(auth, email);
    }

    const value = {
        user,
        userInfo,
        loading,
        login,
        loginWithClassRoll,
        loginWithStaffId,
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

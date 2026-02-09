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
import { doc, setDoc, serverTimestamp, updateDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { User, UserSession } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { generateRollNumber, generateRegistrationNumber } from '@/lib/utils';

interface AuthContextType {
    user: FirebaseUser | null;
    userInfo: User | null;
    loading: boolean;
    login: (email: string, pass: string, role?: User['role']) => Promise<any>;
    loginWithClassRoll: (classRoll: string, pass: string) => Promise<any>;
    loginWithStaffId: (staffId: string, pass: string) => Promise<any>;
    loginWithGoogle: () => Promise<any>;
    loginWithFacebook: () => Promise<any>;
    signup: (email: string, pass: string, name: string, role: User['role'], status?: User['status']) => Promise<any>;
    logout: () => void;
    resetPassword: (email: string) => Promise<any>;
    refreshUserInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getBrowserInfo() {
    if (typeof window === 'undefined') return "Unknown Browser on Server";
    const ua = navigator.userAgent;
    let browser = "Browser";
    let os = "OS";

    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Edg/") > -1) browser = "Edge";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";

    if (ua.indexOf("Windows") > -1) os = "Windows 10/11";
    else if (ua.indexOf("Mac OS") > -1) os = "macOS";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) os = "iOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";

    return `${browser} on ${os}`;
}

async function getIpAddress() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return 'Unknown IP';
    }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userInfo, setUserInfo] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { toast } = useToast();
    const auth = getAuthInstance();
    const db = getDbInstance();

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
    
    // Multi-device login listener
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

                // If current client session is not in the active sessions list, logout
                if (clientSessionId && !activeSessions.some(s => s.id === clientSessionId)) {
                    console.warn('Session no longer valid. Logging out.');
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
    }, [userInfo, db, toast]);

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
        
        // Ensure max 2 sessions. Remove the oldest if necessary.
        let updatedSessions = [...currentSessions, newSession];
        if (updatedSessions.length > 2) {
            updatedSessions = updatedSessions.slice(-2);
        }

        await updateDoc(doc(db, 'users', uid), {
            activeSessions: updatedSessions,
            currentSessionId: newSessionId, // legacy support
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
            throw new Error(`Logins for the '${role}' role are temporarily disabled by the administrator.`);
        }

        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        
        let fetchedUserInfo = await getUser(userCredential.user.uid);

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
            await setDoc(doc(db!, "users", userCredential.user.uid), newUserInfo);
            fetchedUserInfo = { ...newUserInfo, id: userCredential.user.uid } as User;
        }

        if (!fetchedUserInfo) {
            await signOut(auth);
            throw new Error("Your user profile could not be found. Please contact support.");
        }
        
        if (fetchedUserInfo.status !== 'Active') {
            await signOut(auth);
            const statusMessage = fetchedUserInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval. You will be notified once it's reviewed."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }
        
        if ((fetchedUserInfo.role as any) === 'Partner') {
            fetchedUserInfo.role = 'Seller';
        }
        
        if ((fetchedUserInfo.role as any) !== 'Doubt Solver' && fetchedUserInfo.role !== 'Admin' && !config.platformSettings[fetchedUserInfo.role]?.loginEnabled) {
            await signOut(auth);
            throw new Error(`Logins for your role ('${fetchedUserInfo.role}') are temporarily disabled.`);
        }

        if (role && fetchedUserInfo.role !== role) {
            await signOut(auth);
            throw new Error(`Access Denied: This is a '${fetchedUserInfo.role}' account. Please log in with the correct role or tab.`);
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
            const statusMessage = studentInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
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

        const staffRoles: User['role'][] = ['Teacher', 'Admin', 'Moderator', 'Affiliate', 'Seller', 'Doubt Solver'];
        if (!staffRoles.includes(staffInfo.role)) {
            throw new Error("This login method is for staff members only.");
        }
    
        if (staffInfo.status !== 'Active') {
            const statusMessage = staffInfo.status === 'Pending Approval'
                ? "Your account is pending admin approval."
                : 'Your account has been suspended.';
            throw new Error(statusMessage);
        }

        const userCredential = await signInWithEmailAndPassword(auth, staffInfo.email, pass);
        
        setUserInfo(staffInfo);
        redirectToDashboard(staffInfo, 'Login Successful!');
        return userCredential;
    };

    const loginWithGoogle = async () => {
        if (!auth || !db) throw new Error("Firebase services are not available.");
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
    
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let existingUserInfo = await getUser(user.uid);
        
        if (existingUserInfo) {
            if (existingUserInfo.status !== 'Active') {
                await signOut(auth);
                throw new Error("Your account is not active.");
            }
        } else {
            if (!config.platformSettings['Student']?.signupEnabled) {
                await signOut(auth);
                throw new Error("Student registrations are temporarily disabled.");
            }
            
            const searchParams = new URLSearchParams(window.location.search);
            const ref = searchParams.get('ref');
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
                ...(ref && { referredBy: ref }),
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
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
    
        const provider = new FacebookAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        let existingUserInfo = await getUser(user.uid);
        
        if (existingUserInfo) {
            if (existingUserInfo.status !== 'Active') {
                await signOut(auth);
                throw new Error("Your account is not active.");
            }
        } else {
            if (!config.platformSettings['Student']?.signupEnabled) {
                await signOut(auth);
                throw new Error("Student registrations are temporarily disabled.");
            }
            
            const searchParams = new URLSearchParams(window.location.search);
            const ref = searchParams.get('ref');
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
                ...(ref && { referredBy: ref }),
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
    
    const signup = async (email: string, pass: string, name: string, role: User['role'], status: User['status'] = 'Active') => {
        if (!auth || !db) throw new Error("Firebase services are not available.");
        const config = await getHomepageConfig();
        if (!config) {
            throw new Error("Platform configuration is not available. Please try again later.");
        }
        if (role !== 'Admin' && role !== 'Doubt Solver' && !config.platformSettings[role]?.signupEnabled) {
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

    const logout = () => {
        if (!auth) return;
        signOut(auth).then(() => {
            localStorage.removeItem('rdc_session_id');
            router.push('/login');
        });
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

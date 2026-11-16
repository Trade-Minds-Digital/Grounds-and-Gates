import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
  onIdTokenChanged,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDMNH-mrVBI--_YnqrPPk0GBOjvZYbLvF4',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'grounds-and-gates.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'grounds-and-gates',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'grounds-and-gates.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '278262778146',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:278262778146:web:f53626c3f774c4aeac7d7b',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-B1Z3ZYYBMN',
};

// Initialize Firebase App once (singleton pattern safe for HMR and SSR)
export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth: Auth = getAuth(firebaseApp);

// Initialize Analytics conditionally in browser environment
export let analytics: any = null;
if (typeof window !== 'undefined') {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((yes) => {
        if (yes) {
          analytics = getAnalytics(firebaseApp);
        }
      });
    })
    .catch(() => {
      // Analytics unsupported or blocked by browser tracking protection
    });
}

/**
 * Maps Firebase Auth error codes to user-friendly bilingual English/Tamil messages
 */
export function mapFirebaseError(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const code = error.code || (typeof error.message === 'string' && error.message.includes('auth/') ? error.message : '');

  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists. / இந்த மின்னஞ்சலில் ஏற்கனவே ஒரு கணக்கு உள்ளது.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials. / தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். தயவுசெய்து சரிபார்க்கவும்.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address. / சரியான மின்னஞ்சல் முகவரியை உள்ளிடவும்.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters. / கடவுச்சொல் மிகவும் எளிதாக உள்ளது. குறைந்தபட்சம் 6 எழுத்துகளைப் பயன்படுத்தவும்.';
    case 'auth/user-disabled':
      return 'This account has been deactivated or suspended. Please contact Grounds & Gates concierge. / இந்தக் கணக்கு முடக்கப்பட்டுள்ளது. நிர்வாகத்தை தொடர்பு கொள்ளவும்.';
    case 'auth/too-many-requests':
      return 'Access temporarily disabled due to many failed attempts. Please try again later. / பல முறை தவறான முயற்சிகள் மேற்கொள்ளப்பட்டதால் தற்காலிகமாக முடக்கப்பட்டது. சிறிது நேரம் கழித்து முயற்சிக்கவும்.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection. / இணைய இணைப்பு பிழை. உங்கள் இணைப்பை சரிபார்க்கவும்.';
    case 'auth/expired-action-code':
      return 'This action link has expired. Please request a new verification or password reset email. / இந்த இணைப்பு காலாவதியாகிவிட்டது. புதிய இணைப்பைக் கோரவும்.';
    case 'auth/invalid-action-code':
      return 'This action link is invalid or has already been used. / இந்த இணைப்பு தவறானது அல்லது ஏற்கனவே பயன்படுத்தப்பட்டது.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completion. / உள்நுழைவு சாளரம் மூடப்பட்டது.';
    default:
      return error.message || 'Authentication error. Please try again.';
  }
}

/**
 * Retrieve the current user ID token, with optional force refresh
 */
export async function getCurrentFirebaseToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken(forceRefresh);
  } catch (err) {
    console.warn('[Firebase] Failed to fetch ID token:', err);
    return null;
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
  onAuthStateChanged,
  onIdTokenChanged,
  type FirebaseUser,
};


import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';

const DEMO_USER = {
  uid: 'demo-dev-user-001',
  displayName: 'Alex Rivers',
  email: 'alex.rivers@mindai.workspace',
  photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isAnonymous: false,
  isDemo: true,
};

export const authService = {
  async loginWithGoogle() {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      console.log('[Mind AI Auth] Logging in with Demo Developer Account (Mock)');
      return DEMO_USER;
    }
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  async loginWithEmail(email, password) {
    if (!isFirebaseConfigured || !auth) {
      return { ...DEMO_USER, email, displayName: email.split('@')[0] };
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async registerWithEmail(email, password, displayName = '') {
    if (!isFirebaseConfigured || !auth) {
      return { ...DEMO_USER, email, displayName: displayName || email.split('@')[0] };
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  },

  async logout() {
    if (!isFirebaseConfigured || !auth) {
      return true;
    }
    await signOut(auth);
    return true;
  },

  subscribeToAuth(callback) {
    if (!isFirebaseConfigured || !auth) {
      // Provide default demo developer user in mock mode
      callback(DEMO_USER);
      return () => {};
    }
    return onAuthStateChanged(auth, (user) => {
      callback(user || null);
    });
  },

  getDemoUser() {
    return DEMO_USER;
  }
};

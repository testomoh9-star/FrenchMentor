
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
  increment
} from "firebase/firestore";
import { Message, UserProfile, CorrectionItem } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyAcZCopp-d424uTEtVFb0jsE3sfDo97kIU",
  authDomain: "frenchmentor-8dbec.firebaseapp.com",
  projectId: "frenchmentor-8dbec",
  storageBucket: "frenchmentor-8dbec.firebasestorage.app",
  messagingSenderId: "424142674652",
  appId: "1:424142674652:web:1ada77128bf2db56ce3219"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserProfile(result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = () => signOut(auth);

// --- User Profile & Stats ---

export const ensureUserProfile = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    const initialProfile: UserProfile = {
      uid: user.uid,
      isPro: false,
      sparks: 50,
      totalCorrections: 0,
      mistakeCategories: {
        Grammar: 0,
        Spelling: 0,
        Vocabulary: 0,
        Conjugation: 0
      }
    };
    await setDoc(userRef, initialProfile);
  }
};

export const subscribeToProfile = (userId: string, callback: (profile: UserProfile) => void) => {
  return onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserProfile);
    }
  });
};

export const upgradeToPro = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { isPro: true });
};

// --- Database Logic ---

export const saveMessageAndTrackMistakes = async (userId: string, message: Omit<Message, 'id'>, corrections: CorrectionItem[] = []) => {
  try {
    // 1. Save Message
    const messagesRef = collection(db, "users", userId, "messages");
    await addDoc(messagesRef, {
      ...message,
      timestamp: Date.now()
    });

    // 2. Track Mistakes if any
    if (corrections.length > 0) {
      const userRef = doc(db, "users", userId);
      const updates: any = {
        totalCorrections: increment(corrections.length)
      };
      
      // Simple logic to increment categories (usually we'd parse this from AI response better)
      corrections.forEach(c => {
        const cat = c.category || 'Grammar';
        updates[`mistakeCategories.${cat}`] = increment(1);
      });

      await updateDoc(userRef, updates);
      
      // Also save to a detailed log for the AI brain to read later
      const logsRef = collection(db, "users", userId, "mistakeLogs");
      for (const c of corrections) {
        await addDoc(logsRef, {
          ...c,
          timestamp: Date.now()
        });
      }
    }
  } catch (error) {
    console.error("Error saving message or tracking:", error);
  }
};

export const getMistakeLogs = async (userId: string) => {
  const logsRef = collection(db, "users", userId, "mistakeLogs");
  const q = query(logsRef, orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data());
};

export const subscribeToMessages = (userId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, "users", userId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Message[];
    callback(messages);
  });
};

export const clearUserMessages = async (userId: string) => {
  const messagesRef = collection(db, "users", userId, "messages");
  const snapshot = await getDocs(messagesRef);
  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

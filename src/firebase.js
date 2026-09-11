import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBq8fUIKSjn9tocpWzyCLrs-_YQxpKh_g",
  authDomain: "ooooo-96f77.firebaseapp.com",
  projectId: "ooooo-96f77",
  storageBucket: "ooooo-96f77.firebasestorage.app",
  messagingSenderId: "979892592841",
  appId: "1:979892592841:web:c971861e453678d70ead18",
  measurementId: "G-WS4FG769EW"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const NAMES_COLLECTION = "names_770";

/**
 * Add a new name submission to Firestore
 */
export async function addNameSubmission(data) {
  try {
    const docRef = await addDoc(collection(db, NAMES_COLLECTION), {
      fullName: data.fullName || "",
      motherName: data.motherName || "",
      requestType: data.requestType || "כללי",
      note: data.note || "",
      status: "new",
      createdAt: serverTimestamp(),
      formattedDate: new Date().toLocaleString("he-IL")
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Firestore Add Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time updates for all submitted names
 */
export function subscribeToNames(callback, onError) {
  try {
    const q = query(collection(db, NAMES_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const namesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtDate: doc.data().createdAt?.toDate() || new Date()
      }));
      callback(namesList);
    }, (error) => {
      console.error("Firestore Subscription Error:", error);
      if (onError) onError(error);
    });
  } catch (err) {
    console.error("Firestore Query Init Error:", err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Delete a submission by document ID
 */
export async function deleteSubmission(id) {
  try {
    await deleteDoc(doc(db, NAMES_COLLECTION, id));
    return { success: true };
  } catch (error) {
    console.error("Firestore Delete Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update submission status (e.g. 'new' -> 'processed')
 */
export async function updateSubmissionStatus(id, newStatus) {
  try {
    await updateDoc(doc(db, NAMES_COLLECTION, id), {
      status: newStatus
    });
    return { success: true };
  } catch (error) {
    console.error("Firestore Update Error:", error);
    return { success: false, error: error.message };
  }
}

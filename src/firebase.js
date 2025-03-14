// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: "campus-kart-b32ae.firebaseapp.com",
    projectId: "campus-kart-b32ae",
    storageBucket: "campus-kart-b32ae.appspot.com",
    messagingSenderId: "212790091258",
    appId: "1:212790091258:web:31b7ef7ff29bba23899843",
    measurementId: "G-VL7R8YB6GL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: "select_account", // Ensure login prompt always appears
});

// Function to handle Google Sign-In
export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User signed in:", user);
        const userRef = doc(db, "users", user.uid);
        console.log("Checking Firestore for existing user...");

        // Check if the user already exists
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            console.log("User already exists in Firestore:", userDoc.data());
        } else {
            console.log("User not found. Adding to Firestore...");
            // Only create a new document if it doesn't exist
            await setDoc(userRef, {
                name: user.displayName,
                email: user.email,
                profilePic: user.photoURL
            });
            console.log("User added to Firestore successfully!");
        }

    } catch (error) {
        console.error("Error signing in:", error);
    }
};

// Function to handle user sign out
export const signOutUser = async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Fetch user data from firestore
export const fetchUserData = async (userID) => {
    try {
        const userRef = doc(db, "user", userID);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data();
        } else {
            console.log("No user data found!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
    }
};
export { auth, db, storage };
export default app;
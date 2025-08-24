import { createContext, useContext, useEffect, useState } from "react";
// Import onAuthStateChanged and signOut
import { onAuthStateChanged, signOut } from "firebase/auth";
// ✅ Import the 'auth' object directly from your config file
import { auth } from '../firebase'; 

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseToken, setFirebaseToken] = useState(null); // For the Firebase token
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Use the imported 'auth' object directly
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // If a Firebase user exists, set the user and their token
        const token = await user.getIdToken();
        setCurrentUser(user);
        setFirebaseToken(token);
      } else {
        // If no user, clear everything
        setCurrentUser(null);
        setFirebaseToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("guestToken"); // Clear the old JWT just in case
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value = {
    currentUser,
    firebaseToken, // Pass the token through the context
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
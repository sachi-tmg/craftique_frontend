import { createContext, useContext, useState } from "react";

// Create the AuthContext. No need to pass 'undefined' as it's the default.
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Combine all user authentication state into a single 'userAuth' object
  const [userAuth, setUserAuth] = useState(() => {
    // Initialize state from localStorage during component initialization
    // This runs only once when the component mounts.
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const profilePicture = localStorage.getItem("profilePicture");
    const newNotificationAvailable = localStorage.getItem("new_notification_available") === "true"; // Parse boolean

    return {
      isAuthenticated: !!token, // True if token exists
      username: username || "",
      token: token || null,
      profilePicture: profilePicture || "",
      new_notification_available: newNotificationAvailable,
    };
  });

  // Login function now takes token, username, and profilePicture,
  // similar to your previous project.
  const login = (token, username, profilePicture) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("profilePicture", profilePicture);
    // You might get new_notification_available from the login API response
    // For now, setting it to false or what's expected after login
    localStorage.setItem("new_notification_available", "false"); 

    setUserAuth({
      isAuthenticated: true,
      username,
      profilePicture,
      token,
      new_notification_available: false, // Default after login
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("new_notification_available"); // Clear notifications state too

    setUserAuth({
      isAuthenticated: false,
      username: "",
      profilePicture: "",
      token: null,
      new_notification_available: false,
    });
  };

  // If signup is also a way to get a token and log in, it should behave similarly to login
  const signup = (token, username, profilePicture) => {
    // This assumes your signup API directly returns a token and user details
    login(token, username, profilePicture); // Reuse login logic
  };

  // The value provided by the context will be the userAuth object and the functions
  return (
    <AuthContext.Provider value={{ userAuth, login, logout, signup, setUserAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
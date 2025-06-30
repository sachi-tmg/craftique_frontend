import { createContext, useContext, useState } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = (email, password, authToken) => {
    // In a real app, you'd make an API call here to authenticate the user
    // and receive the token from the backend. For simulation, we'll just set it.
    setIsLoggedIn(true);
    setUser({ name: "John Doe", email });
    setToken(authToken);
    // You might also store the token in localStorage/sessionStorage
    // localStorage.setItem("authToken", authToken);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setToken(null);
    // localStorage.removeItem("authToken");
  };

  const signup = (name, email, password, authToken) => {
    // Simulate signup, setting the token after successful registration
    setIsLoggedIn(true);
    setUser({ name, email });
    setToken(authToken);
    // localStorage.setItem("authToken", authToken);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, token, login, logout, signup }}>
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
// src/contexts/cart-context.jsx
import { getCart, mergeCarts } from "@/api/api";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./auth-context";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { userAuth } = useAuth();
  const [guestCart, setGuestCart] = useState([]);
  const [userCart, setUserCart] = useState([]);
  
  // Load guest cart from localStorage
  useEffect(() => {
    if (!userAuth.isAuthenticated) {
      const savedCart = localStorage.getItem('guestCart');
      if (savedCart) {
        try {
          setGuestCart(JSON.parse(savedCart));
        } catch (error) {
          console.error("Error parsing guest cart:", error);
          localStorage.removeItem('guestCart');
        }
      }
    }
  }, [userAuth.isAuthenticated]);

    useEffect(() => {
    const fetchUserCart = async () => {
      if (userAuth.isAuthenticated) {
        try {
          const res = await getCart(userAuth.token);
          const items = res.data.items.map(item => ({
            id: item.creationId.creation_id,
            _id: item.creationId._id,
            title: item.creationId.title,
            artist: item.creationId.fullName || "Unknown",
            image: item.creationId.creationPicture || "/placeholder.svg",
            price: parseFloat(item.creationId.price) || 0,
            quantity: item.quantity || 1, 
          }));
          setUserCart(items);
        } catch (err) {
          console.error("Failed to load cart items.", err);
        }
      }
    };

    fetchUserCart();
  }, [userAuth.isAuthenticated, userAuth.token]);

  // Save guest cart to localStorage
  useEffect(() => {
    if (!userAuth.isAuthenticated) {
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }
  }, [guestCart, userAuth.isAuthenticated]);

const addToGuestCart = (item) => {
  if (userAuth.isAuthenticated) return;

  const exists = guestCart.find(i => i._id === item._id);

  if (!exists) {
    const updated = [...guestCart, { ...item, quantity: 1 }];
    setGuestCart(updated);
  }
};

  const clearCart = () => {
    setGuestCart([]);
    setUserCart([]);
  };

  const clearUserCart = async (token) => {
    try {
      await clearCartAPI(token);
      setUserCart([]); // Clear local state
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  };

  const updateGuestCartItem = (id, quantity) => {
    setGuestCart(prev => 
      prev.map(item => 
        item._id === id ? { ...item, quantity } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const removeFromGuestCart = (id) => {
    setGuestCart(prev => prev.filter(item => item._id !== id));
  };

  const clearGuestCart = () => {
    setGuestCart([]);
    localStorage.removeItem('guestCart');
  };

  const mergeGuestCart = async (cartItems, token) => {
    try {
      const result = await mergeCarts(cartItems, token);
      clearGuestCart();
      return result;
    } catch (error) {
      console.error("Cart merge failed:", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ 
      guestCart, 
      addToGuestCart, 
      updateGuestCartItem,
      removeFromGuestCart,
      clearGuestCart,
      mergeGuestCart, 
      userCart, 
      setUserCart,
      clearCart,
      clearUserCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
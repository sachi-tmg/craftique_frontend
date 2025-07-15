// contexts/favorites-context.jsx
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getFavorites as getFavoritesAPI, toggleFavoriteAPI } from '../api/api';
import { useAuth } from './auth-context';

const FavoritesContext = createContext();

export function useFavorites() {
    return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
    //console.log('[FavoritesProvider] Initializing');
    const { userAuth } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    //console.log('[FavoritesProvider] Current auth state:', userAuth);
    //console.log('[FavoritesProvider] Current favorites state:', favorites);

    const initializeFavorites = useCallback(async (token) => {
        //console.log('[initializeFavorites] Called with token:', token ? 'present' : 'missing');
        if (!token) {
            setFavorites([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            //console.log('[initializeFavorites] Fetching favorites from API');
            const response = await getFavoritesAPI(token);
            //console.log('[initializeFavorites] API response:', response);
            
            // Updated this part to check response.favorites instead of response.data
            if (response && Array.isArray(response.favorites)) {
                const mappedFavorites = response.favorites.map(fav => ({
                    ...fav,
                    _id: fav._id || fav.creation_id, // Ensure both IDs are available
                    id: fav.creation_id || fav._id,  // For consistent access
                    artist: fav.userId // Map userId to artist for frontend consistency
                }));
                //console.log('[initializeFavorites] Mapped favorites:', mappedFavorites);
                setFavorites(mappedFavorites);
            } else {
                //console.log('[initializeFavorites] No favorites array in response, setting empty array');
                setFavorites([]);
            }
        } catch (err) {
            console.error("[initializeFavorites] Error:", err);
            setError(err.response?.data?.message || "Failed to load favorites.");
            toast.error("Failed to load your favorites.");
        } finally {
            //console.log('[initializeFavorites] Finished loading');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        //console.log('[FavoritesProvider] useEffect - auth changed');
        if (userAuth.isAuthenticated) {
            //console.log('[FavoritesProvider] User is authenticated, initializing favorites');
            initializeFavorites(userAuth.token);
        } else {
            //console.log('[FavoritesProvider] User is not authenticated, clearing favorites');
            setFavorites([]);
            setError(null);
        }
    }, [userAuth.isAuthenticated, userAuth.token, initializeFavorites]);

    const isFavorite = useCallback((craftId) => {
        ////console.log('[isFavorite] Checking for craftId:', craftId);
        // Check both _id and creation_id since we might get either
        const result = favorites.some(fav => 
            fav._id === craftId || 
            fav.creation_id === craftId ||
            fav._id.toString() === craftId // Handle ObjectId comparison
        );
        ////console.log('[isFavorite] Result:', result);
        return result;
    }, [favorites]);

    const toggleFavorite = useCallback(async (craft) => {
        //console.log('[toggleFavorite] Called with craft:', craft);
        if (!userAuth.isAuthenticated) {
            //console.log('[toggleFavorite] User not authenticated');
            toast.warn("Sign in required: Please sign in to manage favorites.");
            return false;
        }
        if (!craft || !craft._id) {
            //console.log('[toggleFavorite] Invalid craft data');
            toast.error("Invalid craft data for toggling favorite.");
            return false;
        }

        const currentlyFavorite = isFavorite(craft._id);
        //console.log('[toggleFavorite] Current favorite status:', currentlyFavorite);
        const previousFavorites = [...favorites];

        if (currentlyFavorite) {
            //console.log('[toggleFavorite] Optimistically removing from favorites');
            setFavorites(prevFavorites => prevFavorites.filter(fav => fav._id !== craft._id));
            toast.info(`${craft.title} removed from favorites.`);
        } else {
            //console.log('[toggleFavorite] Optimistically adding to favorites');
            const newFavorite = {
                ...craft,
                _id: craft._id,
                id: craft.creation_id || craft.id
            };
            setFavorites(prevFavorites => [...prevFavorites, newFavorite]);
            toast.success(`${craft.title} added to favorites!`);
        }

        try {
            //console.log('[toggleFavorite] Calling API to toggle favorite');
            const response = await toggleFavoriteAPI(craft._id, userAuth.token);
            //console.log('[toggleFavorite] API response:', response);
            return response.isFavorited;
        } catch (err) {
            console.error("[toggleFavorite] API Error:", err);
            setError(err.response?.data?.message || "Failed to update favorite status on server.");
            toast.error(err.response?.data?.message || "Failed to update favorite status.");

            //console.log('[toggleFavorite] Rolling back optimistic update');
            setFavorites(previousFavorites);
            return false;
        }
    }, [userAuth.isAuthenticated, userAuth.token, favorites, isFavorite]);

    const contextValue = {
        favorites,
        loading,
        error,
        initializeFavorites,
        isFavorite,
        toggleFavorite,
    };

    //console.log('[FavoritesProvider] Rendering with context:', contextValue);
    return (
        <FavoritesContext.Provider value={contextValue}>
            {children}
        </FavoritesContext.Provider>
    );
}
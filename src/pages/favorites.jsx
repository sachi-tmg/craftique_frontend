// pages/FavoritesPage.jsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Bookmark, Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToCart } from '../api/api';
import { useAuth } from '../contexts/auth-context';
import { useCart } from '../contexts/cart-context';
import { useFavorites } from '../contexts/favorites-context';

export default function FavoritesPage() {
    //console.log('[FavoritesPage] Rendering');
    const { favorites, toggleFavorite, loading, error, initializeFavorites } = useFavorites();
    const { userAuth } = useAuth();
    const { addToGuestCart } = useCart();
    const masonryRef = useRef(null);

    //console.log('[FavoritesPage] Current favorites:', favorites);
    //console.log('[FavoritesPage] Loading state:', loading);
    //console.log('[FavoritesPage] Error state:', error);
    //console.log('[FavoritesPage] Auth state:', userAuth);

    useEffect(() => {
        //console.log('[FavoritesPage] useEffect - auth changed');
        if (userAuth.isAuthenticated) {
            //console.log('[FavoritesPage] Initializing favorites');
            initializeFavorites(userAuth.token);
        }
    }, [userAuth.isAuthenticated, initializeFavorites]);

    const formatPrice = (price) => {
        return `Rs. ${Number(price).toLocaleString()}`;
    };

    const handleRemoveFromFavorites = async (craft) => {
        //console.log('[handleRemoveFromFavorites] Called with craft:', craft);
        await toggleFavorite(craft);
    };

    const handleClearAllFavorites = async () => {
        //console.log('[handleClearAllFavorites] Called');
        const validFavorites = favorites.filter(Boolean);
        //console.log('[handleClearAllFavorites] Valid favorites count:', validFavorites.length);

        if (validFavorites.length === 0) {
            //console.log('[handleClearAllFavorites] No favorites to clear');
            toast.info("No favorites to clear.");
            return;
        }

        try {
            //console.log('[handleClearAllFavorites] Removing all favorites');
            const removePromises = validFavorites.map(craft => toggleFavorite(craft));
            await Promise.all(removePromises);
            toast.success("All items have been removed from your favorites.");
        } catch (err) {
            console.error("[handleClearAllFavorites] Error:", err);
            toast.error("Failed to clear all favorites. Please try again.");
        }
    };

    const handleAddToCart = async (item) => {
        //console.log('[handleAddToCart] Called with item:', item);
        if (userAuth.isAuthenticated) {
            try {
                //console.log('[handleAddToCart] Adding to authenticated cart');
                await addToCart(item._id, userAuth.token);
                toast.success(`${item.title} added to cart`);
            } catch (error) {
                console.error('[handleAddToCart] Error:', error);
                if (error.response?.status === 409) {
                    toast.info(`${item.title} is already in your cart.`);
                } else {
                    toast.error(error.response?.data?.message || "Failed to add to cart");
                }
            }
        } else {
            //console.log('[handleAddToCart] Adding to guest cart');
            const guestCartRaw = localStorage.getItem("guestCart");
            const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : [];
            const alreadyInCart = guestCart.some(i => i._id === item._id);

            if (!alreadyInCart) {
                addToGuestCart(item);
                toast.success(`${item.title} added to guest cart`);
            } else {
                toast.info(`${item.title} is already in your guest cart`);
            }
        }
    };

    // Display different content based on authentication, loading, error, and favorites count
    //console.log('[FavoritesPage] Determining which UI to render');

    // 1. Not Authenticated
    if (!userAuth.isAuthenticated) {
        //console.log('[FavoritesPage] Rendering not authenticated UI');
        return (
            <div className="max-w-full space-y-8 px-2 sm:px-4 py-8">
                <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Sign in to save your favorites</h1>
                    <p className="text-muted-foreground mb-6">
                        Create an account to save crafts you love and access them anytime.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Button asChild>
                            <Link to="/login">Sign In</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link to="/signup">Sign Up</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Loading State
    if (loading) {
        //console.log('[FavoritesPage] Rendering loading UI');
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Loading your favorites...</p>
            </div>
        );
    }

    // 3. Error State
    if (error) {
        //console.log('[FavoritesPage] Rendering error UI');
        return (
            <div className="flex justify-center items-center h-screen text-red-500">
                <p>Error loading favorites: {error}</p>
            </div>
        );
    }

    // 4. No Favorites Yet
    if (favorites.length === 0) {
        //console.log('[FavoritesPage] Rendering no favorites UI');
        return (
            <div className="max-w-full space-y-8 px-2 sm:px-4 py-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Your Favorites</h1>
                </div>
                <div className="text-center py-12">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
                    <p className="text-muted-foreground mb-6">Start exploring and save crafts you love to see them here.</p>
                    <Button asChild>
                        <Link to="/explore">Explore Crafts</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // 5. Display Favorites
    //console.log('[FavoritesPage] Rendering favorites list');
    return (
        <div className="max-w-full space-y-8 px-2 sm:px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Favorites</h1>
                    <p className="text-muted-foreground">
                        {favorites.length} saved {favorites.length === 1 ? "craft" : "crafts"}
                    </p>
                </div>
                {favorites.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Clear all favorites?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove all {favorites.length} items from your favorites. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClearAllFavorites}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Clear All
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <div className="masonry-grid-improved" ref={masonryRef}>
                {favorites.map((craft) => (
                    <div key={craft._id} className="masonry-item-improved group">
                        <Link to={`/craft/${craft.creation_id}`} className="block relative">
                            <div className="relative overflow-hidden rounded-lg bg-muted">
                                <img
                                    src={craft.creationPicture || "/placeholder.svg"}
                                    alt={craft.title}
                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                />

                                <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-10"
                                    aria-label={`Remove ${craft.title} from favorites`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleRemoveFromFavorites(craft);
                                    }}
                                >
                                    <Bookmark className="h-4 w-4 fill-current" />
                                </Button>

                                {craft.forSale && (
                                    <Button
                                        size="sm"
                                        className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                                        aria-label={`Add ${craft.title} to cart`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleAddToCart(craft);
                                        }}
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                    </Button>
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                                    <div className="text-white">
                                        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{craft.title}</h3>
                                        <p className="text-sm text-white/90 mb-2">by {craft.userId?.fullName || craft.userId?.username || "Unknown Artist"}</p>
                                        {craft.forSale && craft.price && <p className="text-lg font-bold">{formatPrice(craft.price)}</p>}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
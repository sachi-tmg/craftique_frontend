import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify';

import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";

import { searchCreations } from "../api/api";

import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import { useFavorites } from "../contexts/favorites-context";

export default function SearchPage() {
    const { search } = useLocation();
    const { userAuth } = useAuth();
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToGuestCart } = useCart();

    const [creations, setCreations] = useState(null);
    const [loading, setLoading] = useState(true);

    const generalQuery = new URLSearchParams(search).get('q') || '';
    const categoryFilter = new URLSearchParams(search).get('category') || '';

    const fetchResults = async () => {
        setLoading(true);

        if (!generalQuery && !categoryFilter) {
            setCreations([]);
            setLoading(false);
            //console.log("Frontend: No query or category, skipping API call.");
            return;
        }

        // console.log("Frontend: Calling searchCreations with data:", {
        //     query: generalQuery,
        //     tag: categoryFilter,
        //     page: 1
        // });

        try {
            const response = await searchCreations({
                query: generalQuery,
                tag: categoryFilter,
                page: 1
            });

            //console.log("Frontend: Received API response:", response.data);

            setCreations(response.data?.creations?.map(c => ({
                id: c.creation_id,
                title: c.title,
                artist: c.username || c.fullName,
                image: c.creationPicture,
                price: c.price,
                forSale: c.forSale,
                category: c.category
            })) || []);

            //console.log("Frontend: Creations state updated:", response.data?.creations?.length || 0, "items.");

        } catch (error) {
            console.error("Frontend: Error fetching creations:", error.response?.data || error.message);
            toast.error("Failed to load search results.");
            setCreations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setCreations(null);
        setLoading(true);
        fetchResults();
    }, [search]);

    const handleAddToCart = (item) => {
        if (userAuth.access_token) {
            // Placeholder for authenticated cart logic
            toast.info("Authenticated cart logic not implemented for this demo.");
        } else {
            addToGuestCart(item);
            toast.success(`${item.title} added to guest cart!`);
        }
    };

    const handleSave = async (craft) => {
        if (!userAuth.access_token) {
            return toast.error("You need to login to save creations.");
        }
        try {
            const result = await toggleFavorite(craft.id, userAuth.access_token);
            if (result.isFavorited) {
                toast.success(`${craft.title} added to favorites!`);
            } else {
                toast.info(`${craft.title} removed from favorites!`);
            }
        } catch (error) {
            console.error("Frontend: Error toggling favorite:", error);
            toast.error("Failed to toggle favorite status.");
        }
    };

    const formatPrice = (price) => {
        return price ? `Rs. ${price.toLocaleString('en-NP')}` : 'N/A';
    };

    return (
        <div className="max-w-full px-2 sm:px-4 py-4">
            <h1 className="text-3xl font-bold mb-4">
                {categoryFilter ? `Category: ${categoryFilter}` : `Results for "${generalQuery}"`}
            </h1>

            {loading ? (
                <div className="text-center py-12 text-lg">Loading search results...</div>
            ) : creations && creations.length > 0 ? (
                <div className="masonry-grid-improved">
                    {creations.map(craft => (
                        <div key={craft.id} className="masonry-item-improved group">
                            <a href={`/craft/${craft.id}`} className="block relative">
                                <div className="relative overflow-hidden rounded-lg bg-muted">
                                    <img
                                        src={craft.image}
                                        alt={craft.title}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleSave(craft);
                                        }}
                                    >
                                        <Heart className={`h-4 w-4 ${isFavorite(craft.id) ? "fill-current" : ""}`} />
                                    </Button>
                                    {craft.forSale && (
                                        <Button
                                            size="sm"
                                            className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleAddToCart(craft);
                                            }}
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                                        <div className="text-white">
                                            <h3 className="font-semibold text-lg mb-1">{craft.title}</h3>
                                            <p className="text-sm mb-2">by {craft.artist}</p>
                                            {craft.forSale && <p className="text-lg font-bold">{formatPrice(craft.price)}</p>}
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">
                        No results found for {categoryFilter ? `"${categoryFilter}" category` : `"${generalQuery}"`}
                    </p>
                </div>
            )}
        </div>
    );
}
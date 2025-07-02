import { useEffect, useRef, useState } from "react";
// Import ToastContainer and toast from react-toastify
import { ToastContainer, toast } from 'react-toastify';
// Import the default CSS for react-toastify
import 'react-toastify/dist/ReactToastify.css';

// Import your existing UI components - keep these if your Vite alias is set up
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// REMOVED: import { useToast } from '@/components/ui/use-toast'; // Remove this line
import { Heart, ShoppingCart } from "lucide-react";
import { getTrendingCreations, latestCreations } from "../api/api";
import { useAuth } from "../contexts/auth-context";
import { useFavorites } from "../contexts/favorites-context";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  // REMOVED: const { toast } = useToast(); // No longer needed, as we import 'toast' directly from 'react-toastify'
  const masonryRef = useRef(null);

  // State to hold fetched creations data
  const [featuredCreations, setFeaturedCreations] = useState([]);
  const [trendingSectionCreations, setTrendingSectionCreations] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState(null);
  const [errorTrending, setErrorTrending] = useState(null);

  const categories = [
    { name: "Pottery", count: 245 },
    { name: "Origami", count: 187 },
    { name: "Crocheting", count: 312 },
    { name: "Painting", count: 456 },
    { name: "Embroidery", count: 123 },
    { name: "Knitting", count: 98 },
    { name: "Jewelry", count: 276 },
    { name: "Woodworking", count: 154 },
  ];

  useEffect(() => {
    const fetchCreations = async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        const response = await latestCreations({ page: 1 });

        if (response.data && Array.isArray(response.data.creations)) {
          const mappedCreations = response.data.creations.map((creation) => ({
            id: creation.creation_id,
            title: creation.title,
            artist: creation.fullName,
            category: creation.category,
            image: creation.creationPicture || "/placeholder.svg",
            likes: creation.activity?.likeCount || 0,
            forSale: creation.forSale,
            price: parseFloat(creation.price) || 0,
          }));
          setFeaturedCreations(mappedCreations);
        } else {
          throw new Error("Invalid data format received for featured creations.");
        }
      } catch (err) {
        console.error("Error fetching featured creations:", err);
        setErrorFeatured(err.message || "Failed to load featured creations.");
        // Modified toast call for react-toastify (using toast.error for destructive)
        toast.error(`Error: ${err.message || "Failed to load featured creations."}`); 
      } finally {
        setLoadingFeatured(false);
      }
    };

    fetchCreations();
  }, []); // Removed 'toast' from dependency array as it's a global function, not a hook return value

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      setErrorTrending(null);
      try {
        const response = await getTrendingCreations();
        if (response.data && Array.isArray(response.data.creations)) {
          const mappedTrending = response.data.creations.map((creation) => ({
            id: creation.creation_id,
            title: creation.title,
            artist: creation.fullName,
            category: creation.category,
            image: creation.creationPicture || "/placeholder.svg",
            likes: creation.activity?.likeCount || 0,
            forSale: creation.forSale,
            price: parseFloat(creation.price) || 0,
          }));
          setTrendingSectionCreations(mappedTrending);
        } else {
          throw new Error("Invalid data format received for trending creations.");
        }
      } catch (err) {
        console.error("Error fetching trending creations:", err);
        setErrorTrending(err.message || "Failed to load trending creations.");
        // Modified toast call for react-toastify (using toast.error for destructive)
        toast.error(`Error: ${err.message || "Failed to load trending creations."}`);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []); // Removed 'toast' from dependency array

  const formatPrice = (price) => {
    return `Rs. ${Number(price).toLocaleString()}`;
  };

  const handleSave = (craft) => {
    if (!isLoggedIn) {
      // Modified toast call for react-toastify (using toast.error for destructive/warning)
      toast.warn("Sign in required: Please sign in to save crafts to your favorites."); 
      return;
    }

    const wasAlreadyFavorite = isFavorite(craft.id);
    toggleFavorite(craft);

    const title = wasAlreadyFavorite ? "Removed from favorites" : "Saved to favorites";
    const description = wasAlreadyFavorite
      ? `${craft.title} has been removed from your favorites.`
      : `${craft.title} has been saved to your favorites.`;

    // Modified toast call for react-toastify (using toast.success)
    toast.success(`${title}: ${description}`); 
  };

  return (
    <div className="max-w-full space-y-2 px-2 sm:px-4">
      {/* Add ToastContainer component here. It handles rendering all toasts */}
      <ToastContainer 
        position="top-right" // You can customize position, autoClose, hideProgressBar etc.
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Craftique</h1>
        </div>
        <p className="text-muted-foreground">Discover and showcase handmade creations from artists around Nepal</p>
      </section>

      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto flex justify-center">
          <TabsTrigger value="featured" className="flex-1">
            Featured
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">
            Trending
          </TabsTrigger>
          <TabsTrigger value="new" className="flex-1">
            New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="space-y-6">
          <div className="masonry-grid-improved" ref={masonryRef}>
            {loadingFeatured ? (
              <div className="col-span-full text-center py-10">Loading featured creations...</div>
            ) : errorFeatured ? (
              <div className="col-span-full text-center py-10 text-red-500">{errorFeatured}</div>
            ) : featuredCreations.length > 0 ? (
              featuredCreations.map((craft) => (
                <div key={craft.id} className="masonry-item-improved group">
                  <a href={`/craft/${craft.id}`} className="block relative">
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={craft.image}
                        alt={craft.title}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />

                      <Button
                        size="sm"
                        variant="default" // Force default variant to match cart button
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label={`${isFavorite(craft.id) ? "Remove from" : "Save to"} favorites`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSave(craft);
                        }}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite(craft.id) ? "fill-current" : ""}`} />
                      </Button>

                      {craft.forSale && (
                        <Button
                          size="sm"
                          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`Add ${craft.title} to cart`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toast.success(`Added to cart: ${craft.title} has been added to your cart.`);
                          }}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}

                      <div className="absolute inset-0 bg-red/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                        <div className="text-white">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{craft.title}</h3>
                          <p className="text-sm text-white/90 mb-2">by {craft.artist}</p>
                          {craft.forSale && <p className="text-lg font-bold">{formatPrice(craft.price)}</p>}
                        </div>
                      </div>
                    </div>
                  </a>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No featured creations found.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <a href="/explore">View More</a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-6">
            {loadingTrending ? (
              <div className="text-center py-12">Loading trending creations...</div>
            ) : errorTrending ? (
              <div className="text-center py-12 text-red-500">{errorTrending}</div>
            ) : trendingSectionCreations.length > 0 ? (
              <div className="masonry-grid-improved" ref={masonryRef}>
                {trendingSectionCreations.map((craft) => (
                  <div key={craft.id} className="masonry-item-improved group">
                    <a href={`/craft/${craft.id}`} className="block relative">
                      <div className="relative overflow-hidden rounded-lg bg-muted">
                        <img
                          src={craft.image}
                          alt={craft.title}
                          style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <Button
                          size="sm"
                          variant={isFavorite(craft.id) ? "default" : "secondary"}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`${isFavorite(craft.id) ? "Remove from" : "Save to"} favorites`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSave(craft);
                          }}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(craft.id) ? "fill-current" : ""}`} />
                        </Button>
                        {craft.forSale && (
                          <Button
                            size="sm"
                            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label={`Add ${craft.title} to cart`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toast.success(`Added to cart: ${craft.title} has been added to your cart.`);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4">
                          <div className="text-white">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{craft.title}</h3>
                            <p className="text-sm text-white/90 mb-2">by {craft.artist}</p>
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
                <p className="text-muted-foreground">No trending creations found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="text-center py-12">
            <p className="text-muted-foreground">New content will appear here</p>
          </div>
        </TabsContent>
      </Tabs>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Explore Categories</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
          {categories.map((category) => (
            <a
              key={category.name}
              href={`/category/${category.name.toLowerCase()}`}
              className="category-pill snap-start"
            >
              {category.name}
            </a>
          ))}
        </div>
      </section>

      {!isLoggedIn && (
        <section className="rounded-lg bg-muted p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Creative Community</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Sign up to showcase your own creations, interact with other artists, and build your creative portfolio.
          </p>
          <Button asChild>
            <a href="/signup">Join Craftique</a>
          </Button>
        </section>
      )}
    </div>
  );
}
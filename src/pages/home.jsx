import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, Heart, ShoppingCart } from "lucide-react";
import { addToCart, getFeaturedCreations, getTrendingCreations, latestCreations } from "../api/api";
import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import { useFavorites } from "../contexts/favorites-context";

// Make sure your main container class is `main.flex-1.overflow-y-auto`
const SCROLL_CONTAINER_SELECTOR = "main.flex-1.overflow-y-auto";

export default function HomePage() {
  const { userAuth } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { addToGuestCart } = useCart();

  // Featured (random, single load)
  const [featuredCreations, setFeaturedCreations] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured] = useState(null);

  // Trending (fixed 5)
  const [trendingSectionCreations, setTrendingSectionCreations] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState(null);

  // New (infinite scroll)
  const [newCreations, setNewCreations] = useState([]);
  const [newPage, setNewPage] = useState(1);
  const [newHasMore, setNewHasMore] = useState(true);
  const [loadingNew, setLoadingNew] = useState(false);
  const [errorNew, setErrorNew] = useState(null);
  const newObserverRef = useRef(null);

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

  // --- FEATURED ---
  useEffect(() => {
    const fetchFeatured = async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        const response = await getFeaturedCreations();
        const mapped = (response.data?.creations || []).map((creation) => ({
          id: creation.creation_id,
          _id: creation._id,
          title: creation.title,
          artist: creation.userId?.fullName || "Unknown Artist",
          category: creation.category,
          image: creation.creationPicture || "/placeholder.svg",
          likes: creation.activity?.likeCount || 0,
          forSale: creation.forSale,
          price: parseFloat(creation.price) || 0,
        }));
        setFeaturedCreations(mapped);
      } catch (err) {
        setErrorFeatured(err.message || "Failed to load featured creations.");
        toast.error(`Error: ${err.message || "Failed to load featured creations."}`);
      } finally {
        setLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  // --- TRENDING ---
  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      setErrorTrending(null);
      try {
        const response = await getTrendingCreations();
        const mappedTrending = (response.data?.creations || []).map((creation) => ({
          id: creation.creation_id,
          _id: creation._id,
          title: creation.title,
          artist: creation.fullName || "NO_NAME",
          category: creation.category,
          image: creation.creationPicture || "/placeholder.svg",
          likes: creation.activity?.likeCount || 0,
          forSale: creation.forSale,
          price: parseFloat(creation.price) || 0,
        }));
        setTrendingSectionCreations(mappedTrending);
      } catch (err) {
        setErrorTrending(err.message || "Failed to load trending creations.");
        toast.error(`Error: ${err.message || "Failed to load trending creations."}`);
      } finally {
        setLoadingTrending(false);
      }
    };
    fetchTrending();
  }, []);

  // --- NEW (INFINITE SCROLL) ---
const fetchNewCreations = useCallback(
  async (page) => {
    setLoadingNew(true);
    setErrorNew(null);
    try {
      const response = await latestCreations({ page });
      const newItems = (response.data?.creations || []).map((creation) => ({
        id: creation.creation_id,
        _id: creation._id,
        title: creation.title,
        artist: creation.fullName || creation.userId?.fullName || "Unknown Artist",
        category: creation.category,
        image: creation.creationPicture || "/placeholder.svg",
        likes: creation.activity?.likeCount || 0,
        forSale: creation.forSale,
        price: parseFloat(creation.price) || 0,
      }));
      setNewCreations((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const filteredNew = newItems.filter((item) => !existingIds.has(item.id));
        return [...prev, ...filteredNew];
      });
      if (newItems.length < 9) setNewHasMore(false);
      else setNewHasMore(true);
    } catch (err) {
      setErrorNew(err.message || "Failed to load new creations.");
      toast.error(`Error: ${err.message || "Failed to load new creations."}`);
      setNewHasMore(false);
    } finally {
      setLoadingNew(false);
    }
  },
  []
);


  // First page on mount
  useEffect(() => {
    setNewCreations([]);
    setNewPage(1);
    setNewHasMore(true);
    fetchNewCreations(1);
    // eslint-disable-next-line
  }, []);

  // Infinite scroll observer for "New"
  useEffect(() => {
    if (!newHasMore || loadingNew) return;
    const sentinel = newObserverRef.current;
    if (!sentinel) return;

    // Find the scrollable container
    let scrollParent = sentinel.parentElement;
    if (SCROLL_CONTAINER_SELECTOR) {
      scrollParent = document.querySelector(SCROLL_CONTAINER_SELECTOR) || window;
    }

    let observer;
    if (scrollParent && sentinel) {
      observer = new window.IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setNewPage((page) => {
              const nextPage = page + 1;
              fetchNewCreations(nextPage);
              return nextPage;
            });
          }
        },
        {
          root: scrollParent === window ? null : scrollParent,
          rootMargin: "0px",
          threshold: 1.0,
        }
      );
      observer.observe(sentinel);
    }
    return () => {
      if (observer && sentinel) observer.unobserve(sentinel);
    };
    // eslint-disable-next-line
  }, [newHasMore, loadingNew, fetchNewCreations]);

  // --- SHARED HANDLERS ---
  const handleAddToCart = async (item) => {
    if (userAuth.isAuthenticated) {
      try {
        await addToCart(item._id, userAuth.token);
        toast.success(`${item.title} added to cart`);
      } catch (error) {
        if (error.response?.status === 409) {
          toast.info(`${item.title} is already in your cart.`);
        } else {
          toast.error(error.response?.data?.message || "Failed to add to cart");
        }
      }
    } else {
      const guestCartRaw = localStorage.getItem("guestCart");
      const guestCart = guestCartRaw ? JSON.parse(guestCartRaw) : [];
      const alreadyInCart = guestCart.some((i) => i.id === item.id);
      if (!alreadyInCart) {
        addToGuestCart(item);
        toast.success(`${item.title} added to cart`);
      } else {
        toast.info(`${item.title} is already in your cart`);
      }
    }
  };

  const formatPrice = (price) => `Rs. ${Number(price).toLocaleString()}`;
  const handleSave = (craft) => {
    if (!userAuth.isAuthenticated) {
      toast.warn("Sign in required: Please sign in to save crafts to your favorites.");
      return;
    }
    toggleFavorite(craft);
  };

  return (
    <div className="max-w-full space-y-2 px-2 sm:px-4">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Craftique</h1>
        </div>
        <p className="text-muted-foreground">Discover and showcase handmade creations from artists around Nepal</p>
      </section>

      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto flex justify-center">
          <TabsTrigger value="featured" className="flex-1">Featured</TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
          <TabsTrigger value="new" className="flex-1">New</TabsTrigger>
        </TabsList>

        {/* ----- FEATURED (Single load, 12 random) ----- */}
        <TabsContent value="featured" className="space-y-6">
          <div className="masonry-grid-improved">
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
                        style={{ width: "100%", height: "auto", objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 z-10">
                        <Button
                          size="sm"
                          variant="default"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`${isFavorite(craft.id) ? "Remove from" : "Save to"} favorites`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSave(craft);
                          }}
                        >
                          <Bookmark className={`h-4 w-4 ${isFavorite(craft.id) ? "fill-current" : ""}`} />
                        </Button>
                        {craft.forSale && (
                          <Button
                            size="sm"
                            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label={`Add ${craft.title} to cart`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(craft);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No featured creations found.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ----- TRENDING (Fixed 5) ----- */}
        <TabsContent value="trending">
          <div className="space-y-6">
            {loadingTrending ? (
              <div className="text-center py-12">Loading trending creations...</div>
            ) : errorTrending ? (
              <div className="text-center py-12 text-red-500">{errorTrending}</div>
            ) : trendingSectionCreations.length > 0 ? (
              <div className="masonry-grid-improved">
                {trendingSectionCreations.map((craft) => (
                  <div key={craft.id} className="masonry-item-improved group">
                    <a href={`/craft/${craft.id}`} className="block relative">
                      <div className="relative overflow-hidden rounded-lg bg-muted">
                        <img
                          src={craft.image}
                          alt={craft.title}
                          style={{ width: "100%", height: "auto", objectFit: "cover" }}
                          className="transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 z-10">
                          <Button
                            size="sm"
                            variant="default"
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
                              onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAddToCart(craft);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
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

        {/* ----- NEW (Infinite scroll, Pinterest style) ----- */}
        <TabsContent value="new">
          <div className="masonry-grid-improved">
            {newCreations.length === 0 && loadingNew ? (
              <div className="col-span-full text-center py-10">Loading new creations...</div>
            ) : errorNew ? (
              <div className="col-span-full text-center py-10 text-red-500">{errorNew}</div>
            ) : newCreations.length > 0 ? (
              newCreations.map((craft) => (
                <div key={craft.id} className="masonry-item-improved group">
                  <a href={`/craft/${craft.id}`} className="block relative">
                    <div className="relative overflow-hidden rounded-lg bg-muted">
                      <img
                        src={craft.image}
                        alt={craft.title}
                        style={{ width: "100%", height: "auto", objectFit: "cover" }}
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 z-10">
                        <Button
                          size="sm"
                          variant="default"
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label={`${isFavorite(craft.id) ? "Remove from" : "Save to"} favorites`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSave(craft);
                          }}
                        >
                          <Bookmark className={`h-4 w-4 ${isFavorite(craft.id) ? "fill-current" : ""}`} />
                        </Button>
                        {craft.forSale && (
                          <Button
                            size="sm"
                            className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            aria-label={`Add ${craft.title} to cart`}
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(craft);
                            }}
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">No new creations found.</p>
              </div>
            )}
            {/* Sentinel for infinite scroll */}
            {newHasMore && !loadingNew && (
              <div
                ref={newObserverRef}
                style={{
                  width: "100%",
                  height: 40,
                  background: "transparent",
                  display: "block",
                }}
              />
            )}
            {loadingNew && newCreations.length > 0 && (
              <div className="col-span-full text-center py-6">Loading more...</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* <section className="space-y-4">
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
      </section> */}

      {!userAuth.isAuthenticated && (
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

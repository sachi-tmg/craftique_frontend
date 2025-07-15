import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bookmark, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  addToCart,
  getTrendingCreations,
  latestCreations,
} from "../api/api";
import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";
import { useFavorites } from "../contexts/favorites-context";

export default function ExplorePage() {
  const { userAuth } = useAuth();
  const { addToGuestCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const masonryRef = useRef(null);

  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState({
    categories: [],
    priceRange: { min: 0, max: 50000 },
    availability: "all",
  });

  const categories = [
    "Pottery",
    "Origami",
    "Embroidery",
    "Painting",
    "Weaving",
    "Macramé",
    "Woodworking",
    "Jewelry",
    "Knitting",
    "Digital Art",
    "Photography",
    "Graphic Design",
    "Other",
  ];

  useEffect(() => {
    const fetchAndSortCreations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          sortBy === "trending"
            ? await getTrendingCreations()
            : await latestCreations({ page: 1 });

        const fetchedCreations = response?.data?.creations;

        if (Array.isArray(fetchedCreations)) {
          let mappedCreations = fetchedCreations.map((creation) => {
            const normalizedCategory =
              creation.category?.trim().toLowerCase() || "";
            return {
              id: creation.creation_id,
              _id: creation._id,
              title: creation.title,
              artist:
                creation.fullName ||
                creation.userId?.fullName ||
                "Unknown Artist",
              category: normalizedCategory,
              image: creation.creationPicture || "/placeholder.svg",
              likes: creation.activity?.likeCount || 0,
              forSale: creation.forSale,
              price: parseFloat(creation.price) || 0,
              height: Math.floor(Math.random() * 20) + 30,
            };
          });

          if (filters.categories.length > 0) {
            const normalizedFilterCategories = filters.categories.map((cat) =>
              cat.toLowerCase()
            );
            mappedCreations = mappedCreations.filter((creation) =>
              normalizedFilterCategories.includes(creation.category)
            );
          }

          if (filters.availability !== "all") {
            mappedCreations = mappedCreations.filter((creation) =>
              filters.availability === "forSale"
                ? creation.forSale
                : !creation.forSale
            );
          }

          mappedCreations = mappedCreations.filter(
            (creation) =>
              creation.price >= filters.priceRange.min &&
              creation.price <= filters.priceRange.max
          );

          if (sortBy === "price-low") {
            mappedCreations.sort((a, b) => a.price - b.price);
          } else if (sortBy === "price-high") {
            mappedCreations.sort((a, b) => b.price - a.price);
          }

          setCreations(mappedCreations);
        } else {
          throw new Error("Unexpected response from server.");
        }
      } catch (err) {
        console.error("Error fetching creations:", err);

        if (err.message === "Unexpected response from server.") {
          setError("Server returned invalid data.");
          toast.error("Server returned invalid data.");
        } else {
          setError(err.message || "Failed to load creations.");
          toast.error(err.message || "Failed to load creations.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortCreations();
  }, [sortBy, filters]);

  const handleAddToCart = async (item) => {
    if (userAuth.isAuthenticated) {
      try {
        await addToCart(item._id, userAuth.token);
        toast.success(`${item.title} added to cart`);
      } catch (error) {
        if (error.response?.status === 409) {
          toast.info(`${item.title} is already in your cart.`);
        } else {
          toast.error(
            error.response?.data?.message || "Failed to add to cart"
          );
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

  const handleSave = (craft) => {
    if (!userAuth.isAuthenticated) {
      toast.error("Please sign in to save crafts to your favorites.");
      return;
    }

    const wasAlreadyFavorite = isFavorite(craft.id);
    toggleFavorite(craft);

    toast.success(
      wasAlreadyFavorite
        ? `${craft.title} removed from favorites.`
        : `${craft.title} added to favorites.`
    );
  };

  const formatPrice = (price) => `Rs. ${Number(price).toLocaleString()}`;

  return (
    <div className="max-w-full space-y-6 px-2 sm:px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Creations</h1>
          <p className="text-muted-foreground">
            Discover handmade creations from talented artists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(val) => setSortBy(val)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        {/* Filters */}
        <div className="hidden md:block">
          <div className="rounded-lg border p-4 sticky top-20">
            <h3 className="text-lg font-medium mb-4">Categories</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="grid gap-2">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-category-${category.toLowerCase()}`}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          setFilters((prev) => ({
                            ...prev,
                            categories: checked
                              ? [...prev.categories, category]
                              : prev.categories.filter((c) => c !== category),
                          }));
                        }}
                      />
                      <Label htmlFor={`filter-category-${category.toLowerCase()}`}>
                        {category}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Price Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          min: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          max: parseInt(e.target.value) || 50000,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Availability</h4>
                <div className="grid gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.availability === "forSale"}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          availability: checked ? "forSale" : "all",
                        }))
                      }
                    />
                    <Label>For Sale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={filters.availability === "showcaseOnly"}
                      onCheckedChange={(checked) =>
                        setFilters((prev) => ({
                          ...prev,
                          availability: checked ? "showcaseOnly" : "all",
                        }))
                      }
                    />
                    <Label>Showcase Only</Label>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFilters({
                    categories: [],
                    priceRange: { min: 0, max: 50000 },
                    availability: "all",
                  });
                  setSortBy("featured");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="col-span-full text-center py-10">Loading creations...</div>
        ) : creations.length > 0 ? (
          <div className="masonry-grid-improved" ref={masonryRef}>
            {creations.map((craft) => (
              <div key={craft.id} className="masonry-item-improved group">
                <a href={`/craft/${craft.id}`} className="block relative">
                  <div className="relative overflow-hidden rounded-lg bg-muted">
                    <img
                      src={craft.image}
                      alt={craft.title}
                      className="transition-transform duration-300 group-hover:scale-105 w-full h-auto object-cover"
                    />
                    <div className="absolute inset-0 z-10">
                      <Button
                        size="sm"
                        variant="default"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        aria-label="Favorite"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSave(craft);
                        }}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${
                            isFavorite(craft.id) ? "fill-current" : ""
                          }`}
                        />
                      </Button>
                      {craft.forSale && (
                        <Button
                          size="sm"
                          className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          aria-label="Add to cart"
                          onClick={(e) => {
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
                        {craft.forSale && (
                          <p className="text-lg font-bold">{formatPrice(craft.price)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center justify-center py-16 space-y-4">
            <div className="text-muted-foreground text-lg">
              No creations found matching your filters.
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  categories: [],
                  priceRange: { min: 0, max: 50000 },
                  availability: "all",
                });
                setSortBy("featured");
              }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

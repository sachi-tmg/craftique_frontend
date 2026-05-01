import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, LogIn, ShoppingCart, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getCart, removeFromCart } from "../api/api";
import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";

export default function CartPage() {
  const { userAuth } = useAuth();
  const {
    guestCart,
    removeFromGuestCart,
  } = useCart();

  const [userCart, setUserCart] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  // Fetch user cart from backend
  useEffect(() => {
    if (userAuth.isAuthenticated) {
      const fetchCartItems = async () => {
        try {
          const res = await getCart(userAuth.token);
          const items = res.data.items.map(item => ({
            id: item.creationId._id,
            _id: item.creationId._id,
            title: item.creationId.title,
            artist: item.creationId.userId?.fullName || "Unknown",
            image: item.creationId.creationPicture || "/placeholder.svg",
            price: parseFloat(item.creationId.price) || 0,
          }));
          setUserCart(items);
        } catch (err) {
          toast.error("Failed to load cart items.");
        }
      };
      fetchCartItems();
    }
  }, [userAuth.isAuthenticated, userAuth.token]);

  // Always update cartItems dynamically
  useEffect(() => {
    setCartItems(userAuth.isAuthenticated ? userCart : guestCart);
  }, [userCart, guestCart, userAuth.isAuthenticated]);

  const removeItem = async (id) => {
    if (!userAuth.isAuthenticated) {
      removeFromGuestCart(id);
      toast.success("Item removed from cart");
    } else {
      try {
        await removeFromCart(id, userAuth.token);
        setUserCart(prev => prev.filter(item => item.id !== id));
        toast.success("Item removed from cart");
      } catch (err) {
        toast.error("Error removing item");
      }
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const tax = subtotal * 0.15;

  return (
    <div className="max-w-full space-y-8 px-2 sm:px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-muted-foreground">Review and checkout your selected items</p>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Items ({cartItems.length})</h2>
            {cartItems.map(item => (
              <Card key={item._id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="h-40 w-full sm:w-40 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">by {item.artist}</p>
                        </div>
                        <p className="font-semibold">Rs. {item.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">1 item</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item._id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details before checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>From Rs. 0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>Rs. {tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Estimated Total</span>
                  <span>Rs. {(subtotal + tax).toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Final total will be calculated at checkout based on your delivery choice within Kathmandu Valley.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {userAuth.isAuthenticated ? (
                  <Button className="w-full" asChild>
                    <a href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                ) : (
                  <>
                    <Button variant="default" className="w-full" asChild>
                      <a href="/login">
                        <LogIn className="mr-2 h-4 w-4" />
                        Log in to Checkout
                      </a>
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
          <Button asChild className="mt-6">
            <a href="/explore">Browse Creations</a>
          </Button>
        </div>
      )}
    </div>
  );
}

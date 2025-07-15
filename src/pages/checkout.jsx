import { clearCartAPI, savingOrders } from "@/api/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowRight, Check, ChevronLeft, Loader2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { PaymentMethods } from "../components/payment";
import { useAuth } from "../contexts/auth-context";
import { useCart } from "../contexts/cart-context";

export default function CheckoutPage() {
  const { userAuth } = useAuth();
  const { guestCart, userCart, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const buyNowItem = location.state?.buyNowItem;
  const cartItems = buyNowItem
    ? [buyNowItem]
    : userAuth.isAuthenticated ? userCart : guestCart;

  // State management
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("pickup");
  const [esewaPaid, setEsewaPaid] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    firstName: userAuth.user?.firstName || "",
    lastName: userAuth.user?.lastName || "",
    email: userAuth.user?.email || "",
    phone: userAuth.user?.phone || "",
    address: "",
    city: "Kathmandu",
    zip: "",
    deliveryNotes: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // Totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const deliveryFee = deliveryOption === "pickup" ? 0 : 100;
  const tax = subtotal * 0.15;
  const total = subtotal + deliveryFee + tax;

  // Autofill for auth users
  useEffect(() => {
    if (userAuth.isAuthenticated && userAuth.user) {
      setFormData(prev => ({
        ...prev,
        firstName: userAuth.user.firstName || "",
        lastName: userAuth.user.lastName || "",
        email: userAuth.user.email || "",
        phone: userAuth.user.phone || ""
      }));
    }
  }, [userAuth.isAuthenticated, userAuth.user]);

  // Listen for eSewa popup message
  useEffect(() => {
    const handleEsewaMessage = (event) => {
      if (event.data?.type === "esewaPaymentComplete") {
        if (event.data.success) {
          setEsewaPaid(true);
          toast.success("eSewa payment successful!");
          handleEsewaOrder();
        } else {
          toast.error("Payment failed " + (event.data.message || ""));
        }
      }
    };
    window.addEventListener("message", handleEsewaMessage);
    return () => window.removeEventListener("message", handleEsewaMessage);
  }, [cartItems, deliveryOption, formData, userAuth.token]); // keep latest state

  // Validation
  const validateForm = () => {
    const newErrors = {};
    if (deliveryOption === "local") {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.phone.trim()) {
        newErrors.phone = "Phone number is required";
      } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
        newErrors.phone = "Invalid phone number";
      }
      if (!formData.address.trim()) newErrors.address = "Address is required";
      if (!formData.zip.trim()) newErrors.zip = "ZIP code is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const validatePayment = () => {
    if (paymentMethod === "card") {
      const newErrors = {};
      const today = new Date();
      const currentYear = today.getFullYear() % 100;
      const currentMonth = today.getMonth() + 1;
      const [month, year] = cardDetails.expiry.split("/").map(Number);
      if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ""))) {
        newErrors.number = "Card number must be 16 digits";
      }
      if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
        newErrors.expiry = "Invalid format (MM/YY)";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.expiry = "Card has expired";
      }
      if (!/^\d{3}$/.test(cardDetails.cvc)) {
        newErrors.cvc = "CVC must be 3 digits";
      }
      if (!cardDetails.name.trim()) {
        newErrors.name = "Name is required";
      }
      setPaymentErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  // Handle eSewa order creation
  const handleEsewaOrder = async () => {
    try {
      setIsProcessing(true);
      await processOrder(true); // pass true to skip payment check
      setIsProcessing(false);
    } catch {
      setIsProcessing(false);
    }
  };

  // Main order process
  const processOrder = async (skipPayment = false) => {
    setIsProcessing(true);
    setSubmitError("");
    // eSewa flow: skip payment validation, must be paid already
    if (paymentMethod === "esewa" && (esewaPaid || skipPayment)) {
      try {
        if (!userAuth.isAuthenticated || !userAuth.token) {
          toast.error("You must be logged in to place an order.");
          setIsProcessing(false);
          return;
        }
        const orderData = {
          items: cartItems.map(item => ({
            _id: item._id,
            title: item.title,
            quantity: item.quantity || 1,
            price: item.price,
            image: item.image
          })),
          deliveryOption,
          paymentMethod,
          totalAmount: total,
          subtotal,
          taxAmount: tax,
          deliveryCharge: deliveryFee,
          shippingAddress: {
            street: formData.address || (deliveryOption === "pickup" ? "N/A" : ""),
            city: formData.city,
            zip: formData.zip || (deliveryOption === "pickup" ? "N/A" : ""),
          },
          customerEmail: formData.email,
          customerPhone: formData.phone,
        };
        const backendOrderNumber = await sendOrderToBackend(orderData, userAuth.token);
        setOrderNumber(backendOrderNumber);
        setShowSuccessDialog(true);
        clearCart();
        if (userAuth.isAuthenticated) {
          try { await clearCartAPI(userAuth.token); } catch {}
        }
        // toast.success("Your order has been placed!");
      } catch (error) {
        setSubmitError(error.message);
        toast.error(error.message);
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Normal card/cash
    const isFormValid = validateForm();
    const isPaymentValid = validatePayment();
    if (!isFormValid || !isPaymentValid) {
      setIsProcessing(false);
      setSubmitError(paymentMethod === "esewa"
        ? "Please complete eSewa payment first!"
        : "Please correct the errors in the form.");
      toast.error(paymentMethod === "esewa"
        ? "Please complete eSewa payment first!"
        : "Please correct the errors in the form.");
      return;
    }

    try {
      const token = userAuth.token;
      if (!userAuth.isAuthenticated || !token) {
        toast.error("You must be logged in to place an order.");
        setIsProcessing(false);
        return;
      }
      const orderData = {
        items: cartItems.map(item => ({
          _id: item._id,
          title: item.title,
          quantity: item.quantity || 1,
          price: item.price,
          image: item.image
        })),
        deliveryOption,
        paymentMethod,
        totalAmount: total,
        subtotal,
        taxAmount: tax,
        deliveryCharge: deliveryFee,
        shippingAddress: {
          street: formData.address || (deliveryOption === "pickup" ? "N/A" : ""),
          city: formData.city,
          zip: formData.zip || (deliveryOption === "pickup" ? "N/A" : ""),
        },
        customerEmail: formData.email,
        customerPhone: formData.phone,
      };
      const backendOrderNumber = await sendOrderToBackend(orderData, userAuth.token);
      setOrderNumber(backendOrderNumber);
      setShowSuccessDialog(true);
      if (!buyNowItem) {
        clearCart();
        if (userAuth.isAuthenticated) {
          try {
            await clearCartAPI(userAuth.token);
          } catch (error) {
            toast.warning("Order placed but cart might not be fully cleared");
          }
        }
      }
      toast.success("Your order has been placed!");
    } catch (error) {
      setSubmitError(error.message);
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // eSewa popup
  const handleEsewaRedirectPayment = async () => {
    setIsProcessing(true);
    setSubmitError("");
    try {
      const backendUrl = "http://localhost:3000";
      const endpoint = `${backendUrl}/api/payment/initialize-esewa`;
      const tempOrderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userAuth.token}`
        },
        body: JSON.stringify({
          amount: total,
          orderId: tempOrderId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        const esewaRedirectUrl = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
        const successCallbackUrl = `${window.location.origin}/verify-esewa?success=1&paymentId=${data.payment.transaction_uuid}`;
        const failureCallbackUrl = `${window.location.origin}/verify-esewa?success=0&paymentId=${data.payment.transaction_uuid}`;
        const params = {
          amount: data.payment.amount,
          tax_amount: "0",
          total_amount: data.payment.amount,
          transaction_uuid: data.payment.transaction_uuid,
          product_code: data.payment.product_code,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: successCallbackUrl,
          failure_url: failureCallbackUrl,
          signed_field_names: data.payment.signed_field_names,
          signature: data.payment.signature,
        };
        const popup = window.open('', 'esewaPopup', 'width=600,height=700,resizable=yes,scrollbars=yes');
        if (!popup) throw new Error("Popup blocked! Please enable popups for this site.");
        const form = document.createElement("form");
        form.method = "POST";
        form.action = esewaRedirectUrl;
        form.target = 'esewaPopup';
        Object.entries(params).forEach(([key, value]) => {
          const hiddenField = document.createElement("input");
          hiddenField.type = "hidden";
          hiddenField.name = key;
          hiddenField.value = value;
          form.appendChild(hiddenField);
        });
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } else {
        toast.error(data.message || "Failed to initialize eSewa payment");
        setIsProcessing(false);
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while initializing payment.");
      setIsProcessing(false);
    }
  };

  // Util
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 2
    }).format(amount).replace('NPR', 'Rs.');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };
  const handleCardInputChange = (field, value) => {
    let formattedValue = value;
    if (field === "number") {
      formattedValue = value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
    } else if (field === "expiry") {
      const v = value.replace(/\D/g, "");
      formattedValue = v.length >= 3 ? v.slice(0, 2) + "/" + v.slice(2, 4) : v;
    } else if (field === "cvc") {
      formattedValue = value.replace(/\D/g, "");
    }
    setCardDetails(prev => ({ ...prev, [field]: formattedValue }));
    if (paymentErrors[field]) setPaymentErrors(prev => ({ ...prev, [field]: "" }));
  };

  const sendOrderToBackend = async (orderData, token) => {
    const result = await savingOrders(orderData, token);
    return result.data.orderNumber;
  };

  // --- EARLY EXIT: show only success dialog after order complete
  if (showSuccessDialog) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Dialog open={showSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Order Confirmed!</DialogTitle>
              <DialogDescription>
                Your order #{orderNumber} has been placed successfully
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="space-y-3 text-center">
              <p>We've sent a confirmation to {formData.email || "your email"}</p>
              {deliveryOption === "pickup" ? (
                <p className="text-sm text-muted-foreground">
                  Your items will be ready for pickup within 1-2 business days
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Your order will be delivered in 2-3 business days
                </p>
              )}
            </div>
            <DialogFooter className="sm:justify-center">
              <Button asChild className="w-full">
                <a href={`/orders/${orderNumber}`}>View Order Details</a>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // --- Main Checkout UI (hidden after success)
  return (
    <div className="max-w-full space-y-4 px-2 py-1">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/cart">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back to cart</span>
          </a>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>
      {!buyNowItem && cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <p className="mt-2 text-muted-foreground">Add items to your cart to proceed to checkout</p>
          <Button asChild className="mt-6">
            <a href="/explore">Browse Creations</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
            {/* Delivery Options */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Options</CardTitle>
                <CardDescription>Choose how you'd like to receive your items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <div className="flex-1">
                      <Label htmlFor="pickup" className="text-base font-medium">
                        On-site Pickup (Free)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Pick up at our studio: Thamel, Kathmandu
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-4">
                    <RadioGroupItem value="local" id="local" />
                    <div className="flex-1">
                      <Label htmlFor="local" className="text-base font-medium">
                        Local Delivery ({formatCurrency(100)})
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Delivery within Kathmandu Valley
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
            {/* Delivery Info */}
            {deliveryOption === "local" && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                  <CardDescription>Enter your delivery address</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className={errors.firstName ? "border-destructive" : ""}
                      />
                      {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className={errors.lastName ? "border-destructive" : ""}
                      />
                      {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange("zip", e.target.value)}
                        className={errors.zip ? "border-destructive" : ""}
                      />
                      {errors.zip && <p className="text-sm text-destructive">{errors.zip}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">Delivery Notes (Optional)</Label>
                    <Input
                      id="deliveryNotes"
                      value={formData.deliveryNotes}
                      onChange={(e) => handleInputChange("deliveryNotes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Payment */}
            <PaymentMethods
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              cardDetails={cardDetails}
              onCardChange={handleCardInputChange}
              errors={paymentErrors}
              deliveryOption={deliveryOption}
              onEsewaPayment={handleEsewaRedirectPayment}
              isProcessing={isProcessing}
              esewaPaid={esewaPaid}
            />
          </div>
          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your order details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Accordion type="single" collapsible defaultValue="items">
                  <AccordionItem value="items">
                    <AccordionTrigger>Items ({cartItems.length})</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item._id} className="flex gap-3">
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{item.title}</h4>
                              <p className="text-xs text-muted-foreground">by {item.artist}</p>
                              <div className="mt-1 flex items-center justify-between">
                                <p className="text-xs">Qty: {item.quantity || 1}</p>
                                <p className="text-sm font-medium">{formatCurrency(item.price * (item.quantity || 1))}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>{deliveryOption === "pickup" ? "Free" : formatCurrency(deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (15%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => {
                    if (paymentMethod === "esewa") {
                      if (!esewaPaid) {
                        setSubmitError("Please complete eSewa payment first!");
                        toast.error("Please complete eSewa payment first!");
                        return;
                      }
                    }
                    processOrder();
                  }}
                  disabled={isProcessing || (paymentMethod === "cash" && deliveryOption !== "pickup") || (paymentMethod === "esewa" && !esewaPaid)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

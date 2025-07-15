// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle
// // } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Check, Loader2, QrCode, RefreshCw } from 'lucide-react';
// // import { useEffect, useState } from 'react';
// // import { toast } from 'react-toastify';

// // export const PaymentMethods = ({ 
// //   total, 
// //   onPaymentSuccess, 
// //   paymentMethod, 
// //   setPaymentMethod,
// //   deliveryOption 
// // }) => {
// //   const [cardDetails, setCardDetails] = useState({
// //     number: '',
// //     expiry: '',
// //     cvc: '',
// //     name: ''
// //   });
// //   const [errors, setErrors] = useState({});
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const [qrExpiry, setQrExpiry] = useState(300);
// //   const [qrRefreshing, setQrRefreshing] = useState(false);
// //   const [showQR, setShowQR] = useState(false);

// //   // Esewa QR code generation (simplified)
// //     const generateEsewaQR = async (amount) => {
// //     try {
// //         setIsProcessing(true);
// //         const response = await fetch('/api/payment/qr-generate', {  // Your backend endpoint
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ amount })
// //         });
        
// //         if (!response.ok) throw new Error('Failed to generate QR');
// //         const { qrUrl, expiry } = await response.json();
        
// //         return { qrUrl, expiry };
// //     } catch (error) {
// //         toast.error("Failed to generate QR code");
// //         console.error(error);
// //         return {
// //         qrUrl: "/qr-fallback.png",
// //         expiry: 300
// //         };
// //     } finally {
// //         setIsProcessing(false);
// //     }
// //     };

// //   const [esewaQR, setEsewaQR] = useState(() => generateEsewaQR(total));

// //     const handleQRGeneration = async () => {
// //     try {
// //         setIsProcessing(true);
// //         const response = await generateEsewaQR(total, userAuth.token); // Use the imported function
// //         setEsewaQR({
// //         qrUrl: response.data.qrUrl,
// //         expiry: response.data.expiry || 300
// //         });
// //         setShowQR(true);
// //     } catch (error) {
// //         toast.error("Failed to generate QR code");
// //         console.error(error);
// //         setEsewaQR({
// //         qrUrl: "/qr-fallback.png",
// //         expiry: 300
// //         });
// //     } finally {
// //         setIsProcessing(false);
// //     }
// //     };

// //   // Refresh QR code
// //   const refreshQR = () => {
// //     setQrRefreshing(true);
// //     setTimeout(() => {
// //       setEsewaQR(generateEsewaQR(total));
// //       setQrExpiry(300);
// //       setQrRefreshing(false);
// //       toast.success("QR code refreshed!");
// //     }, 1000);
// //   };

// //   // Handle QR expiry timer
// //   useEffect(() => {
// //     let interval;
// //     if (paymentMethod === 'qr' && qrExpiry > 0 && showQR) {
// //       interval = setInterval(() => {
// //         setQrExpiry(prev => prev - 1);
// //       }, 1000);
// //     }
// //     return () => clearInterval(interval);
// //   }, [paymentMethod, qrExpiry, showQR]);

// //   // Validate card details
// //   const validateCard = () => {
// //     const newErrors = {};
// //     const today = new Date();
// //     const currentYear = today.getFullYear() % 100;
// //     const currentMonth = today.getMonth() + 1;
// //     const [month, year] = cardDetails.expiry.split('/').map(Number);
    
// //     // Card number validation (exactly 16 digits)
// //     if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ''))) {
// //       newErrors.number = 'Card number must be 16 digits';
// //     }
    
// //     // Expiry date validation
// //     if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
// //       newErrors.expiry = 'Invalid format (MM/YY)';
// //     } else {
// //       if (year < currentYear || (year === currentYear && month < currentMonth)) {
// //         newErrors.expiry = 'Card has expired';
// //       }
// //     }
    
// //     // CVC validation (exactly 3 digits)
// //     if (!/^\d{3}$/.test(cardDetails.cvc)) {
// //       newErrors.cvc = 'CVC must be 3 digits';
// //     }
    
// //     // Name validation
// //     if (!cardDetails.name.trim()) {
// //       newErrors.name = 'Name is required';
// //     }
    
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   // Process payment based on method
// //     const processPayment = () => {
// //     if (paymentMethod === 'card') {
// //         if (!validateCard()) return;
// //         setIsProcessing(true);
// //         setTimeout(() => {
// //         setIsProcessing(false);
// //         onPaymentSuccess();
// //         }, 2000);
// //     } 
// //     else if (paymentMethod === 'qr') {
// //         handleQRGeneration();
// //     }
// //     else if (paymentMethod === 'cash') {
// //         setIsProcessing(true);
// //         setTimeout(() => {
// //         setIsProcessing(false);
// //         onPaymentSuccess();
// //         }, 1000);
// //     }
// //     };

// //   // Format card number as user types (XXXX XXXX XXXX XXXX)
// //   const formatCardNumber = (value) => {
// //     const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
// //     if (v.length > 16) return cardDetails.number;
// //     const matches = v.match(/\d{4,16}/g);
// //     const match = matches?.[0] || '';
// //     return match.replace(/(\d{4})(?=\d)/g, '$1 ');
// //   };

// //   // Format expiry date as user types (MM/YY)
// //   const formatExpiryDate = (value) => {
// //     const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
// //     if (v.length > 4) return cardDetails.expiry;
// //     if (v.length >= 3) {
// //       return v.substring(0, 2) + '/' + v.substring(2, 4);
// //     }
// //     return v;
// //   };

// //   const handlePaymentMethodChange = (method) => {
// //     setPaymentMethod(method);
// //     setShowQR(false);
// //     setErrors({});
// //   };

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle>Payment Method</CardTitle>
// //         <CardDescription>Choose how you want to pay</CardDescription>
// //       </CardHeader>
// //       <CardContent>
// //         <Tabs value={paymentMethod} onValueChange={handlePaymentMethodChange}>
// //           <TabsList className="grid w-full grid-cols-3">
// //             <TabsTrigger value="card">Card</TabsTrigger>
// //             <TabsTrigger value="cash">Cash</TabsTrigger>
// //             <TabsTrigger value="qr">QR</TabsTrigger>
// //           </TabsList>
          
// //           {/* Card Payment */}
// //           <TabsContent value="card" className="space-y-4 pt-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="cardNumber">Card Number *</Label>
// //               <Input
// //                 id="cardNumber"
// //                 placeholder="1234 5678 9012 3456"
// //                 value={cardDetails.number}
// //                 onChange={(e) => setCardDetails({...cardDetails, number: formatCardNumber(e.target.value)})}
// //                 maxLength={19}
// //                 className={errors.number ? "border-destructive" : ""}
// //               />
// //               {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="expiryDate">Expiry Date *</Label>
// //                 <Input
// //                   id="expiryDate"
// //                   placeholder="MM/YY"
// //                   value={cardDetails.expiry}
// //                   onChange={(e) => setCardDetails({...cardDetails, expiry: formatExpiryDate(e.target.value)})}
// //                   maxLength={5}
// //                   className={errors.expiry ? "border-destructive" : ""}
// //                 />
// //                 {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="cvc">CVC *</Label>
// //                 <Input
// //                   id="cvc"
// //                   placeholder="123"
// //                   value={cardDetails.cvc}
// //                   onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.replace(/\D/g, '')})}
// //                   maxLength={3}
// //                   className={errors.cvc ? "border-destructive" : ""}
// //                 />
// //                 {errors.cvc && <p className="text-sm text-destructive">{errors.cvc}</p>}
// //               </div>
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="cardName">Name on Card *</Label>
// //               <Input
// //                 id="cardName"
// //                 placeholder="John Doe"
// //                 value={cardDetails.name}
// //                 onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
// //                 className={errors.name ? "border-destructive" : ""}
// //               />
// //               {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
// //             </div>
// //           </TabsContent>
          
// //           {/* Cash Payment */}
// //           <TabsContent value="cash" className="pt-4">
// //             <div className="rounded-lg border p-4 text-center">
// //               <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
// //                 <svg
// //                   xmlns="http://www.w3.org/2000/svg"
// //                   width="24"
// //                   height="24"
// //                   viewBox="0 0 24 24"
// //                   fill="none"
// //                   stroke="currentColor"
// //                   strokeWidth="2"
// //                   strokeLinecap="round"
// //                   strokeLinejoin="round"
// //                   className="text-primary"
// //                 >
// //                   <rect width="18" height="12" x="3" y="6" rx="2" />
// //                   <circle cx="12" cy="12" r="3" />
// //                   <path d="M3 10h4" />
// //                   <path d="M3 14h4" />
// //                   <path d="M17 10h4" />
// //                   <path d="M17 14h4" />
// //                 </svg>
// //               </div>
// //               <p className="mb-4">Pay with cash when you pick up your items</p>
// //               {deliveryOption !== "pickup" && (
// //                 <p className="text-sm text-destructive">
// //                   Cash payment is only available for pickup orders
// //                 </p>
// //               )}
// //             </div>
// //           </TabsContent>
          
// //           {/* QR Payment */}
// //           <TabsContent value="qr" className="pt-4">
// //             {showQR ? (
// //                 <div className="space-y-4">
// //                 <div className="rounded-lg border p-4 text-center">
// //                     <div className="relative mx-auto w-64 h-64">
// //                     {qrRefreshing ? (
// //                         <div className="flex h-full items-center justify-center">
// //                         <Loader2 className="h-8 w-8 animate-spin" />
// //                         </div>
// //                     ) : (
// //                         <>
// //                         <img 
// //                             src={esewaQR.qrUrl} 
// //                             alt="Esewa QR Code" 
// //                             className="w-full h-full object-contain"
// //                         />
// //                         <button 
// //                             onClick={refreshQR}
// //                             className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
// //                         >
// //                             <RefreshCw className="h-4 w-4" />
// //                         </button>
// //                         </>
// //                     )}
// //                     </div>
// //                     <p className="mt-4 font-medium">Scan to pay Rs. {total.toFixed(2)}</p>
// //                     <p className="text-sm text-muted-foreground">
// //                     Expires in: {Math.floor(qrExpiry / 60)}:{String(qrExpiry % 60).padStart(2, '0')}
// //                     </p>
// //                 </div>
// //                 <div className="flex gap-2">
// //                     <Button 
// //                     variant="outline" 
// //                     className="flex-1" 
// //                     onClick={refreshQR}
// //                     disabled={qrRefreshing}
// //                     >
// //                     {qrRefreshing ? (
// //                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                     ) : (
// //                         <RefreshCw className="mr-2 h-4 w-4" />
// //                     )}
// //                     Refresh QR
// //                     </Button>
// //                     <Button 
// //                     className="flex-1" 
// //                     onClick={onPaymentSuccess}
// //                     >
// //                     <Check className="mr-2 h-4 w-4" />
// //                     I've Paid
// //                     </Button>
// //                 </div>
// //                 </div>
// //             ) : (
// //                 <div className="rounded-lg border p-4 text-center">
// //                 <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
// //                     <QrCode className="h-6 w-6 text-primary" />
// //                 </div>
// //                 <p className="mb-4">Pay with eSewa QR</p>
// //                 <p className="text-sm text-muted-foreground">
// //                     Click "Complete Payment" to generate QR code
// //                 </p>
// //                 </div>
// //             )}
// //             </TabsContent>
// //         </Tabs>

// //         {/* Payment Button */}
// //         <Button
// //           className="w-full mt-6"
// //           onClick={processPayment}
// //           disabled={isProcessing || (paymentMethod === 'cash' && deliveryOption !== 'pickup')}
// //         >
// //           {isProcessing ? (
// //             <>
// //               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //               Processing...
// //             </>
// //           ) : (
// //             'Complete Payment'
// //           )}
// //         </Button>
// //       </CardContent>
// //     </Card>
// //   );
// // };



// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Loader2 } from "lucide-react";
// // import { useState } from "react";
// // import { toast } from "react-toastify";
// // import { useAuth } from "../contexts/auth-context";

// // export const PaymentMethods = ({
// //   total,
// //   onPaymentSuccess,
// //   paymentMethod,
// //   setPaymentMethod,
// //   deliveryOption,
// // }) => {
// //   const [cardDetails, setCardDetails] = useState({
// //     number: "",
// //     expiry: "",
// //     cvc: "",
// //     name: "",
// //   });
// //   const [errors, setErrors] = useState({});
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const { userAuth } = useAuth();

// //   const handlePaymentMethodChange = (method) => {
// //     setPaymentMethod(method);
// //     setErrors({});
// //   };

// //   const validateCard = () => {
// //     const newErrors = {};
// //     const today = new Date();
// //     const currentYear = today.getFullYear() % 100;
// //     const currentMonth = today.getMonth() + 1;
// //     const [month, year] = cardDetails.expiry.split("/").map(Number);

// //     if (!/\d{16}/.test(cardDetails.number.replace(/\s/g, ""))) {
// //       newErrors.number = "Card number must be 16 digits";
// //     }
// //     if (!/\d{2}/.test(month) || !/\d{2}/.test(year)) {
// //       newErrors.expiry = "Invalid format (MM/YY)";
// //     } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
// //       newErrors.expiry = "Card has expired";
// //     }
// //     if (!/\d{3}/.test(cardDetails.cvc)) {
// //       newErrors.cvc = "CVC must be 3 digits";
// //     }
// //     if (!cardDetails.name.trim()) {
// //       newErrors.name = "Name is required";
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const processPayment = () => {
// //     if (paymentMethod === "card") {
// //       if (!validateCard()) return;
// //       setIsProcessing(true);
// //       setTimeout(() => {
// //         setIsProcessing(false);
// //         toast.success("Card payment simulated successfully!");
// //         onPaymentSuccess();
// //       }, 2000);
// //     } else if (paymentMethod === "cash") {
// //       setIsProcessing(true);
// //       setTimeout(() => {
// //         setIsProcessing(false);
// //         toast.success("Cash payment selected. Order confirmed!");
// //         onPaymentSuccess();
// //       }, 1000);
// //     }
// //   };

// //   const formatCardNumber = (value) => {
// //     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
// //     if (v.length > 16) return cardDetails.number;
// //     return v.replace(/(\d{4})(?=\d)/g, "$1 ");
// //   };

// //   const formatExpiryDate = (value) => {
// //     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
// //     if (v.length >= 3) {
// //       return v.substring(0, 2) + "/" + v.substring(2, 4);
// //     }
// //     return v;
// //   };

// // const handleEsewaRedirectPayment = async () => {
// //   setIsProcessing(true);
// //   try {
// //     const response = await fetch("/api/payment/initialize-esewa", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${userAuth.token}` // If using JWT
// //       },
// //       body: JSON.stringify({
// //         amount: total,
// //         orderId: "your-order-id-here", // Pass actual order ID
// //         userId: userAuth.userId // Or however you get user ID
// //       }),
// //     });

// //     const data = await response.json();

// //     if (data.success) {
// //       // Create a form and submit it to eSewa
// //       const form = document.createElement("form");
// //       form.method = "POST";
// //       form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

// //       // Add all required eSewa parameters
// //       const params = {
// //         amount: data.payment.amount,
// //         tax_amount: "0",
// //         total_amount: data.payment.amount,
// //         transaction_uuid: data.payment.transaction_uuid,
// //         product_code: data.payment.product_code,
// //         product_service_charge: "0",
// //         product_delivery_charge: "0",
// //         success_url: `${window.location.origin}/payment-success?orderId=${data.payment.transaction_uuid}`,
// //         failure_url: `${window.location.origin}/payment-failure?orderId=${data.payment.transaction_uuid}`,
// //         signed_field_names: data.payment.signed_field_names,
// //         signature: data.payment.signature,
// //       };

// //       // Add hidden fields to the form
// //       Object.entries(params).forEach(([key, value]) => {
// //         const hiddenField = document.createElement("input");
// //         hiddenField.type = "hidden";
// //         hiddenField.name = key;
// //         hiddenField.value = value;
// //         form.appendChild(hiddenField);
// //       });

// //       document.body.appendChild(form);
// //       form.submit();
// //     } else {
// //       toast.error(data.message || "Failed to initialize eSewa payment");
// //     }
// //   } catch (error) {
// //     toast.error("An error occurred while processing payment");
// //     console.error("Payment error:", error);
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };


// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle>Payment Method</CardTitle>
// //         <CardDescription>Choose how you want to pay</CardDescription>
// //       </CardHeader>
// //       <CardContent>
// //         <Tabs value={paymentMethod} onValueChange={handlePaymentMethodChange}>
// //           <TabsList className="grid w-full grid-cols-3">
// //             <TabsTrigger value="card">Card</TabsTrigger>
// //             <TabsTrigger value="cash">Cash</TabsTrigger>
// //             <TabsTrigger value="esewa">eSewa</TabsTrigger>
// //           </TabsList>

// //           <TabsContent value="card" className="space-y-4 pt-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="cardNumber">Card Number *</Label>
// //               <Input
// //                 id="cardNumber"
// //                 placeholder="1234 5678 9012 3456"
// //                 value={cardDetails.number}
// //                 onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
// //                 maxLength={19}
// //                 className={errors.number ? "border-destructive" : ""}
// //               />
// //               {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="expiryDate">Expiry Date *</Label>
// //                 <Input
// //                   id="expiryDate"
// //                   placeholder="MM/YY"
// //                   value={cardDetails.expiry}
// //                   onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiryDate(e.target.value) })}
// //                   maxLength={5}
// //                   className={errors.expiry ? "border-destructive" : ""}
// //                 />
// //                 {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="cvc">CVC *</Label>
// //                 <Input
// //                   id="cvc"
// //                   placeholder="123"
// //                   value={cardDetails.cvc}
// //                   onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })}
// //                   maxLength={3}
// //                   className={errors.cvc ? "border-destructive" : ""}
// //                 />
// //                 {errors.cvc && <p className="text-sm text-destructive">{errors.cvc}</p>}
// //               </div>
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="cardName">Name on Card *</Label>
// //               <Input
// //                 id="cardName"
// //                 placeholder="John Doe"
// //                 value={cardDetails.name}
// //                 onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
// //                 className={errors.name ? "border-destructive" : ""}
// //               />
// //               {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
// //             </div>
// //           </TabsContent>

// //           <TabsContent value="cash" className="pt-4">
// //             <div className="rounded-lg border p-4 text-center">
// //               <p className="mb-4">Pay with cash when you pick up your items.</p>
// //               {deliveryOption !== "pickup" && (
// //                 <p className="text-sm text-destructive">Cash payment is only available for pickup orders.</p>
// //               )}
// //             </div>
// //           </TabsContent>

// //           <TabsContent value="esewa" className="pt-4">
// //             <div className="rounded-lg border p-4 text-center">
// //               <p className="mb-4">You'll be redirected to eSewa to complete your payment.</p>
// //               <Button onClick={handleEsewaRedirectPayment}>Pay with eSewa</Button>
// //             </div>
// //           </TabsContent>
// //         </Tabs>

// //         {paymentMethod !== "esewa" && (
// //           <Button
// //             className="w-full mt-6"
// //             onClick={processPayment}
// //             disabled={isProcessing || (paymentMethod === "cash" && deliveryOption !== "pickup")}
// //           >
// //             {isProcessing ? (
// //               <>
// //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                 Processing...
// //               </>
// //             ) : (
// //               "Complete Payment"
// //             )}
// //           </Button>
// //         )}
// //       </CardContent>
// //     </Card>
// //   );
// // };


// // import { Button } from "@/components/ui/button";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import { Input } from "@/components/ui/input";
// // import { Label } from "@/components/ui/label";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { Loader2 } from "lucide-react";
// // import { useState } from "react";
// // import { toast } from "react-toastify";
// // import { useAuth } from "../contexts/auth-context";

// // export const PaymentMethods = ({
// //   total,
// //   onPaymentSuccess, // This callback might be used for non-redirect payments
// //   paymentMethod,
// //   setPaymentMethod,
// //   deliveryOption,
// // }) => {
// //   const [cardDetails, setCardDetails] = useState({
// //     number: "",
// //     expiry: "",
// //     cvc: "",
// //     name: "",
// //   });
// //   const [errors, setErrors] = useState({});
// //   const [isProcessing, setIsProcessing] = useState(false);
// //   const { userAuth } = useAuth(); // Make sure userAuth provides userId and token

// //   const handlePaymentMethodChange = (method) => {
// //     setPaymentMethod(method);
// //     setErrors({});
// //   };

// //   const validateCard = () => {
// //     const newErrors = {};
// //     const today = new Date();
// //     const currentYear = today.getFullYear() % 100;
// //     const currentMonth = today.getMonth() + 1;
// //     const [month, year] = cardDetails.expiry.split("/").map(Number);

// //     if (!/\d{16}/.test(cardDetails.number.replace(/\s/g, ""))) {
// //       newErrors.number = "Card number must be 16 digits";
// //     }
// //     if (!/\d{2}/.test(month) || !/\d{2}/.test(year)) {
// //       newErrors.expiry = "Invalid format (MM/YY)";
// //     } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
// //       newErrors.expiry = "Card has expired";
// //     }
// //     if (!/\d{3}/.test(cardDetails.cvc)) {
// //       newErrors.cvc = "CVC must be 3 digits";
// //     }
// //     if (!cardDetails.name.trim()) {
// //       newErrors.name = "Name is required";
// //     }

// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const processPayment = () => {
// //     if (paymentMethod === "card") {
// //       if (!validateCard()) return;
// //       setIsProcessing(true);
// //       setTimeout(() => {
// //         setIsProcessing(false);
// //         toast.success("Card payment simulated successfully!");
// //         onPaymentSuccess();
// //       }, 2000);
// //     } else if (paymentMethod === "cash") {
// //       setIsProcessing(true);
// //       setTimeout(() => {
// //         setIsProcessing(false);
// //         toast.success("Cash payment selected. Order confirmed!");
// //         onPaymentSuccess();
// //       }, 1000);
// //     }
// //   };

// //   const formatCardNumber = (value) => {
// //     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
// //     if (v.length > 16) return cardDetails.number;
// //     return v.replace(/(\d{4})(?=\d)/g, "$1 ");
// //   };

// //   const formatExpiryDate = (value) => {
// //     const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
// //     if (v.length >= 3) {
// //       return v.substring(0, 2) + "/" + v.substring(2, 4);
// //     }
// //     return v;
// //   };

// // const handleEsewaRedirectPayment = async () => {
// //   setIsProcessing(true);
  
// //   try {
// //     const backendUrl = "http://localhost:3000";
// //     const endpoint = `${backendUrl}/api/payment/initialize-esewa`;

// //     // Generate temporary IDs
// //     const tempOrderId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

// //     const response = await fetch(endpoint, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         "Authorization": `Bearer ${userAuth.token}`
// //       },
// //       body: JSON.stringify({
// //         amount: total,
// //         orderId: tempOrderId, // Use the temporary ID
// //         // Include any other necessary data about the products
// //       }),
// //     });

// //     console.log("Frontend: Received response status:", response.status); // Add this
// //     console.log("Frontend: Received response OK status:", response.ok); // Add this

// //     if (!response.ok) {
// //       const errorText = await response.text();
// //       throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
// //     }

// //     const data = await response.json();

// //     if (data.success) {
// //       // ... (rest of your form creation and submission logic)
// //       console.log("Frontend: Payment data for eSewa form:", data.payment); // Add this
// //       const form = document.createElement("form");
// //       form.method = "POST";
// //       form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

// //       const params = {
// //         amount: data.payment.amount,
// //         tax_amount: "0",
// //         total_amount: data.payment.amount,
// //         transaction_uuid: data.payment.transaction_uuid,
// //         product_code: data.payment.product_code,
// //         product_service_charge: "0",
// //         product_delivery_charge: "0",
// //         success_url: `${window.location.origin}/api/payment/verify-esewa`,
// //         failure_url: `${window.location.origin}/api/payment/verify-esewa`,
// //         signed_field_names: data.payment.signed_field_names,
// //         signature: data.payment.signature,
// //       };

// //       Object.entries(params).forEach(([key, value]) => {
// //         const hiddenField = document.createElement("input");
// //         hiddenField.type = "hidden";
// //         hiddenField.name = key;
// //         hiddenField.value = value;
// //         form.appendChild(hiddenField);
// //       });

// //       document.body.appendChild(form);
// //       form.submit();
// //       console.log("Frontend: Form submitted to eSewa."); // Add this

// //     } else {
// //       toast.error(data.message || "Failed to initialize eSewa payment");
// //     }
// //   } catch (error) {
// //     toast.error(error.message || "An error occurred while processing payment");
// //     console.error("Payment error:", error);
// //   } finally {
// //     setIsProcessing(false);
// //   }
// // };

// //   return (
// //     <Card>
// //       <CardHeader>
// //         <CardTitle>Payment Method</CardTitle>
// //         <CardDescription>Choose how you want to pay</CardDescription>
// //       </CardHeader>
// //       <CardContent>
// //         <Tabs value={paymentMethod} onValueChange={handlePaymentMethodChange}>
// //           <TabsList className="grid w-full grid-cols-3">
// //             <TabsTrigger value="card">Card</TabsTrigger>
// //             <TabsTrigger value="cash">Cash</TabsTrigger>
// //             <TabsTrigger value="esewa">eSewa</TabsTrigger>
// //           </TabsList>

// //           <TabsContent value="card" className="space-y-4 pt-4">
// //             <div className="space-y-2">
// //               <Label htmlFor="cardNumber">Card Number *</Label>
// //               <Input
// //                 id="cardNumber"
// //                 placeholder="1234 5678 9012 3456"
// //                 value={cardDetails.number}
// //                 onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
// //                 maxLength={19}
// //                 className={errors.number ? "border-destructive" : ""}
// //               />
// //               {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
// //             </div>
// //             <div className="grid grid-cols-2 gap-4">
// //               <div className="space-y-2">
// //                 <Label htmlFor="expiryDate">Expiry Date *</Label>
// //                 <Input
// //                   id="expiryDate"
// //                   placeholder="MM/YY"
// //                   value={cardDetails.expiry}
// //                   onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiryDate(e.target.value) })}
// //                   maxLength={5}
// //                   className={errors.expiry ? "border-destructive" : ""}
// //                 />
// //                 {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
// //               </div>
// //               <div className="space-y-2">
// //                 <Label htmlFor="cvc">CVC *</Label>
// //                 <Input
// //                   id="cvc"
// //                   placeholder="123"
// //                   value={cardDetails.cvc}
// //                   onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })}
// //                   maxLength={3}
// //                   className={errors.cvc ? "border-destructive" : ""}
// //                 />
// //                 {errors.cvc && <p className="text-sm text-destructive">{errors.cvc}</p>}
// //               </div>
// //             </div>
// //             <div className="space-y-2">
// //               <Label htmlFor="cardName">Name on Card *</Label>
// //               <Input
// //                 id="cardName"
// //                 placeholder="John Doe"
// //                 value={cardDetails.name}
// //                 onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
// //                 className={errors.name ? "border-destructive" : ""}
// //               />
// //               {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
// //             </div>
// //           </TabsContent>

// //           <TabsContent value="cash" className="pt-4">
// //             <div className="rounded-lg border p-4 text-center">
// //               <p className="mb-4">Pay with cash when you pick up your items.</p>
// //               {deliveryOption !== "pickup" && (
// //                 <p className="text-sm text-destructive">Cash payment is only available for pickup orders.</p>
// //               )}
// //             </div>
// //           </TabsContent>

// //           <TabsContent value="esewa" className="pt-4">
// //             <div className="rounded-lg border p-4 text-center">
// //               <p className="mb-4">You'll be redirected to eSewa to complete your payment.</p>
// //               <Button onClick={handleEsewaRedirectPayment} disabled={isProcessing}>
// //                 {isProcessing ? (
// //                   <>
// //                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                     Redirecting...
// //                   </>
// //                 ) : (
// //                   "Pay with eSewa"
// //                 )}
// //               </Button>
// //             </div>
// //           </TabsContent>
// //         </Tabs>

// //         {paymentMethod !== "esewa" && (
// //           <Button
// //             className="w-full mt-6"
// //             onClick={processPayment}
// //             disabled={isProcessing || (paymentMethod === "cash" && deliveryOption !== "pickup")}
// //           >
// //             {isProcessing ? (
// //               <>
// //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                 Processing...
// //               </>
// //             ) : (
// //               "Complete Payment"
// //             )}
// //           </Button>
// //         )}
// //       </CardContent>
// //     </Card>
// //   );
// // };







// //final:

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Loader2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// import { useAuth } from "../contexts/auth-context";

// export const PaymentMethods = ({
//     total,
//     onPaymentSuccess,
//     paymentMethod,
//     setPaymentMethod,
//     deliveryOption,
// }) => {
//     const [cardDetails, setCardDetails] = useState({
//         number: "",
//         expiry: "",
//         cvc: "",
//         name: "",
//     });
//     const [errors, setErrors] = useState({});
//     const [isProcessing, setIsProcessing] = useState(false);
//     const { userAuth } = useAuth();

//     const FRONTEND_ORIGIN = window.location.origin;
//     const BACKEND_ORIGIN = "http://localhost:3000"; // Ensure this matches your backend URL

//     useEffect(() => {
//         const handleMessage = (event) => {
//             // IMPORTANT: Verify the origin of the message for security
//             // The message is coming from your backend's URL where the script is executed.
//             if (event.origin !== BACKEND_ORIGIN) {
//                 console.warn(`Frontend: Message received from untrusted origin: ${event.origin}. Expected: ${BACKEND_ORIGIN}`);
//                 return;
//             }

//             const { type, success, message, paymentId, transactionId, orderReference } = event.data;

//             if (type === 'esewaPaymentComplete') {
//                 setIsProcessing(false);

//                 if (success) {
//                     toast.success("eSewa payment successful!");
//                     console.log("Frontend: eSewa payment complete:", { paymentId, transactionId, orderReference });
//                     onPaymentSuccess({ paymentId, transactionId, orderReference, status: "completed" });
//                 } else {
//                     toast.error(message || "eSewa payment failed. Please try again.");
//                     console.error("Frontend: eSewa payment failed:", message);
//                     onPaymentSuccess({ paymentId, transactionId, orderReference, status: "failed", error: message });
//                 }
//             }
//         };

//         window.addEventListener('message', handleMessage);

//         return () => {
//             window.removeEventListener('message', handleMessage);
//         };
//     }, [onPaymentSuccess]);

//     const handlePaymentMethodChange = (method) => {
//         setPaymentMethod(method);
//         setErrors({});
//     };

//     const validateCard = () => {
//         const newErrors = {};
//         const today = new Date();
//         const currentYear = today.getFullYear() % 100;
//         const currentMonth = today.getMonth() + 1;
//         const [month, year] = cardDetails.expiry.split("/").map(Number);

//         if (!/^\d{16}$/.test(cardDetails.number.replace(/\s/g, ""))) {
//             newErrors.number = "Card number must be 16 digits";
//         }
//         if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
//             newErrors.expiry = "Invalid format (MM/YY)";
//         } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
//             newErrors.expiry = "Card has expired";
//         }
//         if (!/^\d{3}$/.test(cardDetails.cvc)) {
//             newErrors.cvc = "CVC must be 3 digits";
//         }
//         if (!cardDetails.name.trim()) {
//             newErrors.name = "Name is required";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const processPayment = () => {
//         if (paymentMethod === "card") {
//             if (!validateCard()) return;
//             setIsProcessing(true);
//             setTimeout(() => {
//                 setIsProcessing(false);
//                 toast.success("Card payment simulated successfully!");
//                 onPaymentSuccess({ status: "completed", method: "card" });
//             }, 2000);
//         } else if (paymentMethod === "cash") {
//             setIsProcessing(true);
//             setTimeout(() => {
//                 setIsProcessing(false);
//                 toast.success("Cash payment selected. Order confirmed!");
//                 onPaymentSuccess({ status: "completed", method: "cash" });
//             }, 1000);
//         }
//     };

//     const formatCardNumber = (value) => {
//         const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//         if (v.length > 16) return cardDetails.number;
//         return v.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
//     };

//     const formatExpiryDate = (value) => {
//         const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
//         if (v.length >= 3) {
//             return v.substring(0, 2) + "/" + v.substring(2, 4);
//         }
//         return v;
//     };

//     const handleEsewaRedirectPayment = async () => {
//         setIsProcessing(true);

//         try {
//             const backendUrl = "http://localhost:3000";
//             const endpoint = `${backendUrl}/api/payment/initialize-esewa`;

//             const tempOrderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

//             const response = await fetch(endpoint, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${userAuth.token}`
//                 },
//                 body: JSON.stringify({
//                     amount: total,
//                     orderId: tempOrderId,
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//             }

//             const data = await response.json();

//             if (data.success) {
//                 const esewaRedirectUrl = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

//                 const successCallbackUrl = `${backendUrl}/api/payment/verify-esewa?paymentId=${data.payment.transaction_uuid}`;
//                 const failureCallbackUrl = `${backendUrl}/api/payment/verify-esewa?paymentId=${data.payment.transaction_uuid}`;

//                 const params = {
//                     amount: data.payment.amount,
//                     tax_amount: "0",
//                     total_amount: data.payment.amount,
//                     transaction_uuid: data.payment.transaction_uuid,
//                     product_code: data.payment.product_code,
//                     product_service_charge: "0",
//                     product_delivery_charge: "0",
//                     success_url: successCallbackUrl,
//                     failure_url: failureCallbackUrl,
//                     signed_field_names: data.payment.signed_field_names,
//                     signature: data.payment.signature,
//                 };

//                 // CRITICAL CHANGE: Open a new window/tab for eSewa
//                 const popup = window.open('about:blank', '_blank', 'width=600,height=700,resizable=yes,scrollbars=yes');
//                 if (!popup) {
//                     throw new Error("Popup blocked! Please enable popups for this site.");
//                 }

//                 // Create a form and submit it to the new popup window
//                 const form = document.createElement("form");
//                 form.method = "POST";
//                 form.action = esewaRedirectUrl;
//                 form.target = popup.name; // Target the newly opened popup

//                 Object.entries(params).forEach(([key, value]) => {
//                     const hiddenField = document.createElement("input");
//                     hiddenField.type = "hidden";
//                     hiddenField.name = key;
//                     hiddenField.value = value;
//                     form.appendChild(hiddenField);
//                 });

//                 document.body.appendChild(form);
//                 form.submit();
//                 document.body.removeChild(form); // Clean up the form element

//                 console.log("Frontend: Form submitted to eSewa in a new popup.");

//             } else {
//                 toast.error(data.message || "Failed to initialize eSewa payment");
//                 setIsProcessing(false);
//             }
//         } catch (error) {
//             toast.error(error.message || "An error occurred while initializing payment.");
//             console.error("Frontend: Payment initialization error:", error);
//             setIsProcessing(false);
//         }
//     };

//     return (
//         <Card>
//             <CardHeader>
//                 <CardTitle>Payment Method</CardTitle>
//                 <CardDescription>Choose how you want to pay</CardDescription>
//             </CardHeader>
//             <CardContent>
//                 <Tabs value={paymentMethod} onValueChange={handlePaymentMethodChange}>
//                     <TabsList className="grid w-full grid-cols-3">
//                         <TabsTrigger value="card">Card</TabsTrigger>
//                         <TabsTrigger value="cash">Cash</TabsTrigger>
//                         <TabsTrigger value="esewa">eSewa</TabsTrigger>
//                     </TabsList>

//                     <TabsContent value="card" className="space-y-4 pt-4">
//                         <div className="space-y-2">
//                             <Label htmlFor="cardNumber">Card Number *</Label>
//                             <Input
//                                 id="cardNumber"
//                                 placeholder="1234 5678 9012 3456"
//                                 value={cardDetails.number}
//                                 onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
//                                 maxLength={19}
//                                 className={errors.number ? "border-destructive" : ""}
//                             />
//                             {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
//                         </div>
//                         <div className="grid grid-cols-2 gap-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="expiryDate">Expiry Date *</Label>
//                                 <Input
//                                     id="expiryDate"
//                                     placeholder="MM/YY"
//                                     value={cardDetails.expiry}
//                                     onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiryDate(e.target.value) })}
//                                     maxLength={5}
//                                     className={errors.expiry ? "border-destructive" : ""}
//                                 />
//                                 {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
//                             </div>
//                             <div className="space-y-2">
//                                 <Label htmlFor="cvc">CVC *</Label>
//                                 <Input
//                                     id="cvc"
//                                     placeholder="123"
//                                     value={cardDetails.cvc}
//                                     onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value.replace(/\D/g, "") })}
//                                     maxLength={3}
//                                     className={errors.cvc ? "border-destructive" : ""}
//                                 />
//                                 {errors.cvc && <p className="text-sm text-destructive">{errors.cvc}</p>}
//                             </div>
//                         </div>
//                         <div className="space-y-2">
//                             <Label htmlFor="cardName">Name on Card *</Label>
//                             <Input
//                                 id="cardName"
//                                 placeholder="John Doe"
//                                 value={cardDetails.name}
//                                 onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
//                                 className={errors.name ? "border-destructive" : ""}
//                             />
//                             {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="cash" className="pt-4">
//                         <div className="rounded-lg border p-4 text-center">
//                             <p className="mb-4">Pay with cash when you pick up your items.</p>
//                             {deliveryOption !== "pickup" && (
//                                 <p className="text-sm text-destructive">Cash payment is only available for pickup orders.</p>
//                             )}
//                         </div>
//                     </TabsContent>

//                     <TabsContent value="esewa" className="pt-4">
//                         <div className="rounded-lg border p-4 text-center">
//                             <p className="mb-4">You'll be redirected to eSewa to complete your payment.</p>
//                             <Button onClick={handleEsewaRedirectPayment} disabled={isProcessing}>
//                                 {isProcessing ? (
//                                     <>
//                                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                         Redirecting to eSewa...
//                                     </>
//                                 ) : (
//                                     "Pay with eSewa"
//                                 )}
//                             </Button>
//                         </div>
//                     </TabsContent>
//                 </Tabs>

//                 {paymentMethod !== "esewa" && (
//                     <Button
//                         className="w-full mt-6"
//                         onClick={processPayment}
//                         disabled={isProcessing || (paymentMethod === "cash" && deliveryOption !== "pickup")}
//                     >
//                         {isProcessing ? (
//                             <>
//                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                                 Processing...
//                             </>
//                         ) : (
//                             "Complete Payment"
//                         )}
//                     </Button>
//                 )}
//             </CardContent>
//         </Card>
//     );
// };


import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

export const PaymentMethods = ({
  paymentMethod,
  setPaymentMethod,
  cardDetails,
  onCardChange,
  errors,
  deliveryOption,
  onEsewaPayment,
  isProcessing,
  esewaPaid,  
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
        <CardDescription>Choose how you want to pay</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="cash">Cash</TabsTrigger>
            <TabsTrigger value="esewa">eSewa</TabsTrigger>
          </TabsList>

          <TabsContent value="card" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => onCardChange("number", e.target.value)}
                maxLength={19}
                className={errors.number ? "border-destructive" : ""}
              />
              {errors.number && <p className="text-sm text-destructive">{errors.number}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => onCardChange("expiry", e.target.value)}
                  maxLength={5}
                  className={errors.expiry ? "border-destructive" : ""}
                />
                {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC *</Label>
                <Input
                  id="cvc"
                  placeholder="123"
                  value={cardDetails.cvc}
                  onChange={(e) => onCardChange("cvc", e.target.value)}
                  maxLength={3}
                  className={errors.cvc ? "border-destructive" : ""}
                />
                {errors.cvc && <p className="text-sm text-destructive">{errors.cvc}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cardName">Name on Card *</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => onCardChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
          </TabsContent>

          <TabsContent value="cash" className="pt-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="mb-4">Pay with cash when you pick up your items.</p>
              {deliveryOption !== "pickup" && (
                <p className="text-sm text-destructive">Cash payment is only available for pickup orders.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="esewa" className="pt-4">
            <div className="rounded-lg border p-4 text-center">
              <p className="mb-4">You'll be redirected to eSewa to complete your payment.</p>
              <Button
                onClick={onEsewaPayment}
                disabled={isProcessing || esewaPaid}
                className={esewaPaid ? "bg-green-600 text-white cursor-not-allowed" : ""}
              >
                {esewaPaid
                  ? "Paid with eSewa"
                  : isProcessing
                    ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redirecting to eSewa...</>)
                    : "Pay with eSewa"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
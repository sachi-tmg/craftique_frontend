import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Download, Loader2 } from "lucide-react";

export default function OrderDetailsPage() {
  const { orderId } = useParams();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = import.meta.env.VITE_API_URL;

      const response = await axios.get(`${backendUrl}/api/orders/${orderId}`, {
        withCredentials: true,
        headers: {
          Accept: "application/json"
        }
      });

      const order = response.data;

      // console.log("Raw API Response Order Data:", order);

      const mappedOrder = {
        id: order._id,
        orderNumber: order.orderId || order._id,
        date: new Date(order.createdAt).toLocaleDateString(),
        status: order.orderStatus,
        paymentMethod: order.paymentMethodUsed,
        deliveryMethod: order.deliveryOption === "on-site pickup" ? "pickup" : "local",
        deliveryAddress: order.shippingAddress || {
          street: "N/A",
          city: "N/A",
          state: "N/A",
          zip: "N/A"
        },
        items: order.items.map((item) => ({
          id: item.creationId?._id || item._id,
          title: item.creationId?.name || item.title || "Unknown Item",
          artist: item.creationId?.userId?.fullName || "Unknown Artist",
          image: item.creationId?.images?.[0] || item.creationPicture || "/placeholder.svg",
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryCharge,
        tax: order.taxAmount,
        total: order.totalAmount
      };
      setOrderDetails(mappedOrder);
    } catch (err) {
      console.error("Order fetch error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load order details");
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Download receipt as PDF
  const handleDownloadReceipt = async () => {
    const input = document.getElementById("order-receipt");
    if (!input) return toast.error("Receipt element not found!");
    try {
      // Make sure content is visible before snapshot (in case of tabbed layouts)
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4"
      });

      // Magic numbers for scaling; adjust as needed!
      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
      const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

      // Calculate height keeping aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.width / imgProps.height;
      let imgWidth = pageWidth;
      let imgHeight = imgWidth / ratio;
      if (imgHeight > pageHeight) {
        imgHeight = pageHeight;
        imgWidth = imgHeight * ratio;
      }

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        imgWidth,
        imgHeight
      );
      pdf.save(`Order-${orderDetails.orderNumber}-Receipt.pdf`);
      toast.success("Receipt downloaded!");
    } catch (err) {
      toast.error("Failed to generate receipt PDF.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)] text-red-500">
        <p>{error}</p>
        <Button onClick={fetchOrderDetails} className="mt-4">Retry</Button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
        <p className="text-lg font-semibold">Order not found.</p>
        <Link to="/profile">
          <Button className="mt-4">Go to My Orders</Button>
        </Link>
      </div>
    );
  }

  const deliveryMethod = orderDetails.deliveryMethod;

  return (
    <div className="max-w-full space-y-2 p-4 md:p-2">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/profile">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order #{orderDetails.orderNumber}</h1>
          <p className="text-muted-foreground">Placed on {orderDetails.date}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Wrap receipt area for PDF generation */}
        <div className="space-y-6" id="order-receipt">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        {item.artist && <p className="text-sm text-muted-foreground">by {item.artist}</p>}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm">Qty: {item.quantity}</p>
                        <p className="font-medium">Rs. {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Information */}
          <Card>
            <CardHeader>
              <CardTitle>{deliveryMethod === "pickup" ? "Pickup" : "Delivery"} Information</CardTitle>
            </CardHeader>
            <CardContent>
              {deliveryMethod === "pickup" ? (
                <div className="space-y-1">
                  <p className="font-medium">On-site Pickup</p>
                  <p>Craftique Studio</p>
                  <p>Kathmandu</p>
                  <p>Nepal</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium">{orderDetails.deliveryAddress.name || "Customer"}</p>
                  <p>{orderDetails.deliveryAddress.street}</p>
                  <p>{orderDetails.deliveryAddress.city}</p>
                  <p>{orderDetails.deliveryAddress.zip}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary and Download Button */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {orderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{deliveryMethod === "pickup" ? "Pickup" : "Local Delivery"}</span>
                <span>{deliveryMethod === "pickup" ? "Free" : `Rs. ${orderDetails.deliveryFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Rs. {orderDetails.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>Rs. {orderDetails.total.toFixed(2)}</span>
              </div>
              <div className="pt-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method</span>
                  <span>{orderDetails.paymentMethod}</span>
                </div>
              </div>
            </CardContent>
            <div className="px-6 pb-6">
              <Button variant="outline" className="w-full" onClick={handleDownloadReceipt}>
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

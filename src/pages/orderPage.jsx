import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getMyOrders } from "../api/api";
import { useAuth } from "../contexts/auth-context";

function OrderItemCard({ order }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl shadow p-4 mb-4 bg-white dark:bg-zinc-900">
      <button
        className="w-full flex justify-between items-center text-left focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={`order-details-${order._id}`}
      >
        <div>
          <div className="font-semibold text-lg">Order #{order.orderId}</div>
          <div className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString()}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {/* <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${order.orderStatus === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
            }`}>
            {order.orderStatus}
          </span> */}
          <span className="font-bold">Rs. {order.totalAmount}</span>
          <span className="ml-2">{open ? <ChevronUp /> : <ChevronDown />}</span>
        </div>
      </button>
      {open && (
        <div className="pt-4 border-t mt-4 space-y-4" id={`order-details-${order._id}`}>
          <div>
            <div className="font-medium mb-2">Items:</div>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={item._id || idx} className="flex items-center gap-4">
                  <img
                    src={
                      item.creationId?.creationPicture ||
                      item.creationPicture ||
                      "/placeholder.svg"
                    }
                    alt={item.title}
                    className="h-14 w-14 rounded object-cover border"
                  />
                  <div className="flex-1">
                    <div className="font-semibold">{item.title || item.creationId?.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.creationId?.creation_id
                        ? `ID: ${item.creationId.creation_id}`
                        : ""}
                    </div>
                    <div className="text-xs">Qty: {item.quantity}</div>
                  </div>
                  <div className="font-bold whitespace-nowrap">
                    Rs. {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="font-medium">Delivery</div>
              <div className="text-sm">{order.deliveryOption}</div>
            </div>
            <div>
              <div className="font-medium">Payment</div>
              <div className="text-sm">{order.paymentMethodUsed}</div>
            </div>
            <div className="col-span-2">
              <div className="font-medium">Shipping Address</div>
              <div className="text-sm">
                {order.shippingAddress?.street}, {order.shippingAddress?.city}
                {order.shippingAddress?.district
                  ? `, ${order.shippingAddress?.district}`
                  : ""}
                {order.shippingAddress?.province
                  ? `, ${order.shippingAddress?.province}`
                  : ""}
                {order.shippingAddress?.zip
                  ? `, ${order.shippingAddress?.zip}`
                  : ""}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-8 pt-4 border-t mt-2 text-right">
            <div>
              <span className="text-muted-foreground text-sm">Subtotal:</span>
              <span className="ml-2 font-semibold">Rs. {order.subtotal}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Tax:</span>
              <span className="ml-2 font-semibold">Rs. {order.taxAmount}</span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Delivery:</span>
              <span className="ml-2 font-semibold">
                Rs. {order.deliveryCharge}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">Total:</span>
              <span className="ml-2 font-bold text-lg">
                Rs. {order.totalAmount}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { userAuth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!userAuth?.token) return;
      try {
        const res = await getMyOrders(userAuth.token);
        setOrders(res.data.orders || []);
      } catch (err) {
        setOrders([]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [userAuth]);

  if (loading)
    return <div className="p-8 text-center text-lg">Loading orders...</div>;
  if (!orders.length)
    return <div className="p-8 text-center text-lg">No orders found.</div>;

  return (
    <div className="container py-2 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Order History</h1>
      <div>
        {orders.map((order) => (
          <OrderItemCard key={order._id} order={order} />
        ))}
      </div>
    </div>
  );
}

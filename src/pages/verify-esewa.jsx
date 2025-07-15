// pages/payment/verify-esewa.jsx
import { useEffect } from "react";

export default function VerifyEsewaPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get("success") === "1";
    const paymentId = params.get("paymentId");

    // Notify parent window
    if (window.opener) {
      window.opener.postMessage(
        {
          type: "esewaPaymentComplete",
          success,
          paymentId,
        },
        "*" // For production, set your real origin
      );
    }
    setTimeout(() => {
      window.close();
    }, 2000);
  }, []);

  const params = new URLSearchParams(window.location.search);
  const success = params.get("success") === "1";

  return (
    <div className="flex flex-col items-center justify-center min-h-[280px] px-6">
      <div
        className={`rounded-full flex items-center justify-center w-24 h-24 shadow-lg mb-4 
          ${success ? "bg-green-100 animate-bounce" : "bg-red-100 animate-pulse"}`}
      >
        {success ? (
          <svg className="w-14 h-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" className="stroke-current text-green-200" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l3 3 5-5" />
          </svg>
        ) : (
          <svg className="w-14 h-14 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="10" className="stroke-current text-red-200" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 9l6 6m0-6l-6 6" />
          </svg>
        )}
      </div>
      <h2 className={`text-2xl font-semibold ${success ? "text-green-600" : "text-red-600"} mb-2`}>
        {success ? "Payment Success!" : "Payment Failed!"}
      </h2>
      <p className="text-muted-foreground text-center mb-1">
        {success
          ? "Thank you, your payment was successful."
          : "Sorry, the payment could not be completed."}
      </p>
      <p className="text-xs text-gray-400">This window will close automatically.</p>
    </div>
  );
}

// src/pages/VerifyEsewa.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function VerifyEsewa() {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const success = searchParams.get('success');
    const paymentId = searchParams.get('paymentId');
    const data = searchParams.get('data');
    
    console.log("VerifyEsewa - Success:", success, "PaymentId:", paymentId);
    
    // Send message back to main window
    if (window.opener) {
      window.opener.postMessage({
        type: 'esewaPaymentComplete',
        success: success === '1',
        paymentId: paymentId,
        data: data
      }, 'https://drove-groggy-handcuff.ngrok-free.dev'); 
      
      // Show success/failure message before closing
      if (success === '1') {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h2 style="color:green;">✓ Payment Successful!</h2><p>This window will close in 2 seconds...</p></div>';
      } else {
        document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h2 style="color:red;">✗ Payment Failed</h2><p>This window will close in 2 seconds...</p></div>';
      }
      
      setTimeout(() => {
        window.close();
      }, 2000);
    } else {
      // If no opener (direct access), show message
      document.body.innerHTML = '<div style="text-align:center;padding:50px;"><h2>Payment Verification</h2><p>You can close this window now.</p></div>';
    }
  }, [searchParams]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Verifying Payment...</h2>
      </div>
    </div>
  );
}
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
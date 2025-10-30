
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, CreditCard, Wallet } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, selectedSeats, boardingPoint, droppingPoint, totalAmount } = location.state || {};

  const [passengers, setPassengers] = useState(
    selectedSeats?.map((seat: string) => ({
      seat,
      name: "",
      age: "",
      gender: "",
    })) || []
  );

  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
  });

  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [discount, setDiscount] = useState(0);

  const updatePassenger = (index: number, field: string, value: string) => {
    setPassengers(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const applyCoupon = () => {
    if (couponCode === "FIRST10") {
      setDiscount(totalAmount * 0.1);
      toast.success("Coupon applied! 10% discount");
    } else if (couponCode === "SAVE20") {
      setDiscount(totalAmount * 0.2);
      toast.success("Coupon applied! 20% discount");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const handleBooking = () => {
    // Validate passenger details
    const isValid = passengers.every(p => p.name && p.age && p.gender) && 
                   contactInfo.email && contactInfo.phone;
    
    if (!isValid) {
      toast.error("Please fill all passenger details");
      return;
    }

    // Simulate booking process
    toast.success("Booking confirmed! Redirecting to confirmation...");
    setTimeout(() => {
      navigate('/account', { 
        state: { 
          bookingConfirmed: true, 
          bookingDetails: {
            bus,
            passengers,
            selectedSeats,
            totalAmount: finalAmount,
            bookingId: `BK${Date.now()}`,
          }
        } 
      });
    }, 2000);
  };

  const serviceTax = Math.round(totalAmount * 0.1);
  const finalAmount = totalAmount + serviceTax - discount;

  if (!bus) {
    return <div>Booking details not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Passenger Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{bus.operator}</h3>
                    <p className="text-muted-foreground">{bus.from} → {bus.to}</p>
                    <p className="text-sm text-muted-foreground">Seats: {selectedSeats?.join(', ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{bus.departureTime}</p>
                    <p className="text-muted-foreground">{bus.type}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Details */}
            <Card>
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-4">Passenger {index + 1} - Seat {passenger.seat}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`name-${index}`}>Full Name</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="Enter full name"
                          value={passenger.name}
                          onChange={(e) => updatePassenger(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`age-${index}`}>Age</Label>
                        <Input
                          id={`age-${index}`}
                          placeholder="Age"
                          type="number"
                          value={passenger.age}
                          onChange={(e) => updatePassenger(index, 'age', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`gender-${index}`}>Gender</Label>
                        <Select 
                          value={passenger.gender} 
                          onValueChange={(value) => updatePassenger(index, 'gender', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="Enter phone number"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Coupon Section */}
            <Card>
              <CardHeader>
                <CardTitle>Apply Coupon</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button onClick={applyCoupon} variant="outline">
                    Apply
                  </Button>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Try: FIRST10 or SAVE20
                </div>
              </CardContent>
            </Card>

            {/* Fare Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Fare Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Base Fare ({selectedSeats?.length} seats):</span>
                    <span>${totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Tax:</span>
                    <span>${serviceTax}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${finalAmount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex items-center">
                      <Wallet className="h-4 w-4 mr-2" />
                      Digital Wallet
                    </Label>
                  </div>
                </RadioGroup>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleBooking}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Booking - ${finalAmount}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;

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
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const passengerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  age: z.string().refine((val) => {
    const age = parseInt(val);
    return !isNaN(age) && age >= 1 && age <= 120;
  }, "Age must be between 1 and 120"),
  gender: z.enum(["male", "female", "other"], { required_error: "Please select a gender" }),
});

const contactSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z.string().trim().regex(/^[+]?[0-9]{10,15}$/, "Phone number must be 10-15 digits"),
});

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

  const handleBooking = async () => {
    // Validate contact information
    try {
      contactSchema.parse(contactInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    // Validate all passengers
    for (let i = 0; i < passengers.length; i++) {
      try {
        passengerSchema.parse(passengers[i]);
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast.error(`Passenger ${i + 1}: ${error.errors[0].message}`);
          return;
        }
      }
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to complete booking");
        return;
      }

      // First, attempt to book seats atomically
      const { data: seatsBooked, error: bookSeatsError } = await supabase.rpc(
        'book_seats_atomic',
        {
          p_schedule_id: bus.scheduleId,
          p_seat_count: selectedSeats.length
        }
      );

      if (bookSeatsError) {
        console.error('Seat booking error:', bookSeatsError);
        toast.error("Failed to reserve seats. Please try again.");
        return;
      }

      if (!seatsBooked) {
        toast.error("Sorry, the selected seats are no longer available. Please try booking again.");
        return;
      }

      // Generate booking reference
      const bookingRef = `BUS-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create QR code data
      const qrData = JSON.stringify({
        ref: bookingRef,
        passengers: passengers.length,
        from: bus.from,
        to: bus.to,
        date: bus.date,
      });

      // Insert booking into database with pending status
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          schedule_id: bus.scheduleId,
          booking_reference: bookingRef,
          passenger_name: passengers[0].name,
          passenger_email: contactInfo.email,
          passenger_phone: contactInfo.phone,
          seat_numbers: selectedSeats,
          total_fare: finalAmount,
          status: 'pending',
          payment_verified: false,
          qr_code_data: qrData,
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          booking_id: bookingData.id,
          amount: finalAmount,
          payment_method: paymentMethod,
          status: 'pending',
        });

      if (paymentError) throw paymentError;

      // TODO: Integrate with actual payment gateway
      // For now, simulate payment success after a delay
      toast.success("Booking created! Payment processing...");
      
      setTimeout(() => {
        navigate('/account', { 
          state: { 
            bookingConfirmed: false, 
            bookingDetails: {
              ...bookingData,
              bus,
              passengers,
              selectedSeats,
              bookingId: bookingData.id,
            }
          } 
        });
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);
      toast.error("Failed to complete booking. Please try again.");
    }
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

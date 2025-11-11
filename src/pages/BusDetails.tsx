
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Star, Users, Wifi, Car, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import ReviewsList from "@/components/ReviewsList";

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");

  // Mock bus data
  const bus = {
    id: 1,
    operator: "Luxury Express",
    type: "AC Sleeper",
    departureTime: "10:30 PM",
    arrivalTime: "6:30 AM",
    duration: "8h 0m",
    price: 89,
    rating: 4.5,
    totalRatings: 234,
    amenities: ["Wifi", "AC", "Blanket", "Water Bottle", "Charging Point", "Entertainment"],
    from: "New York",
    to: "Washington DC",
  };

  const boardingPoints = [
    { id: "bp1", name: "Times Square", time: "10:30 PM" },
    { id: "bp2", name: "Grand Central", time: "10:45 PM" },
    { id: "bp3", name: "Penn Station", time: "11:00 PM" },
  ];

  const droppingPoints = [
    { id: "dp1", name: "Union Station", time: "6:30 AM" },
    { id: "dp2", name: "Capitol Hill", time: "6:45 AM" },
    { id: "dp3", name: "Downtown DC", time: "7:00 AM" },
  ];

  // Generate seat layout
  const generateSeats = () => {
    const seats = [];
    const seatLabels = ['A', 'B', 'C', 'D'];
    const bookedSeats = ['1A', '1B', '3C', '5D', '7A', '9B']; // Mock booked seats
    
    for (let row = 1; row <= 10; row++) {
      seatLabels.forEach((label) => {
        const seatId = `${row}${label}`;
        seats.push({
          id: seatId,
          row,
          label,
          isBooked: bookedSeats.includes(seatId),
          isSelected: selectedSeats.includes(seatId),
        });
      });
    }
    return seats;
  };

  const seats = generateSeats();

  const handleSeatClick = (seatId: string) => {
    if (seats.find(s => s.id === seatId)?.isBooked) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const totalAmount = selectedSeats.length * bus.price;

  const handleProceed = () => {
    if (selectedSeats.length > 0 && boardingPoint && droppingPoint) {
      navigate('/booking', { 
        state: { 
          bus, 
          selectedSeats, 
          boardingPoint, 
          droppingPoint, 
          totalAmount 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Bus Info Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{bus.operator}</h1>
                    <Badge variant="secondary" className="mt-2">
                      {bus.type}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-1" />
                    <span className="font-medium">{bus.rating}</span>
                    <span className="text-muted-foreground text-sm ml-1">
                      ({bus.totalRatings} reviews)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="font-semibold text-xl">{bus.departureTime}</div>
                    <div className="text-muted-foreground">{bus.from}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">{bus.duration}</div>
                    <div className="w-full h-px bg-border my-2"></div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-xl">{bus.arrivalTime}</div>
                    <div className="text-muted-foreground">{bus.to}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {bus.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-primary">${bus.price}</div>
                <div className="text-muted-foreground">per seat</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Seat Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded"></div>
                      <span>Booked</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-center mb-4 text-sm font-medium">Driver</div>
                  <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                    {seats.map((seat) => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        disabled={seat.isBooked}
                        className={`
                          w-10 h-10 rounded text-xs font-medium transition-colors
                          ${seat.isBooked 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : seat.isSelected
                            ? 'bg-blue-500 text-white'
                            : 'bg-green-500 text-white hover:bg-green-600'
                          }
                        `}
                      >
                        {seat.id}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            {/* Boarding & Dropping Points */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup & Drop Points</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Boarding Point</label>
                  <Select value={boardingPoint} onValueChange={setBoardingPoint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select boarding point" />
                    </SelectTrigger>
                    <SelectContent>
                      {boardingPoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          {point.name} ({point.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dropping Point</label>
                  <Select value={droppingPoint} onValueChange={setDroppingPoint}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dropping point" />
                    </SelectTrigger>
                    <SelectContent>
                      {droppingPoints.map((point) => (
                        <SelectItem key={point.id} value={point.id}>
                          {point.name} ({point.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fare Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Fare Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Selected Seats:</span>
                    <span>{selectedSeats.join(', ') || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Base Fare ({selectedSeats.length} × ${bus.price}):</span>
                    <span>${totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Tax:</span>
                    <span>${Math.round(totalAmount * 0.1)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total Amount:</span>
                    <span>${totalAmount + Math.round(totalAmount * 0.1)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0 || !boardingPoint || !droppingPoint}
                >
                  Proceed to Book
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Reviews & Ratings</h2>
          <ReviewsList busId={id!} />
        </div>
      </div>
    </div>
  );
};

export default BusDetails;

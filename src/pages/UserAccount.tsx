
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Star, Wallet, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";

const UserAccount = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([
    {
      id: "BK001",
      operator: "Luxury Express",
      from: "New York",
      to: "Washington DC",
      date: "2024-01-15",
      time: "10:30 PM",
      seats: ["1A", "1B"],
      amount: 178,
      status: "confirmed",
      type: "AC Sleeper",
    },
    {
      id: "BK002",
      operator: "City Connect",
      from: "Boston",
      to: "Philadelphia",
      date: "2024-01-20",
      time: "7:00 AM",
      seats: ["3C"],
      amount: 65,
      status: "completed",
      type: "AC Seater",
    },
  ]);

  const [walletBalance] = useState(125.50);

  useEffect(() => {
    // Check if coming from successful booking
    if (location.state?.bookingConfirmed && location.state?.bookingDetails) {
      const newBooking = {
        ...location.state.bookingDetails,
        status: "confirmed",
      };
      setBookings(prev => [newBooking, ...prev]);
      toast.success("🎉 Booking confirmed successfully!");
    }
  }, [location.state]);

  const cancelBooking = (bookingId: string) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: "cancelled" }
        : booking
    ));
    toast.success("Booking cancelled. Refund will be processed within 3-5 days.");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your bookings and account settings</p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="space-y-4">
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{booking.operator}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{booking.from} → {booking.to}</span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{booking.date} at {booking.time}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${booking.amount}</div>
                        <div className="text-sm text-muted-foreground">Booking ID: {booking.id}</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div>
                        <Badge variant="outline">{booking.type}</Badge>
                        <span className="ml-2 text-sm text-muted-foreground">
                          Seats: {booking.seats?.join(', ') || 'N/A'}
                        </span>
                      </div>
                      
                      {booking.status === "confirmed" && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wallet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wallet className="h-5 w-5 mr-2" />
                    Wallet Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-4">
                    ${walletBalance.toFixed(2)}
                  </div>
                  <div className="space-y-2">
                    <Button className="w-full">Add Money</Button>
                    <Button variant="outline" className="w-full">Transaction History</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Refund Status
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="h-4 w-4 mr-2" />
                    Loyalty Points
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Booking History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>My Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p>No reviews yet. Complete a trip to leave your first review!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input 
                      className="w-full p-2 border rounded-md" 
                      defaultValue="John Doe" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                      className="w-full p-2 border rounded-md" 
                      defaultValue="john.doe@example.com" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input 
                      className="w-full p-2 border rounded-md" 
                      defaultValue="+1 234 567 8900" 
                    />
                  </div>
                  <Button>Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserAccount;

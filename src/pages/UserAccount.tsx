import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Download, Star, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BookingTicket from "@/components/BookingTicket";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserAccount = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance] = useState(125.50);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showTicket, setShowTicket] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
    
    // Check if coming from successful booking
    if (location.state?.bookingConfirmed) {
      toast.success("🎉 Booking confirmed successfully!");
      setTimeout(() => loadBookings(), 500);
    }
  }, [location.state]);

  const loadBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedule:schedules(
            departure_date,
            bus:buses(
              bus_name,
              registration_no,
              bus_type,
              departure_time,
              arrival_time
            ),
            route:routes(
              source,
              destination
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      // Check if cancellation is allowed (6 hours before departure)
      const { data: canCancel } = await supabase.rpc('can_cancel_booking', {
        booking_id: bookingId
      });

      if (!canCancel) {
        toast.error("Cannot cancel booking within 6 hours of departure");
        setCancelDialog(null);
        return;
      }

      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Return seats to available pool
      const { error: seatError } = await supabase
        .from('schedules')
        .update({ 
          available_seats: booking.schedule.bus.total_seats + booking.seat_numbers.length 
        })
        .eq('id', booking.schedule_id);

      if (seatError) throw seatError;

      toast.success("Booking cancelled successfully. Refund will be processed within 3-5 days.");
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error("Failed to cancel booking");
    } finally {
      setCancelDialog(null);
    }
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
            {loading ? (
              <div className="text-center py-8">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p className="text-muted-foreground">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{booking.schedule?.bus?.bus_name || 'N/A'}</h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="flex items-center text-muted-foreground mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.schedule?.route?.source} → {booking.schedule?.route?.destination}</span>
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{new Date(booking.schedule?.departure_date).toLocaleDateString()} at {booking.schedule?.bus?.departure_time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">${booking.total_fare}</div>
                          <div className="text-sm text-muted-foreground">Ref: {booking.booking_reference}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div>
                          <Badge variant="outline">{booking.schedule?.bus?.bus_type}</Badge>
                          <span className="ml-2 text-sm text-muted-foreground">
                            Seats: {booking.seat_numbers?.join(', ') || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {booking.status === "confirmed" && booking.payment_verified && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowTicket(true);
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Ticket
                            </Button>
                          )}
                          
                          {booking.status === "confirmed" && !booking.cancelled_at && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setCancelDialog(booking.id)}
                            >
                              Cancel Booking
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

        {/* Ticket Modal */}
        {showTicket && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4">
              <div className="flex justify-end mb-4">
                <Button variant="ghost" onClick={() => setShowTicket(false)}>
                  Close
                </Button>
              </div>
              <BookingTicket
                bookingId={selectedBooking.id}
                bookingReference={selectedBooking.booking_reference}
                passengers={selectedBooking.seat_numbers.map((seat: string, index: number) => ({
                  name: index === 0 ? selectedBooking.passenger_name : `Passenger ${index + 1}`,
                  age: '25',
                  gender: 'male',
                  seat: seat
                }))}
                busName={selectedBooking.schedule.bus.bus_name}
                vehicleNumber={selectedBooking.schedule.bus.registration_no}
                from={selectedBooking.schedule.route.source}
                to={selectedBooking.schedule.route.destination}
                journeyDate={selectedBooking.schedule.departure_date}
                departureTime={selectedBooking.schedule.bus.departure_time}
                totalFare={selectedBooking.total_fare}
                contactEmail={selectedBooking.passenger_email}
                contactPhone={selectedBooking.passenger_phone}
                bookingDate={selectedBooking.created_at}
                qrCodeData={selectedBooking.qr_code_data}
              />
            </div>
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone. 
                Refund will be processed within 3-5 business days.
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-yellow-800 dark:text-yellow-200">
                    Cancellation is only allowed up to 6 hours before departure time.
                  </span>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelDialog && cancelBooking(cancelDialog)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserAccount;

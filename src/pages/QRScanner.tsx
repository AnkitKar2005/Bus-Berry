import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QrCode, Search, CheckCircle, XCircle, MapPin, Calendar, Users, Bus } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingDetails {
  booking_reference: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  seat_numbers: string[];
  total_fare: number;
  status: string;
  created_at: string;
  schedule: {
    departure_date: string;
    bus: {
      bus_name: string;
      registration_no: string;
      departure_time: string;
      arrival_time: string;
    };
    route: {
      source: string;
      destination: string;
    };
  };
}

const QRScanner = () => {
  const [searchCode, setSearchCode] = useState("");
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyBooking = async () => {
    if (!searchCode.trim()) {
      toast.error("Please enter a booking reference");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          schedule:schedules(
            departure_date,
            bus:buses(
              bus_name,
              registration_no,
              departure_time,
              arrival_time
            ),
            route:routes(
              source,
              destination
            )
          )
        `)
        .eq('booking_reference', searchCode.toUpperCase())
        .eq('payment_verified', true)
        .single();

      if (error || !data) {
        toast.error("Booking not found or payment not verified");
        setBooking(null);
        return;
      }

      // Check if booking is valid (not expired and not cancelled)
      const journeyDate = new Date(data.schedule.departure_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (journeyDate < today) {
        toast.error("This ticket has expired");
        setBooking(null);
        return;
      }

      if (data.status === 'cancelled') {
        toast.error("This booking has been cancelled");
        setBooking(null);
        return;
      }

      setBooking(data as any);
      toast.success("Booking verified successfully!");
    } catch (error) {
      console.error('Error verifying booking:', error);
      toast.error("Failed to verify booking");
    } finally {
      setLoading(false);
    }
  };

  const isValid = booking && booking.status === 'confirmed' && !booking.cancelled_at;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Ticket Verification</h1>
          <p className="text-muted-foreground">Scan or enter booking reference to verify tickets</p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Booking Reference (e.g., BUS-20240115-1234)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && verifyBooking()}
                className="text-lg"
              />
              <Button onClick={verifyBooking} disabled={loading} size="lg">
                <Search className="h-4 w-4 mr-2" />
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Booking Details */}
        {booking && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Booking Details</CardTitle>
                <Badge variant={isValid ? "default" : "destructive"} className="text-lg px-4 py-2">
                  {isValid ? (
                    <><CheckCircle className="h-4 w-4 mr-2" />Valid</>
                  ) : (
                    <><XCircle className="h-4 w-4 mr-2" />Invalid</>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Journey Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Journey Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">From:</span>
                    <p className="font-medium">{booking.schedule.route.source}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">To:</span>
                    <p className="font-medium">{booking.schedule.route.destination}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{new Date(booking.schedule.departure_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Departure Time:</span>
                    <p className="font-medium">{booking.schedule.bus.departure_time}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bus Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Bus className="h-4 w-4 mr-2" />
                  Bus Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bus Name:</span>
                    <p className="font-medium">{booking.schedule.bus.bus_name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Vehicle Number:</span>
                    <p className="font-medium">{booking.schedule.bus.registration_no}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Passenger Info */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Passenger Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{booking.passenger_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">{booking.passenger_email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{booking.passenger_phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat Numbers:</span>
                    <span className="font-medium">{booking.seat_numbers.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Passengers:</span>
                    <span className="font-medium">{booking.seat_numbers.length}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold mb-3">Payment Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Fare:</span>
                    <span className="font-bold text-lg text-primary">${booking.total_fare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Date:</span>
                    <span className="font-medium">{new Date(booking.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking Reference:</span>
                    <span className="font-medium">{booking.booking_reference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
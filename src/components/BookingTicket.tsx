import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, MapPin, Calendar, Clock, Users, Bus, CreditCard } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Passenger {
  name: string;
  age: string;
  gender: string;
  seat: string;
}

interface TicketProps {
  bookingId: string;
  bookingReference: string;
  passengers: Passenger[];
  busName: string;
  vehicleNumber: string;
  from: string;
  to: string;
  journeyDate: string;
  departureTime: string;
  totalFare: number;
  contactEmail: string;
  contactPhone: string;
  bookingDate: string;
  qrCodeData: string;
}

const BookingTicket = ({ 
  bookingId, 
  bookingReference, 
  passengers, 
  busName, 
  vehicleNumber,
  from, 
  to, 
  journeyDate, 
  departureTime,
  totalFare, 
  contactEmail, 
  contactPhone,
  bookingDate,
  qrCodeData 
}: TicketProps) => {
  
  const downloadTicket = async () => {
    const ticketElement = document.getElementById('ticket-' + bookingId);
    if (!ticketElement) return;

    const canvas = await html2canvas(ticketElement, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`ticket-${bookingReference}.pdf`);
  };

  return (
    <div className="space-y-4">
      <Card id={'ticket-' + bookingId} className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-primary mb-2">Bus Booking Confirmation</h2>
            <p className="text-sm text-muted-foreground">Booking Reference: {bookingReference}</p>
          </div>

          <Separator className="my-6" />

          {/* Journey Details */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Journey Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From:</span>
                  <span className="font-medium">{from}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To:</span>
                  <span className="font-medium">{to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{new Date(journeyDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Departure:</span>
                  <span className="font-medium">{departureTime}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <Bus className="h-4 w-4 mr-2" />
                Bus Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bus Name:</span>
                  <span className="font-medium">{busName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vehicle No:</span>
                  <span className="font-medium">{vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Passengers:</span>
                  <span className="font-medium">{passengers.length}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Passenger Details */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Passenger Details
            </h3>
            <div className="space-y-3">
              {passengers.map((passenger, index) => (
                <div key={index} className="bg-muted/50 p-3 rounded-lg">
                  <div className="grid grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Name:</span>
                      <p className="font-medium">{passenger.name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Age:</span>
                      <p className="font-medium">{passenger.age}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Gender:</span>
                      <p className="font-medium capitalize">{passenger.gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Seat:</span>
                      <p className="font-medium">{passenger.seat}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="my-6" />

          {/* Contact & Payment */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{contactEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{contactPhone}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Fare:</span>
                  <span className="font-bold text-lg text-primary">${totalFare}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Booking Date:</span>
                  <span className="font-medium">{new Date(bookingDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="text-center">
              <p className="text-sm font-medium mb-3">Scan QR Code for Verification</p>
              <div className="bg-white p-4 rounded-lg inline-block border-2 border-primary/20">
                <QRCodeSVG 
                  value={qrCodeData} 
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Show this QR code to the bus operator</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <p>This ticket is valid only for the date and time mentioned above.</p>
            <p>Cancellation must be done at least 6 hours before departure.</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={downloadTicket} size="lg">
          <Download className="h-4 w-4 mr-2" />
          Download Ticket (PDF)
        </Button>
      </div>
    </div>
  );
};

export default BookingTicket;
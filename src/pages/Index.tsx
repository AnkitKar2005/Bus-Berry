
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import PopularRoutes from "@/components/PopularRoutes";
import { useLocation } from "@/contexts/LocationContext";

const Index = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>();
  const navigate = useNavigate();
  const { selectedState } = useLocation();

  const handleSearch = () => {
    if (from && to && date) {
      navigate(`/search?from=${from}&to=${to}&date=${format(date, "yyyy-MM-dd")}`);
    }
  };

  const offers = [
    { title: "First Ride Free", description: "Get your first ticket absolutely free", discount: "100%" },
    { title: "Weekend Special", description: "25% off on weekend bookings", discount: "25%" },
    { title: "Student Discount", description: "Special rates for students", discount: "15%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Header />
      
      {/* Hero Section */}
      <div className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Book Your Bus Journey
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Travel comfortably across the country with our premium bus services
          </p>

          {/* Search Form */}
          <Card className="max-w-4xl mx-auto shadow-xl">
            <CardContent className="p-8">
              {!selectedState ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Please select a country and state to search for buses</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">From</label>
                    <LocationAutocomplete
                      value={from}
                      onChange={setFrom}
                      placeholder="Departure city"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">To</label>
                    <LocationAutocomplete
                      value={to}
                      onChange={setTo}
                      placeholder="Destination city"
                    />
                  </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                  <Button 
                    onClick={handleSearch}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground py-6"
                    size="lg"
                  >
                    Search Buses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Popular Routes */}
      {selectedState && (
        <div className="py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <PopularRoutes />
          </div>
        </div>
      )}

      {/* Offers Section */}
      <div className="py-16 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map((offer, index) => (
              <Card key={index} className="bg-gradient-to-br from-primary to-accent text-primary-foreground hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="text-3xl font-bold mb-2">{offer.discount} OFF</div>
                  <h3 className="text-xl font-semibold mb-2">{offer.title}</h3>
                  <p className="text-primary-foreground/80">{offer.description}</p>
                  <Button variant="secondary" className="mt-4 w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

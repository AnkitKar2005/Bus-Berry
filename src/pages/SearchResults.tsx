
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Clock, Star, Users, Wifi, Car } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState({
    ac: false,
    nonAc: false,
    sleeper: false,
    seater: false,
  });

  const buses = [
    {
      id: 1,
      operator: "Luxury Express",
      type: "AC Sleeper",
      departureTime: "10:30 PM",
      arrivalTime: "6:30 AM",
      duration: "8h 0m",
      price: 89,
      rating: 4.5,
      totalRatings: 234,
      amenities: ["Wifi", "AC", "Blanket", "Water Bottle"],
      availableSeats: 12,
      totalSeats: 40,
    },
    {
      id: 2,
      operator: "City Connect",
      type: "AC Seater",
      departureTime: "7:00 AM",
      arrivalTime: "3:00 PM",
      duration: "8h 0m",
      price: 65,
      rating: 4.2,
      totalRatings: 156,
      amenities: ["AC", "Music", "Charging Point"],
      availableSeats: 8,
      totalSeats: 35,
    },
    {
      id: 3,
      operator: "Royal Travels",
      type: "Non-AC Sleeper",
      departureTime: "11:00 PM",
      arrivalTime: "7:00 AM",
      duration: "8h 0m",
      price: 45,
      rating: 3.8,
      totalRatings: 89,
      amenities: ["Blanket", "Water Bottle"],
      availableSeats: 18,
      totalSeats: 42,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Summary */}
        <div className="bg-card p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-primary mr-2" />
                <span className="font-semibold">{from}</span>
              </div>
              <div className="w-8 h-px bg-border"></div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-accent mr-2" />
                <span className="font-semibold">{to}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <span>{date}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {buses.length} buses found
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Bus Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="ac" 
                          checked={filters.ac}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, ac: !!checked }))
                          }
                        />
                        <label htmlFor="ac" className="text-sm">AC</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="nonAc" 
                          checked={filters.nonAc}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, nonAc: !!checked }))
                          }
                        />
                        <label htmlFor="nonAc" className="text-sm">Non-AC</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Seat Type</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="sleeper" 
                          checked={filters.sleeper}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, sleeper: !!checked }))
                          }
                        />
                        <label htmlFor="sleeper" className="text-sm">Sleeper</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="seater" 
                          checked={filters.seater}
                          onCheckedChange={(checked) => 
                            setFilters(prev => ({ ...prev, seater: !!checked }))
                          }
                        />
                        <label htmlFor="seater" className="text-sm">Seater</label>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Available Buses</h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price (Low to High)</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="departure">Departure Time</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bus List */}
            {buses.map((bus) => (
              <Card key={bus.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bus Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{bus.operator}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {bus.type}
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="font-medium">{bus.rating}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            ({bus.totalRatings})
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                          <div className="font-semibold text-lg">{bus.departureTime}</div>
                          <div className="text-sm text-muted-foreground">{from}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">{bus.duration}</div>
                          <div className="w-full h-px bg-border my-1"></div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-lg">{bus.arrivalTime}</div>
                          <div className="text-sm text-muted-foreground">{to}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {bus.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{bus.availableSeats} seats available</span>
                      </div>
                    </div>

                    {/* Price and Book */}
                    <div className="flex flex-col justify-between">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${bus.price}</div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>
                      <Link to={`/bus/${bus.id}`}>
                        <Button className="w-full mt-4" size="lg">
                          Select Seats
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;

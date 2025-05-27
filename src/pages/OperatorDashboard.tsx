
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Bus, Users, Calendar, MapPin, Clock, Plus } from "lucide-react";
import Header from "@/components/Header";

const OperatorDashboard = () => {
  const [buses, setBuses] = useState([
    {
      id: 1,
      registration: "NY-1234",
      type: "AC Sleeper",
      capacity: 40,
      amenities: ["AC", "Wifi", "Charging"],
      status: "active",
    },
    {
      id: 2,
      registration: "NY-5678",
      type: "AC Seater",
      capacity: 35,
      amenities: ["AC", "Music"],
      status: "maintenance",
    },
  ]);

  const [schedules, setSchedules] = useState([
    {
      id: 1,
      busId: 1,
      route: "New York → Washington DC",
      departure: "10:30 PM",
      arrival: "6:30 AM",
      date: "2024-01-15",
      bookedSeats: 12,
      totalSeats: 40,
    },
    {
      id: 2,
      busId: 2,
      route: "Boston → Philadelphia",
      departure: "7:00 AM",
      arrival: "3:00 PM",
      date: "2024-01-16",
      bookedSeats: 8,
      totalSeats: 35,
    },
  ]);

  const stats = {
    totalEarnings: 15240,
    totalTrips: 48,
    totalBookings: 156,
    averageRating: 4.3,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Operator Dashboard</h1>
          <p className="text-gray-600">Manage your buses, routes, and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-green-600">${stats.totalEarnings.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold">{stats.totalTrips}</p>
                </div>
                <Bus className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.averageRating}/5</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="buses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="buses">Bus Management</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="buses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Your Buses</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Bus
              </Button>
            </div>

            <div className="grid gap-4">
              {buses.map((bus) => (
                <Card key={bus.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{bus.registration}</h3>
                          <Badge variant={bus.status === 'active' ? 'default' : 'secondary'}>
                            {bus.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{bus.type} • {bus.capacity} seats</p>
                        <div className="flex flex-wrap gap-1">
                          {bus.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Schedules</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>

            <div className="grid gap-4">
              {schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <MapPin className="h-4 w-4 text-blue-600 mr-1" />
                          <span className="font-medium">{schedule.route}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="text-sm">{schedule.date}</span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center mb-2">
                          <Clock className="h-4 w-4 text-green-600 mr-1" />
                          <span>Departure: {schedule.departure}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          <span className="text-sm">Arrival: {schedule.arrival}</span>
                        </div>
                      </div>

                      <div>
                        <div className="text-center">
                          <div className="font-semibold text-lg">
                            {schedule.bookedSeats}/{schedule.totalSeats}
                          </div>
                          <div className="text-sm text-gray-600">Seats Booked</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">View Bookings</Button>
                        <Button variant="outline" size="sm">Edit</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Booking management interface would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold text-green-600">$4,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Month:</span>
                      <span className="font-bold">$3,890</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span className="font-bold text-green-600">+9.3%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Occupancy:</span>
                      <span className="font-bold">76%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-time Performance:</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Rating:</span>
                      <span className="font-bold text-yellow-600">4.3/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OperatorDashboard;

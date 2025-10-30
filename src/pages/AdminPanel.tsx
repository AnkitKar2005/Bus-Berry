
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Bus, MapPin, DollarSign, TrendingUp, AlertCircle } from "lucide-react";
import Header from "@/components/Header";

const AdminPanel = () => {
  const [operators] = useState([
    {
      id: 1,
      name: "Luxury Express",
      email: "contact@luxuryexpress.com",
      phone: "+1-234-567-8900",
      totalBuses: 5,
      status: "approved",
      rating: 4.5,
      joinDate: "2023-06-15"
    },
    {
      id: 2,
      name: "City Connect",
      email: "info@cityconnect.com",
      phone: "+1-234-567-8901",
      totalBuses: 3,
      status: "pending",
      rating: 4.2,
      joinDate: "2023-12-01"
    },
  ]);

  const [coupons] = useState([
    {
      id: 1,
      code: "FIRST10",
      discount: 10,
      type: "percentage",
      maxUses: 1000,
      usedCount: 245,
      expiryDate: "2024-03-31",
      status: "active"
    },
    {
      id: 2,
      code: "SAVE20",
      discount: 20,
      type: "percentage",
      maxUses: 500,
      usedCount: 89,
      expiryDate: "2024-02-29",
      status: "active"
    },
  ]);

  const stats = {
    totalUsers: 1247,
    totalOperators: 23,
    totalBookings: 3456,
    totalRevenue: 234567,
    monthlyGrowth: 12.5,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, operators, and platform analytics</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Operators</p>
                  <p className="text-2xl font-bold">{stats.totalOperators}</p>
                </div>
                <Bus className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings.toLocaleString()}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Growth</p>
                  <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="operators" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="operators">Operators</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="coupons">Coupons</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="operators" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bus Operators</h2>
              <div className="flex gap-2">
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Search operators..." className="w-64" />
              </div>
            </div>

            <div className="grid gap-4">
              {operators.map((operator) => (
                <Card key={operator.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{operator.name}</h3>
                          <Badge variant={operator.status === 'approved' ? 'default' : 'secondary'}>
                            {operator.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>Email: {operator.email}</p>
                            <p>Phone: {operator.phone}</p>
                          </div>
                          <div>
                            <p>Total Buses: {operator.totalBuses}</p>
                            <p>Rating: {operator.rating}/5</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Joined: {new Date(operator.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {operator.status === 'pending' && (
                          <>
                            <Button size="sm" variant="default">Approve</Button>
                            <Button size="sm" variant="destructive">Reject</Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>User management interface would be displayed here</p>
                  <p className="text-sm">View, search, and manage passenger accounts</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Oversight</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Booking management interface would be displayed here</p>
                  <p className="text-sm">Monitor all bookings, handle disputes, and manage cancellations</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Coupon Management</h2>
              <Button>Create New Coupon</Button>
            </div>

            <div className="grid gap-4">
              {coupons.map((coupon) => (
                <Card key={coupon.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{coupon.code}</h3>
                          <Badge variant={coupon.status === 'active' ? 'default' : 'secondary'}>
                            {coupon.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>Discount: {coupon.discount}%</p>
                            <p>Expiry: {coupon.expiryDate}</p>
                          </div>
                          <div>
                            <p>Usage: {coupon.usedCount}/{coupon.maxUses}</p>
                            <p>Success Rate: {Math.round((coupon.usedCount / coupon.maxUses) * 100)}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">
                          {coupon.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold text-green-600">$45,230</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Month:</span>
                      <span className="font-bold">$40,125</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee:</span>
                      <span className="font-bold text-blue-600">$2,261</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span className="font-bold text-green-600">+12.7%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Popular Routes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>New York → Washington DC</span>
                      <span className="font-bold">245 bookings</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Los Angeles → San Francisco</span>
                      <span className="font-bold">189 bookings</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chicago → Detroit</span>
                      <span className="font-bold">156 bookings</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Miami → Orlando</span>
                      <span className="font-bold">134 bookings</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Average Rating:</span>
                      <span className="font-bold text-yellow-600">4.3/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-time Performance:</span>
                      <span className="font-bold text-green-600">89%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cancellation Rate:</span>
                      <span className="font-bold text-red-600">3.2%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customer Satisfaction:</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>2 operators pending approval</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>High cancellation rate on Route A-B</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-blue-500" />
                      <span>Payment gateway maintenance scheduled</span>
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

export default AdminPanel;

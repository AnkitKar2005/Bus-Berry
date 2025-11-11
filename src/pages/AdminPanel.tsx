import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Bus, MapPin, DollarSign, TrendingUp, AlertCircle, Shield, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPanel = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOperators: 0,
    totalBuses: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load buses
      const { data: busData } = await supabase
        .from('buses')
        .select(`
          *,
          operator:profiles!buses_operator_id_fkey(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      setBuses(busData || []);

      // Load users
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(userData || []);

      // Load stats
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: busCount } = await supabase
        .from('buses')
        .select('*', { count: 'exact', head: true });

      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      const { data: revenueData } = await supabase
        .from('bookings')
        .select('total_fare')
        .eq('status', 'confirmed');

      const totalRevenue = revenueData?.reduce((sum, b) => sum + Number(b.total_fare), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        totalOperators: busData?.filter(b => b.operator_id).length || 0,
        totalBuses: busCount || 0,
        totalBookings: bookingCount || 0,
        totalRevenue,
      });
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const approveBus = async (busId: string) => {
    try {
      const { error } = await supabase
        .from('buses')
        .update({ approval_status: 'approved' })
        .eq('id', busId);

      if (error) throw error;
      toast.success("Bus approved successfully");
      loadData();
    } catch (error) {
      console.error('Error approving bus:', error);
      toast.error("Failed to approve bus");
    }
  };

  const rejectBus = async (busId: string) => {
    try {
      const { error } = await supabase
        .from('buses')
        .update({ approval_status: 'rejected' })
        .eq('id', busId);

      if (error) throw error;
      toast.success("Bus rejected");
      loadData();
    } catch (error) {
      console.error('Error rejecting bus:', error);
      toast.error("Failed to reject bus");
    }
  };

  const deleteBus = async (busId: string) => {
    if (!confirm('Are you sure you want to delete this bus? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('buses')
        .delete()
        .eq('id', busId);

      if (error) throw error;
      toast.success("Bus deleted successfully");
      loadData();
    } catch (error) {
      console.error('Error deleting bus:', error);
      toast.error("Failed to delete bus");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user account?')) return;

    try {
      // Delete user profile (auth.users will be cascaded via trigger)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      toast.success("User account deleted");
      loadData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Failed to delete user");
    }
  };

  const filteredBuses = filterStatus === 'all' 
    ? buses 
    : buses.filter(b => b.approval_status === filterStatus);

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
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Buses</p>
                  <p className="text-2xl font-bold">{stats.totalBuses}</p>
                </div>
                <Bus className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                </div>
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-600" />
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
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="buses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="buses">Bus Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="buses" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Bus Management & Operator Approval</h2>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading buses...</div>
            ) : filteredBuses.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bus className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p className="text-muted-foreground">No buses found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredBuses.map((bus) => (
                  <Card key={bus.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{bus.bus_name}</h3>
                            <Badge variant={
                              bus.approval_status === 'approved' ? 'default' : 
                              bus.approval_status === 'rejected' ? 'destructive' : 
                              'secondary'
                            }>
                              {bus.approval_status}
                            </Badge>
                            {bus.is_active && <Badge variant="outline">Active</Badge>}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <p>Registration: {bus.registration_no}</p>
                              <p>Type: {bus.bus_type}</p>
                              <p>Operator: {bus.operator?.full_name || 'N/A'}</p>
                            </div>
                            <div>
                              <p>Total Seats: {bus.total_seats}</p>
                              <p>Fare/km: ${bus.fare_per_km}</p>
                              <p>Phone: {bus.operator?.phone || 'N/A'}</p>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            Registered: {new Date(bus.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {bus.approval_status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => approveBus(bus.id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => rejectBus(bus.id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteBus(bus.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">User & Operator Account Management</h2>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : users.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted" />
                  <p className="text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {users.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{user.full_name || 'N/A'}</h3>
                            <Badge>{user.role}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Phone: {user.phone || 'N/A'}</p>
                            <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                            {user.last_active && (
                              <p>Last Active: {new Date(user.last_active).toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => deleteUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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

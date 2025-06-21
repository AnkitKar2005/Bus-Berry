
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bus, MapPin, Clock, Users, Settings } from 'lucide-react';

interface Bus {
  id: string;
  bus_name: string;
  registration_no: string;
  bus_type: string;
  total_seats: number;
  fare_per_km: number;
  departure_time: string;
  arrival_time: string;
  features: string[];
  images: string[];
  is_active: boolean;
}

interface Route {
  id: string;
  source: string;
  destination: string;
  distance: number;
}

const OperatorBusList = () => {
  const { toast } = useToast();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Record<string, Route>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOperatorBuses();
  }, []);

  const fetchOperatorBuses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch buses
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .select('*')
        .eq('operator_id', user.id)
        .order('created_at', { ascending: false });

      if (busError) throw busError;

      setBuses(busData || []);

      // Fetch routes for schedules
      const { data: scheduleData, error: scheduleError } = await supabase
        .from('schedules')
        .select(`
          bus_id,
          routes (
            id,
            source,
            destination,
            distance
          )
        `)
        .in('bus_id', (busData || []).map(bus => bus.id));

      if (scheduleError) throw scheduleError;

      // Create routes lookup
      const routesLookup: Record<string, Route> = {};
      scheduleData?.forEach(schedule => {
        if (schedule.routes) {
          routesLookup[schedule.bus_id] = schedule.routes as Route;
        }
      });
      setRoutes(rout esLookup);

    } catch (error) {
      console.error('Error fetching buses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch buses",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBusStatus = async (busId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('buses')
        .update({ is_active: !currentStatus })
        .eq('id', busId);

      if (error) throw error;

      setBuses(prev => prev.map(bus => 
        bus.id === busId ? { ...bus, is_active: !currentStatus } : bus
      ));

      toast({
        title: "Success",
        description: `Bus ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating bus status:', error);
      toast({
        title: "Error",
        description: "Failed to update bus status",
        variant: "destructive"
      });
    }
  };

  const getBusTypeBadge = (type: string) => {
    const colors = {
      seater: 'bg-blue-100 text-blue-800',
      sleeper: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading buses...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Buses</h2>
        <Badge variant="outline">{buses.length} Total Buses</Badge>
      </div>

      {buses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bus className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No buses registered</h3>
            <p className="text-gray-500 mb-4">Start by registering your first bus</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {buses.map((bus) => {
            const route = routes[bus.id];
            return (
              <Card key={bus.id} className={`${bus.is_active ? '' : 'opacity-60'}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bus className="w-5 h-5" />
                        {bus.bus_name}
                        {getBusTypeBadge(bus.bus_type)}
                        <Badge variant={bus.is_active ? "default" : "secondary"}>
                          {bus.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {bus.registration_no}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleBusStatus(bus.id, bus.is_active)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {bus.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{bus.total_seats} Seats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">
                        {bus.departure_time} - {bus.arrival_time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">₹{bus.fare_per_km}/km</span>
                    </div>
                    {route && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">
                          {route.source} → {route.destination}
                        </span>
                      </div>
                    )}
                  </div>

                  {bus.features && bus.features.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {bus.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {bus.images && bus.images.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Images:</p>
                      <div className="grid grid-cols-4 gap-2">
                        {bus.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${bus.bus_name} ${index + 1}`}
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OperatorBusList;

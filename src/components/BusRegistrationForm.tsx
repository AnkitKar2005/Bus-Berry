import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const busRegistrationSchema = z.object({
  busName: z.string().trim().min(3, "Bus name must be at least 3 characters").max(100, "Bus name must be less than 100 characters"),
  registrationNo: z.string().trim().min(5, "Registration number must be at least 5 characters").max(20, "Registration number must be less than 20 characters"),
  totalSeats: z.number().int().min(10, "Must have at least 10 seats").max(100, "Cannot exceed 100 seats"),
  farePerKm: z.number().positive("Fare must be positive").max(100, "Fare per km cannot exceed ₹100"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  source: z.string().trim().min(2, "Source must be at least 2 characters").max(100, "Source must be less than 100 characters"),
  destination: z.string().trim().min(2, "Destination must be at least 2 characters").max(100, "Destination must be less than 100 characters"),
  distance: z.number().positive("Distance must be positive").max(5000, "Distance cannot exceed 5000 km"),
});

interface RouteStop {
  stopName: string;
  arrivalTime: string;
  departureTime: string;
  fareFromOrigin: number;
}

interface BusFormData {
  busName: string;
  registrationNo: string;
  busType: 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury';
  totalSeats: number;
  farePerKm: number;
  departureTime: string;
  arrivalTime: string;
  source: string;
  destination: string;
  distance: number;
  features: string[];
  images: string[];
}

const BusRegistrationForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [formData, setFormData] = useState<BusFormData>({
    busName: '',
    registrationNo: '',
    busType: 'ac',
    totalSeats: 40,
    farePerKm: 0,
    departureTime: '',
    arrivalTime: '',
    source: '',
    destination: '',
    distance: 0,
    features: [],
    images: []
  });

  const addRouteStop = () => {
    if (routeStops.length < 5) {
      setRouteStops([...routeStops, {
        stopName: '',
        arrivalTime: '',
        departureTime: '',
        fareFromOrigin: 0
      }]);
    }
  };

  const removeRouteStop = (index: number) => {
    setRouteStops(routeStops.filter((_, i) => i !== index));
  };

  const updateRouteStop = (index: number, field: keyof RouteStop, value: string | number) => {
    const updated = [...routeStops];
    updated[index] = { ...updated[index], [field]: value };
    setRouteStops(updated);
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadedImages = [];
    for (let i = 0; i < Math.min(files.length, 5 - formData.images.length); i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${file.name}`;
      
      try {
        const { data, error } = await supabase.storage
          .from('bus-images')
          .upload(fileName, file);
        
        if (error) {
          console.error('Upload error:', error);
          continue;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('bus-images')
          .getPublicUrl(fileName);
        
        uploadedImages.push(publicUrl);
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate form data
      try {
        busRegistrationSchema.parse({
          busName: formData.busName,
          registrationNo: formData.registrationNo,
          totalSeats: formData.totalSeats,
          farePerKm: formData.farePerKm,
          departureTime: formData.departureTime,
          arrivalTime: formData.arrivalTime,
          source: formData.source,
          destination: formData.destination,
          distance: formData.distance,
        });
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          toast({
            title: "Validation Error",
            description: validationError.errors[0].message,
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to register a bus",
          variant: "destructive"
        });
        return;
      }

      // Create route first
      const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert({
          source: formData.source,
          destination: formData.destination,
          distance: formData.distance
        })
        .select()
        .single();

      if (routeError) throw routeError;

      // Create bus with correct field names
      const { data: busData, error: busError } = await supabase
        .from('buses')
        .insert({
          bus_name: formData.busName,
          registration_no: formData.registrationNo,
          bus_type: formData.busType,
          total_seats: formData.totalSeats,
          fare_per_km: formData.farePerKm,
          departure_time: formData.departureTime,
          arrival_time: formData.arrivalTime,
          features: formData.features,
          images: formData.images
        })
        .select()
        .single();

      if (busError) throw busError;

      // Create schedule linking bus to route
      const { error: scheduleError } = await supabase
        .from('schedules')
        .insert({
          bus_id: busData.id,
          route_id: routeData.id,
          departure_time: formData.departureTime,
          arrival_time: formData.arrivalTime,
          departure_date: new Date().toISOString().split('T')[0], // Today's date as default
          base_price: formData.farePerKm * formData.distance,
          available_seats: formData.totalSeats
        });

      if (scheduleError) throw scheduleError;

      // Create route stops
      if (routeStops.length > 0) {
        const stopsData = routeStops.map((stop, index) => ({
          route_id: routeData.id,
          stop_name: stop.stopName,
          stop_order: index + 1,
          arrival_time: stop.arrivalTime,
          departure_time: stop.departureTime,
          fare_from_origin: stop.fareFromOrigin
        }));

        const { error: stopsError } = await supabase
          .from('route_stops')
          .insert(stopsData);

        if (stopsError) throw stopsError;
      }

      toast({
        title: "Success",
        description: "Bus registered successfully!"
      });

      // Reset form
      setFormData({
        busName: '',
        registrationNo: '',
        busType: 'ac',
        totalSeats: 40,
        farePerKm: 0,
        departureTime: '',
        arrivalTime: '',
        source: '',
        destination: '',
        distance: 0,
        features: [],
        images: []
      });
      setRouteStops([]);

    } catch (error) {
      console.error('Error registering bus:', error);
      toast({
        title: "Error",
        description: "Failed to register bus. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Register New Bus</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Bus Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="busName">Bus Name</Label>
              <Input
                id="busName"
                value={formData.busName}
                onChange={(e) => setFormData(prev => ({ ...prev, busName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="registrationNo">Registration Number</Label>
              <Input
                id="registrationNo"
                value={formData.registrationNo}
                onChange={(e) => setFormData(prev => ({ ...prev, registrationNo: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="busType">Bus Type</Label>
              <Select value={formData.busType} onValueChange={(value: 'ac' | 'non_ac' | 'sleeper' | 'semi_sleeper' | 'luxury') => 
                setFormData(prev => ({ ...prev, busType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ac">AC</SelectItem>
                  <SelectItem value="non_ac">Non AC</SelectItem>
                  <SelectItem value="sleeper">Sleeper</SelectItem>
                  <SelectItem value="semi_sleeper">Semi Sleeper</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="totalSeats">Total Seats</Label>
              <Input
                id="totalSeats"
                type="number"
                value={formData.totalSeats}
                onChange={(e) => setFormData(prev => ({ ...prev, totalSeats: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          <Separator />

          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Route Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="source">Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="distance">Distance (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={formData.distance}
                  onChange={(e) => setFormData(prev => ({ ...prev, distance: parseInt(e.target.value) }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Route Stops */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Route Stops (Max 5)</h3>
              <Button 
                type="button" 
                onClick={addRouteStop} 
                disabled={routeStops.length >= 5}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </div>
            {routeStops.map((stop, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Stop {index + 1}</h4>
                  <Button
                    type="button"
                    onClick={() => removeRouteStop(index)}
                    variant="outline"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Stop Name</Label>
                    <Input
                      value={stop.stopName}
                      onChange={(e) => updateRouteStop(index, 'stopName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Arrival Time</Label>
                    <Input
                      type="time"
                      value={stop.arrivalTime}
                      onChange={(e) => updateRouteStop(index, 'arrivalTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Departure Time</Label>
                    <Input
                      type="time"
                      value={stop.departureTime}
                      onChange={(e) => updateRouteStop(index, 'departureTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Fare from Origin (₹)</Label>
                    <Input
                      type="number"
                      value={stop.fareFromOrigin}
                      onChange={(e) => updateRouteStop(index, 'fareFromOrigin', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Timing and Fare */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Timing & Fare</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="arrivalTime">Arrival Time</Label>
                <Input
                  id="arrivalTime"
                  type="time"
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, arrivalTime: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="farePerKm">Fare per KM (₹)</Label>
                <Input
                  id="farePerKm"
                  type="number"
                  step="0.01"
                  value={formData.farePerKm}
                  onChange={(e) => setFormData(prev => ({ ...prev, farePerKm: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bus Features</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Add feature (e.g., WiFi, AC, Charging Point)"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <Button type="button" onClick={addFeature} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature) => (
                <Badge key={feature} variant="secondary" className="px-3 py-1">
                  {feature}
                  <Button
                    type="button"
                    onClick={() => removeFeature(feature)}
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bus Images (Max 5)</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <Label htmlFor="images" className="cursor-pointer">
                <span className="text-primary hover:text-primary/80">Click to upload images</span>
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </Label>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5 images</p>
            </div>
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Bus image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      onClick={() => removeImage(index)}
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Registering Bus...' : 'Register Bus'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusRegistrationForm;

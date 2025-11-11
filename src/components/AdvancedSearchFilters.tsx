import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Filter } from "lucide-react";

interface SearchFilters {
  minRating: number;
  maxPrice: number;
  amenities: string[];
  busTypes: string[];
}

interface AdvancedSearchFiltersProps {
  onFilterChange: (filters: SearchFilters) => void;
}

const AMENITIES = [
  'WiFi',
  'AC',
  'Charging Point',
  'Entertainment',
  'Restroom',
  'Snacks',
  'Water Bottle',
  'Reading Light'
];

const BUS_TYPES = ['Sleeper', 'Seater', 'Semi-Sleeper', 'Luxury'];

const AdvancedSearchFilters = ({ onFilterChange }: AdvancedSearchFiltersProps) => {
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedBusTypes, setSelectedBusTypes] = useState<string[]>([]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const toggleBusType = (type: string) => {
    setSelectedBusTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      minRating,
      maxPrice,
      amenities: selectedAmenities,
      busTypes: selectedBusTypes,
    });
  };

  const clearFilters = () => {
    setMinRating(0);
    setMaxPrice(1000);
    setSelectedAmenities([]);
    setSelectedBusTypes([]);
    onFilterChange({
      minRating: 0,
      maxPrice: 1000,
      amenities: [],
      busTypes: [],
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Advanced Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Filter */}
        <div>
          <Label className="flex items-center mb-3">
            <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-400" />
            Minimum Rating
          </Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[minRating]}
              onValueChange={(value) => setMinRating(value[0])}
              max={5}
              step={0.5}
              className="flex-1"
            />
            <Badge variant="outline">{minRating.toFixed(1)}+</Badge>
          </div>
        </div>

        {/* Price Filter */}
        <div>
          <Label className="mb-3 block">Maximum Price</Label>
          <div className="flex items-center gap-4">
            <Slider
              value={[maxPrice]}
              onValueChange={(value) => setMaxPrice(value[0])}
              max={1000}
              step={50}
              className="flex-1"
            />
            <Badge variant="outline">${maxPrice}</Badge>
          </div>
        </div>

        {/* Bus Type Filter */}
        <div>
          <Label className="mb-3 block">Bus Type</Label>
          <div className="space-y-2">
            {BUS_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={selectedBusTypes.includes(type)}
                  onCheckedChange={() => toggleBusType(type)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div>
          <Label className="mb-3 block">Amenities</Label>
          <div className="grid grid-cols-2 gap-2">
            {AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  id={`amenity-${amenity}`}
                  checked={selectedAmenities.includes(amenity)}
                  onCheckedChange={() => toggleAmenity(amenity)}
                />
                <label
                  htmlFor={`amenity-${amenity}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={clearFilters} variant="outline">
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearchFilters;
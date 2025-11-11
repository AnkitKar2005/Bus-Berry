import { useState, useEffect } from "react";
import { useLocation } from "@/contexts/LocationContext";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  state_id: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

const LocationAutocomplete = ({ value, onChange, placeholder }: LocationAutocompleteProps) => {
  const { selectedState } = useLocation();
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);

  useEffect(() => {
    if (selectedState) {
      fetchLocations();
    }
  }, [selectedState]);

  useEffect(() => {
    if (value) {
      const filtered = locations.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  }, [value, locations]);

  const fetchLocations = async () => {
    if (!selectedState) return;

    const result: any = await supabase
      .from("locations" as any)
      .select("*")
      .eq("state_id", selectedState.id)
      .order("name");

    if (result.error) {
      console.error("Error fetching locations:", result.error);
      return;
    }

    setLocations(result.data || []);
    setFilteredLocations(result.data || []);
  };

  const handleSelect = (locationName: string) => {
    onChange(locationName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="pl-10"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0 bg-background" align="start">
        <Command>
          <CommandList>
            <CommandEmpty>No locations found.</CommandEmpty>
            <CommandGroup>
              {filteredLocations.map((location) => (
                <CommandItem
                  key={location.id}
                  value={location.name}
                  onSelect={() => handleSelect(location.name)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {location.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default LocationAutocomplete;
